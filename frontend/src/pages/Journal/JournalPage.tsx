import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { useLanguageStore } from '@/store/useLanguageStore';
import { apiGetArticles, FrontendArticle } from '@/lib/api';

export const JournalPage: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [articles, setArticles] = useState<FrontendArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    apiGetArticles(language).then(({ data, error: err }) => {
      if (data) {
        setArticles(data.data);
        setError(null);
      } else {
        setError(err?.message || 'Failed to load articles');
      }
      setIsLoading(false);
    });
  }, [language]);

  const leadArticle = articles[0];
  const otherArticles = articles.slice(1);

  return (
    <div className="pt-28 pb-32 bg-obsidian text-bone min-h-screen">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="border-b border-white/10 pb-8 mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-accent-lime font-mono block mb-2">
            {t.journalPage.label}
          </span>
          <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight uppercase">
            {t.journalPage.title}
          </h1>
          <p className="text-sm text-muted-light mt-2 max-w-xl font-light">
            {t.journalPage.desc}
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-accent-lime animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="p-8 border border-dashed border-white/10 rounded-sm text-center bg-obsidian/40">
            <p className="text-xs font-mono text-muted-light">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && articles.length === 0 && (
          <div className="p-8 border border-dashed border-white/10 rounded-sm text-center bg-obsidian/40">
            <p className="text-xs font-mono text-muted-light">
              {language === 'id'
                ? 'Belum ada artikel jurnal yang dipublikasikan.'
                : 'No journal articles published yet.'}
            </p>
          </div>
        )}

        {/* Featured First Article */}
        {!isLoading && leadArticle && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-20 pb-16 border-b border-white/10">
            <div className="lg:col-span-7 aspect-[16/10] bg-charcoal overflow-hidden border border-white/10">
              <Link to={`/journal/${leadArticle.slug}`}>
                <img
                  src={leadArticle.coverImageUrl || ''}
                  alt={leadArticle.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </Link>
            </div>
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-3 text-xs font-mono tracking-widest text-muted">
                <span className="text-accent-lime">{leadArticle.category}</span>
                <span>•</span>
                <span>{leadArticle.readingTimeMinutes} MIN READ</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight uppercase">
                <Link to={`/journal/${leadArticle.slug}`} className="hover:text-accent-lime transition-colors">
                  {leadArticle.title}
                </Link>
              </h2>
              <p className="text-sm text-muted-light leading-relaxed font-light">
                {leadArticle.excerpt}
              </p>
              <div className="pt-2">
                <Link
                  to={`/journal/${leadArticle.slug}`}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-bone hover:text-accent-lime border-b border-white/20 pb-1"
                >
                  <span>{t.journalPage.readArticle}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Article Grid */}
        {!isLoading && otherArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {otherArticles.map((art) => (
              <div key={art.id} className="space-y-4">
                <div className="aspect-[4/3] bg-charcoal overflow-hidden border border-white/10">
                  <Link to={`/journal/${art.slug}`}>
                    <img
                      src={art.coverImageUrl || ''}
                      alt={art.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </Link>
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-muted tracking-widest">
                  <span className="text-accent-lime">{art.category}</span>
                  <span>{art.readingTimeMinutes} MIN READ</span>
                </div>
                <h3 className="text-xl font-display font-bold uppercase">
                  <Link to={`/journal/${art.slug}`} className="hover:text-accent-lime transition-colors">
                    {art.title}
                  </Link>
                </h3>
                <p className="text-xs text-muted leading-relaxed font-light">{art.excerpt}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
