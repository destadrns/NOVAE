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
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  initAuth: () => Promise<void>;
}

// Deterministic mock token for demo/local mode
function createMockJwt(userId: string, email: string, name: string) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: userId,
      email,
      name,
      exp: Math.floor(Date.now() / 1000) + 3600 * 24,
    }),
  );
  return `${header}.${payload}.mock-signature-local-dev`;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isAuthModalOpen: false,
  authModalMode: 'signin',

  openAuthModal: (mode = 'signin') => set({ isAuthModalOpen: true, authModalMode: mode }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

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
          return;
        }
      } else {
        const stored = localStorage.getItem('novae_customer_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          set({ user: parsed.user, token: parsed.token, isAuthenticated: true, isLoading: false });
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
        return { success: true };
      }
    }

    // Local / Demo mode fallback
    if (password.length >= 4) {
      const demoId = '00000000-0000-0000-0001-000000000001';
      const name = email.includes('aria') ? 'Aria Wirasasmita' : email.split('@')[0];
      const token = createMockJwt(demoId, email, name);
      const user: CustomerUser = {
        id: demoId,
        email,
        fullName: name,
        role: 'customer',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('novae_customer_session', JSON.stringify({ user, token }));
      set({ user, token, isAuthenticated: true, isAuthModalOpen: false });
      return { success: true };
    }

    return { success: false, error: 'Invalid password (must be at least 4 characters)' };
  },

  signUp: async (email, password, fullName) => {
    if (!email || !password || !fullName) {
      return { success: false, error: 'All fields are required' };
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.session && data.user) {
        const token = data.session.access_token;
        const { data: profile } = await fetchCurrentProfile(token);

        const user: CustomerUser = profile || {
          id: data.user.id,
          email: data.user.email || email,
          fullName,
          role: 'customer',
          status: 'active',
        };
        set({ user, token, isAuthenticated: true, isAuthModalOpen: false });
        return { success: true };
      }
    }

    // Local / Demo mode fallback
    const newId = '00000000-0000-0000-0001-000000000009';
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
    return { success: true };
  },

  signOut: async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('novae_customer_session');
    set({ user: null, token: null, isAuthenticated: false, isAuthModalOpen: false });
  },
}));
