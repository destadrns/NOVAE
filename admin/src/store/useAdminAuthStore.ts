import { create } from 'zustand';
import { AdminUser } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/api';

interface AdminAuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
}

const DEFAULT_ADMIN_USER: AdminUser = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'NOVAÉ Atelier Admin',
  email: 'admin@novae.atelier',
  role: 'SUPER_ADMIN',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
};

// Deterministic mock token for local dev/testing
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

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true,

  initAuth: async () => {
    try {
      if (isSupabaseConfigured) {
        const { data } = await supabase.auth.getSession();
        if (data.session && data.session.user) {
          const token = data.session.access_token;

          // Verify with backend
          const { data: dbUser, error: apiErr } = await verifyAdminSession(token);

          if (apiErr || !dbUser || dbUser.role !== 'admin') {
            // Not authorized or invalid session
            await supabase.auth.signOut();
            set({ isAuthenticated: false, user: null, token: null, isLoading: false });
            return;
          }

          const user: AdminUser = {
            id: dbUser.id,
            name: dbUser.fullName || 'NOVAÉ Atelier Admin',
            email: dbUser.email,
            role: 'SUPER_ADMIN',
            avatar: dbUser.avatarUrl || DEFAULT_ADMIN_USER.avatar,
          };

          set({ isAuthenticated: true, user, token, isLoading: false });
          return;
        }
      } else {
        const stored = localStorage.getItem('novae_admin_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          set({ isAuthenticated: true, user: parsed.user, token: parsed.token, isLoading: false });
          return;
        }
      }
    } catch {
      // Fall through
    }
    set({ isAuthenticated: false, user: null, token: null, isLoading: false });
  },

  login: async (email, password) => {
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

        // Server-authoritative check with backend /api/v1/admin/me
        const { data: dbUser, error: apiErr } = await verifyAdminSession(token);

        if (apiErr) {
          await supabase.auth.signOut();
          if (apiErr.statusCode === 403) {
            return {
              success: false,
              error: 'Akses ditolak (403 Forbidden): Akun ini tidak memiliki hak akses administrator atelier.',
            };
          }
          return {
            success: false,
            error: `Verifikasi backend gagal: ${Array.isArray(apiErr.message) ? apiErr.message.join(', ') : apiErr.message}`,
          };
        }

        if (!dbUser || dbUser.role !== 'admin') {
          await supabase.auth.signOut();
          return {
            success: false,
            error: 'Akses ditolak (403 Forbidden): Akun ini bukan administrator.',
          };
        }

        const user: AdminUser = {
          id: dbUser.id,
          name: dbUser.fullName || 'NOVAÉ Atelier Admin',
          email: dbUser.email || email,
          role: 'SUPER_ADMIN',
          avatar: dbUser.avatarUrl || DEFAULT_ADMIN_USER.avatar,
        };

        set({ isAuthenticated: true, user, token });
        return { success: true };
      }
    }

    // Local / Demo mode fallback
    if (email.includes('admin') && password.length >= 4) {
      const token = createMockJwt(DEFAULT_ADMIN_USER.id, email, DEFAULT_ADMIN_USER.name);
      localStorage.setItem('novae_admin_session', JSON.stringify({ user: DEFAULT_ADMIN_USER, token }));
      set({ isAuthenticated: true, user: DEFAULT_ADMIN_USER, token });
      return { success: true };
    }

    if (!email.includes('admin')) {
      return {
        success: false,
        error: 'Akses ditolak (403 Forbidden): Akun ini bukan administrator atelier.',
      };
    }

    return { success: false, error: 'Email atau kata sandi tidak valid.' };
  },

  logout: async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('novae_admin_session');
    set({ isAuthenticated: false, user: null, token: null });
  },
}));
