import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ARTICLES } from '@/data/articles';
import { useTranslation } from '@/i18n/useTranslation';

export const JournalDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const rawArticle = ARTICLES.find((a) => a.slug === slug) || ARTICLES[0];
  const { t, getLocalizedArticle } = useTranslation();
  const article = getLocalizedArticle(rawArticle);

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
            <span>{t.journalDetailPage.byAuthor.replace('{author}', article.author)}</span>
            <span>•</span>
            <span>{article.date}</span>
            <span>•</span>
            <span>{article.readTime}</span>
          </div>
        </div>

        {/* Hero Cover */}
        <div className="aspect-[16/9] bg-charcoal overflow-hidden border border-white/10 mb-14">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Body content */}
        <div className="space-y-8 text-sm sm:text-base text-bone-soft/90 font-light leading-relaxed max-w-2xl mx-auto">
          <p className="font-serif italic text-xl text-bone leading-relaxed">
            &quot;{article.excerpt}&quot;
          </p>

          <p>
            {t.journalDetailPage.p1}
          </p>

          <h2 className="text-2xl font-display font-bold uppercase text-bone pt-6">
            {t.journalDetailPage.h2}
          </h2>

          <p>
            {t.journalDetailPage.p2}
          </p>

          <div className="p-8 bg-charcoal border-l-2 border-accent-lime my-8 space-y-2">
            <p className="text-xs font-mono tracking-widest text-accent-lime uppercase">
              {t.journalDetailPage.keyPrinciple}
            </p>
            <p className="font-serif italic text-lg text-bone">
              {t.journalDetailPage.keyPrincipleQuote}
            </p>
          </div>

          <p>
            {t.journalDetailPage.p3}
          </p>
        </div>
      </div>
    </article>
  );
};
