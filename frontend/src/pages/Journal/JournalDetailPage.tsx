import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { useLanguageStore } from '@/store/useLanguageStore';
import { apiGetArticleBySlug, FrontendArticle } from '@/lib/api';

export const JournalDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [article, setArticle] = useState<FrontendArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    apiGetArticleBySlug(slug, language).then(({ data, error: err }) => {
      if (data) {
        setArticle(data);
        setError(null);
      } else {
        setError(err?.message || 'Article not found');
      }
      setIsLoading(false);
    });
  }, [slug, language]);

  if (isLoading) {
    return (
      <div className="pt-28 pb-32 bg-obsidian text-bone min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-accent-lime animate-spin" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="pt-28 pb-32 bg-obsidian text-bone min-h-screen">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <Link
            to="/journal"
            className="inline-flex items-center gap-2 text-xs uppercase font-mono tracking-widest text-muted hover:text-bone transition-colors mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.journalDetailPage.backLink}</span>
          </Link>
          <div className="p-8 border border-dashed border-white/10 rounded-sm text-center bg-obsidian/40">
            <p className="text-xs font-mono text-muted-light">
              {error || (language === 'id' ? 'Artikel tidak ditemukan.' : 'Article not found.')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <article className="pt-28 pb-32 bg-obsidian text-bone min-h-screen">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        {/* Back navigation */}
        <div className="mb-10 flex items-center justify-between">
          <Link
            to="/journal"
            className="inline-flex items-center gap-2 text-xs uppercase font-mono tracking-widest text-muted hover:text-bone transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.journalDetailPage.backLink}</span>
          </Link>
          <span className="text-xs font-mono text-accent-lime uppercase tracking-widest">
            {article.category}
          </span>
        </div>

        {/* Title and metadata */}
        <div className="space-y-6 text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight uppercase leading-tight">
            {article.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-xs font-mono tracking-widest text-muted uppercase">
            <span>{article.author}</span>
            <span>•</span>
            <span>{publishedDate}</span>
            <span>•</span>
            <span>{article.readingTimeMinutes} MIN READ</span>
          </div>
        </div>

        {/* Hero Cover */}
        {article.coverImageUrl && (
          <div className="aspect-[16/9] bg-charcoal overflow-hidden border border-white/10 mb-14 relative">
            <img
              src={article.coverImageUrl}
              alt={article.title}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=1200&auto=format&fit=crop';
              }}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Body content */}
        <div className="space-y-8 text-sm sm:text-base text-bone-soft/90 font-light leading-relaxed max-w-2xl mx-auto">
          {article.excerpt && (
            <p className="font-serif italic text-xl text-bone leading-relaxed">
              &quot;{article.excerpt}&quot;
            </p>
          )}

          {article.content && (
            <div className="whitespace-pre-line">
              {article.content}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
