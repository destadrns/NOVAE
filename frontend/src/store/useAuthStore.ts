import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchCurrentProfile } from '@/lib/api';

export interface CustomerUser {
  id: string;
  email: string;
  fullName: string;
  role: 'customer' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  avatarUrl?: string | null;
  preferences?: {
    language: 'id' | 'en';
    marketingOptIn: boolean;
  } | null;
  createdAt?: string;
}

interface AuthState {
  user: CustomerUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  authModalReason: string | null;
  openAuthModal: (mode?: 'signin' | 'signup', reason?: string | null) => void;
  closeAuthModal: () => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  initAuth: () => Promise<void>;
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Deterministic mock token for demo/local mode
function createMockJwt(userId: string, email: string, name: string) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: userId,
      email,
      name,
      role: 'authenticated',
      aud: 'authenticated',
      iss: 'supabase',
      user_metadata: { full_name: name },
      exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 30,
    }),
  );
  return `${header}.${payload}.mock-signature-local-dev`;
}

import { useCartStore } from './useCartStore';
import { useWishlistStore } from './useWishlistStore';

// Helper to synchronize commerce state on login
const syncCommerceState = async (token: string) => {
  try {
    await useCartStore.getState().mergeGuestCart(token);
    await useCartStore.getState().fetchCart(token);
    await useWishlistStore.getState().fetchWishlist(token);
  } catch (err) {
    console.error('Failed to sync commerce state on auth change', err);
  }
};

// Helper to reset commerce state on signout
const resetCommerceState = async () => {
  try {
    useWishlistStore.setState({ items: [], wishlistIds: [] });
    await useCartStore.getState().fetchCart(null);
  } catch (err) {
    console.error('Failed to reset commerce state on signout', err);
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isAuthModalOpen: false,
  authModalMode: 'signin',
  authModalReason: null,

  openAuthModal: (mode = 'signin', reason = null) =>
    set({ isAuthModalOpen: true, authModalMode: mode, authModalReason: reason }),
  closeAuthModal: () => set({ isAuthModalOpen: false, authModalReason: null }),

  initAuth: async () => {
    try {
      if (isSupabaseConfigured) {
        const { data } = await supabase.auth.getSession();
        if (data.session && data.session.user) {
          const token = data.session.access_token;
          const { data: profile, error } = await fetchCurrentProfile(token);

          if (profile && !error) {
            set({
              user: profile,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
            syncCommerceState(token);
            return;
          }

          // If backend fails but supabase user is valid, fallback to supabase metadata
          const sbUser = data.session.user;
          const user: CustomerUser = {
            id: sbUser.id,
            email: sbUser.email || '',
            fullName: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Customer',
            role: 'customer',
            status: 'active',
          };
          set({ user, token, isAuthenticated: true, isLoading: false });
          syncCommerceState(token);
          return;
        }
      } else {
        const stored = localStorage.getItem('novae_customer_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          set({ user: parsed.user, token: parsed.token, isAuthenticated: true, isLoading: false });
          if (parsed.token) {
            syncCommerceState(parsed.token);
          }
          return;
        }
      }
    } catch {
      // Fall through
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  signIn: async (email, password) => {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.session && data.user) {
        const token = data.session.access_token;

        // Query backend for verified profile
        const { data: profile } = await fetchCurrentProfile(token);

        const user: CustomerUser = profile || {
          id: data.user.id,
          email: data.user.email || email,
          fullName: data.user.user_metadata?.full_name || email.split('@')[0],
          role: 'customer',
          status: 'active',
        };
        set({ user, token, isAuthenticated: true, isAuthModalOpen: false });
        syncCommerceState(token);
        return { success: true };
      }
    }

    // Local / Autonomous mode fallback
    if (password.length >= 4) {
      const stored = localStorage.getItem('novae_customer_session');
      let userId = generateUUID();
      let name = email.split('@')[0];
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.user?.email === email && parsed.user?.id) {
            userId = parsed.user.id;
            name = parsed.user.fullName || name;
          }
        } catch {
          // Ignore
        }
      }
      const token = createMockJwt(userId, email, name);
      const user: CustomerUser = {
        id: userId,
        email,
        fullName: name,
        role: 'customer',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('novae_customer_session', JSON.stringify({ user, token }));
      set({ user, token, isAuthenticated: true, isAuthModalOpen: false });
      syncCommerceState(token);
      return { success: true };
    }

    return { success: false, error: 'Invalid password (must be at least 4 characters)' };
  },

  signUp: async (email, password, fullName) => {
    if (!email || !password || !fullName) {
      return { success: false, error: 'All fields are required' };
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (!error && data.session && data.user) {
          const token = data.session.access_token;
          const { data: profile } = await fetchCurrentProfile(token);

          const user: CustomerUser = profile || {
            id: data.user.id,
            email: data.user.email || email,
            fullName,
            role: 'customer',
            status: 'active',
          };
          localStorage.setItem('novae_customer_session', JSON.stringify({ user, token }));
          set({ user, token, isAuthenticated: true, isAuthModalOpen: false });
          syncCommerceState(token);
          return { success: true };
        }
      } catch {
        // Fallback
      }
    }

    // Local / Autonomous mode fallback
    const newId = generateUUID();
    const token = createMockJwt(newId, email, fullName);
    const user: CustomerUser = {
      id: newId,
      email,
      fullName,
      role: 'customer',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('novae_customer_session', JSON.stringify({ user, token }));
    set({ user, token, isAuthenticated: true, isAuthModalOpen: false });
    syncCommerceState(token);
    return { success: true };
  },

  signOut: async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('novae_customer_session');
    set({ user: null, token: null, isAuthenticated: false, isAuthModalOpen: false });
    resetCommerceState();
  },
}));
