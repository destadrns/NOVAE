import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { X, Mail, Lock, User, LogOut, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    authModalReason,
    openAuthModal,
    user,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
  } = useAuthStore();
  const { language } = useLanguageStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const isId = language === 'id';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (authModalMode === 'signin') {
        const res = await signIn(email, password);
        if (!res.success) {
          setError(res.error || (isId ? 'Email atau kata sandi tidak valid' : 'Invalid email or password'));
        }
      } else {
        const res = await signUp(email, password, fullName);
        if (!res.success) {
          setError(res.error || (isId ? 'Gagal mendaftar' : 'Sign up failed'));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-charcoal border border-white/10 rounded-sm shadow-2xl p-6 sm:p-8 text-bone space-y-6">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-muted-light hover:text-bone hover:bg-white/5 rounded-full transition-colors"
          aria-label="Close Auth Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isAuthenticated && user ? (
          /* Profile & Logout View */
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-accent-lime text-obsidian flex items-center justify-center font-bold text-lg font-mono">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-base font-mono uppercase tracking-[0.2em] font-semibold text-bone">
                {user.fullName}
              </h2>
              <p className="text-xs font-mono text-muted-light">{user.email}</p>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-white/10 text-accent-lime border border-accent-lime/30">
                {user.role}
              </span>
            </div>

            <div className="p-4 bg-obsidian/60 border border-white/5 rounded-sm space-y-2 text-xs font-mono text-muted-light">
              <div className="flex justify-between">
                <span>{isId ? 'Status Akun' : 'Account Status'}:</span>
                <span className="text-bone uppercase">{user.status}</span>
              </div>
              <div className="flex justify-between">
                <span>{isId ? 'ID Pengguna' : 'User ID'}:</span>
                <span className="text-bone truncate max-w-[180px]">{user.id}</span>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-sm bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono uppercase tracking-widest transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>{isId ? 'Keluar dari Akun' : 'Sign Out'}</span>
            </button>
          </div>
        ) : (
          /* Sign In / Sign Up View */
          <div className="space-y-5">
            {/* Exclusive Access Reason Banner */}
            {authModalReason && (
              <div className="p-3.5 bg-accent-lime/10 border border-accent-lime/30 rounded-sm flex items-start gap-3 text-xs text-bone">
                <ShoppingBag className="w-4 h-4 text-accent-lime shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-accent-lime block font-bold">
                    {isId ? 'AKSES EKSKLUSIF ATELIER' : 'ATELIER ACCESS REQUIRED'}
                  </span>
                  <p className="text-bone-soft text-xs leading-relaxed">{authModalReason}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center text-center space-y-1">
              <div className="w-8 h-8 rounded-sm bg-accent-lime text-obsidian flex items-center justify-center font-bold text-xs tracking-tighter">
                NÉ
              </div>
              <h2 className="text-xs font-mono uppercase tracking-[0.24em] font-bold text-bone">
                {authModalMode === 'signin'
                  ? isId ? 'MASUK KE ATELIER' : 'SIGN IN TO ATELIER'
                  : isId ? 'BUAT AKUN ATELIER' : 'CREATE ATELIER ACCOUNT'}
              </h2>
              <p className="text-[11px] font-sans text-muted-light">
                {isId ? 'Akses eksklusif koleksi dan alokasi pesanan' : 'Exclusive access to collections & orders'}
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex border-b border-white/10">
              <button
                type="button"
                onClick={() => openAuthModal('signin')}
                className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider text-center border-b-2 transition-all ${
                  authModalMode === 'signin'
                    ? 'border-accent-lime text-accent-lime font-bold'
                    : 'border-transparent text-muted-light hover:text-bone'
                }`}
              >
                {isId ? 'Masuk' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('signup')}
                className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider text-center border-b-2 transition-all ${
                  authModalMode === 'signup'
                    ? 'border-accent-lime text-accent-lime font-bold'
                    : 'border-transparent text-muted-light hover:text-bone'
                }`}
              >
                {isId ? 'Daftar' : 'Sign Up'}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-sm text-rose-400 text-xs font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {authModalMode === 'signup' && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-light">
                    {isId ? 'Nama Lengkap' : 'Full Name'}
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-muted-light absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Aria Wirasasmita"
                      className="w-full bg-charcoal-dark border border-white/10 text-bone text-xs font-mono rounded-sm pl-9 pr-3 py-2 placeholder:text-white/20 focus:outline-none focus:border-accent-lime"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-light">
                  Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-muted-light absolute left-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@atelier.novae"
                    className="w-full bg-charcoal-dark border border-white/10 text-bone text-xs font-mono rounded-sm pl-9 pr-3 py-2 placeholder:text-white/20 focus:outline-none focus:border-accent-lime"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-light">
                  {isId ? 'Kata Sandi' : 'Password'}
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-muted-light absolute left-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-charcoal-dark border border-white/10 text-bone text-xs font-mono rounded-sm pl-9 pr-3 py-2 placeholder:text-white/20 focus:outline-none focus:border-accent-lime"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-sm bg-accent-lime text-obsidian text-xs font-mono font-bold uppercase tracking-wider hover:bg-accent-lime/90 transition-all disabled:opacity-50"
              >
                <span>{isLoading ? (isId ? 'Memproses...' : 'Processing...') : authModalMode === 'signin' ? (isId ? 'Masuk' : 'Sign In') : (isId ? 'Daftar' : 'Create Account')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="pt-2 border-t border-white/5 flex items-center justify-center gap-1.5 text-[10px] font-mono text-muted-light/60">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-lime" />
              <span>{isId ? 'Otentikasi Aman NOVAÉ & Supabase' : 'NOVAÉ Secure Supabase Auth'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
