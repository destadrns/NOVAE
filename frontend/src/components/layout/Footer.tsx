import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Instagram, Disc as TikTok, Compass } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError(t.footer.validEmailError);
      return;
    }
    setError('');
    setIsSubscribed(true);
  };

  return (
    <footer className="bg-obsidian border-t border-white/10 text-bone pt-20 pb-12 overflow-hidden relative">
      {/* Background Subtle Gradient & Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-bone/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-white/10">
          {/* Brand & Manifesto Column */}
          <div className="md:col-span-5 space-y-6">
            <Link to="/" className="inline-block text-3xl sm:text-4xl font-extrabold tracking-widest font-display text-bone">
              NOVAÉ<span className="text-accent-lime">.</span>
            </Link>
            <p className="text-sm font-light text-bone-soft tracking-wider max-w-sm leading-relaxed">
              {t.footer.statement}
            </p>
            <p className="text-xs text-muted max-w-sm leading-relaxed font-sans">
              {t.footer.desc}
            </p>
          </div>

          {/* Navigation Links Column */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.25em] font-semibold text-bone-soft">
              {t.footer.navTitle}
            </h4>
            <ul className="space-y-3 text-xs tracking-widest uppercase">
              <li>
                <Link to="/shop" className="text-muted hover:text-accent-lime transition-colors">
                  {t.nav.shop}
                </Link>
              </li>
              <li>
                <Link to="/collections" className="text-muted hover:text-accent-lime transition-colors">
                  {t.nav.collections} (01 - 03)
                </Link>
              </li>
              <li>
                <Link to="/style-finder" className="text-muted hover:text-accent-lime transition-colors">
                  {t.nav.styleFinder}
                </Link>
              </li>
              <li>
                <Link to="/journal" className="text-muted hover:text-accent-lime transition-colors">
                  {t.nav.journal}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted hover:text-accent-lime transition-colors">
                  {t.nav.about}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.25em] font-semibold text-bone-soft">
              {t.footer.joinTitle}
            </h4>
            <p className="text-xs text-muted leading-relaxed">
              {t.footer.joinDesc}
            </p>

            {isSubscribed ? (
              <div className="p-4 bg-white/5 border border-accent-lime/40 text-accent-lime flex items-center gap-3 text-xs tracking-wider font-semibold">
                <Check className="w-4 h-4" />
                <span>{t.footer.subscribedMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex items-center border-b border-white/20 focus-within:border-accent-lime transition-colors pb-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.footer.emailPlaceholder}
                    className="w-full bg-transparent text-xs text-bone placeholder:text-muted/60 tracking-widest uppercase focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-1 text-bone hover:text-accent-lime transition-colors"
                    aria-label="Subscribe to newsletter"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                {error && <p className="text-[10px] text-red-400 tracking-wider uppercase">{error}</p>}
              </form>
            )}

            {/* Socials */}
            <div className="pt-4 flex items-center gap-6 text-muted text-xs tracking-widest">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-bone transition-colors flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5" />
                <span>INSTAGRAM</span>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="hover:text-bone transition-colors flex items-center gap-1.5">
                <TikTok className="w-3.5 h-3.5" />
                <span>TIKTOK</span>
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="hover:text-bone transition-colors flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>PINTEREST</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Giant Watermark & Copyright */}
        <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-muted-dark tracking-widest uppercase">
          <div>
            <span>{t.footer.rights}</span>
          </div>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-muted transition-colors">{t.footer.privacy}</Link>
            <Link to="/about" className="hover:text-muted transition-colors">{t.footer.terms}</Link>
            <Link to="/about" className="hover:text-muted transition-colors">{t.footer.sustainability}</Link>
          </div>
        </div>

        {/* Subtle Giant Typography Brandmark */}
        <div className="mt-12 text-center select-none pointer-events-none opacity-5">
          <span className="font-display font-black text-6xl sm:text-8xl md:text-9xl lg:text-[140px] tracking-[0.25em] text-white">
            NOVAÉ
          </span>
        </div>
      </div>
    </footer>
  );
};
