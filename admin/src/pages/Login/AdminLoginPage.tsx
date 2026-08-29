import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { useAdminTranslation } from '@/i18n/useAdminTranslation';
import { AdminLanguageSwitcher } from '@/components/ui/AdminLanguageSwitcher';
import { ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@novae.atelier');
  const [password, setPassword] = useState('novae2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAdminAuthStore();
  const { t } = useAdminTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.error || t.auth.errorInvalid);
      }
    } catch {
      setError(t.auth.errorInvalid);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('admin@novae.atelier');
    setPassword('novae2026');
    setError('');
  };

  return (
    <div className="min-h-screen bg-obsidian text-bone flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-lime/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Language Switcher Bar */}
      <div className="absolute top-6 right-6 z-20">
        <AdminLanguageSwitcher />
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-charcoal border border-surface-border rounded-sm shadow-2xl p-6 sm:p-8 space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-10 h-10 rounded-sm bg-accent-lime text-obsidian flex items-center justify-center font-bold text-base tracking-tighter shadow-[0_0_20px_rgba(216,255,0,0.25)]">
            NÉ
          </div>
          <h1 className="text-sm font-mono font-bold tracking-[0.3em] uppercase text-bone">
            {t.auth.loginTitle}
          </h1>
          <p className="text-xs font-sans text-muted">
            {t.auth.loginSubtitle}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-sm bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-[11px] font-mono uppercase tracking-widest text-muted"
            >
              {t.auth.emailLabel}
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-muted absolute left-3 pointer-events-none" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.emailPlaceholder}
                className="w-full bg-charcoal-dark border border-surface-border text-bone text-xs font-mono rounded-sm pl-9 pr-3 py-2.5 placeholder:text-muted/40 focus:outline-none focus:ring-1 focus:ring-accent-lime focus:border-accent-lime transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-[11px] font-mono uppercase tracking-widest text-muted"
              >
                {t.auth.passwordLabel}
              </label>
              <button
                type="button"
                onClick={handleDemoFill}
                className="text-[10px] font-mono uppercase tracking-wider text-accent-lime hover:underline"
              >
                {t.auth.demoKeyBtn}
              </button>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-muted absolute left-3 pointer-events-none" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-charcoal-dark border border-surface-border text-bone text-xs font-mono rounded-sm pl-9 pr-9 py-2.5 placeholder:text-muted/40 focus:outline-none focus:ring-1 focus:ring-accent-lime focus:border-accent-lime transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-muted hover:text-bone transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full mt-2"
          >
            {t.auth.submitBtn}
          </Button>
        </form>

        {/* Security Notice Footer */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] font-mono text-muted/60">
          <ShieldCheck className="w-3.5 h-3.5 text-accent-lime" />
          <span>{t.auth.securityNotice}</span>
        </div>
      </div>
    </div>
  );
};
