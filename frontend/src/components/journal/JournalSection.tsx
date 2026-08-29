import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, BookOpen, Clock, Sparkles, User } from 'lucide-react';
import { ARTICLES } from '@/data/articles';
import { useTranslation } from '@/i18n/useTranslation';

export const JournalSection: React.FC = () => {
  const { t, getLocalizedArticle } = useTranslation();
  const leadArticle = getLocalizedArticle(ARTICLES[0]);
  const sideArticles = ARTICLES.slice(1, 3).map(getLocalizedArticle);

  return (
    <section
      id="journal"
      className="py-24 sm:py-32 md:py-40 bg-charcoal-dark text-bone relative border-b border-white/5 overflow-hidden select-none"
    >
      {/* Ambient Atmospheric Lighting */}
      <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-accent-lime/[0.02] rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-bone/[0.02] rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs uppercase tracking-[0.3em] text-accent-lime font-mono">
                {t.journal.label}
              </span>
              <span className="text-white/20">•</span>
              <span className="text-[11px] font-mono tracking-widest text-muted uppercase">
                {t.journal.chronicles}
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight uppercase">
              {t.journal.title}
            </h2>
          </div>

          <Link
            to="/journal"
            className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-bone hover:text-accent-lime transition-colors py-2"
          >
            <span>{t.journal.exploreAll}</span>
            <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-accent-lime" />
          </Link>
        </div>

        {/* Editorial Asymmetric Articles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Lead Hero Essay (7 Columns) */}
          <motion.article
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 group flex flex-col justify-between space-y-6"
          >
            {/* Visual Cover Frame */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden bg-obsidian border border-white/10 shadow-2xl">
              <Link to={`/journal/${leadArticle.slug}`} className="block w-full h-full">
                <img
                  src={leadArticle.coverImage}
                  alt={leadArticle.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </Link>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

              {/* Lead Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3.5 py-1.5 border border-white/15 text-[10px] font-mono tracking-widest uppercase text-accent-lime">
                <Sparkles className="w-3 h-3" />
                <span>{t.journal.leadBadge}</span>
              </div>

              {/* Read Time Tag */}
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 border border-white/10 text-[9px] font-mono tracking-widest uppercase text-muted">
                <Clock className="w-3 h-3 text-accent-lime" />
                <span>{leadArticle.readTime}</span>
              </div>
            </div>

            {/* Editorial Content */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-mono tracking-widest uppercase text-muted">
                <span className="text-accent-lime font-bold">{leadArticle.category}</span>
                <span>•</span>
                <span>{leadArticle.date}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 shrink-0" />
                  {leadArticle.author}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black tracking-tight uppercase text-bone group-hover:text-accent-lime transition-colors">
                <Link to={`/journal/${leadArticle.slug}`} className="flex items-start justify-between gap-4">
                  <span>{leadArticle.title}</span>
                  <ArrowUpRight className="w-6 h-6 shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all text-accent-lime" />
                </Link>
              </h3>

              <p className="text-sm sm:text-base text-muted-light font-light leading-relaxed">
                {leadArticle.excerpt}
              </p>

              <div className="pt-2">
                <Link
                  to={`/journal/${leadArticle.slug}`}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-bone group-hover:text-accent-lime transition-colors border-b border-white/20 group-hover:border-accent-lime pb-1"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{t.journal.readFull}</span>
                </Link>
              </div>
            </div>
          </motion.article>

          {/* Secondary Curated Pair (5 Columns) */}
          <div className="lg:col-span-5 space-y-10">
            {sideArticles.map((article, idx) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.65, delay: (idx + 1) * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col sm:flex-row lg:flex-col gap-6 border-b border-white/10 pb-8 last:border-0 last:pb-0"
              >
                {/* Visual Thumbnail */}
                <div className="sm:w-1/2 lg:w-full aspect-[16/10] overflow-hidden bg-obsidian border border-white/10 relative shrink-0">
                  <Link to={`/journal/${article.slug}`} className="block w-full h-full">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </Link>

                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 border border-white/15 text-[9px] font-mono text-accent-lime uppercase tracking-widest">
                    ESSAY 0{idx + 2}
                  </div>

                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[8px] font-mono text-muted uppercase tracking-widest">
                    {article.readTime}
                  </div>
                </div>

                {/* Article Info */}
                <div className="sm:w-1/2 lg:w-full space-y-2.5">
                  <div className="flex items-center gap-2.5 text-[10px] font-mono tracking-widest text-muted uppercase">
                    <span className="text-accent-lime font-semibold">{article.category}</span>
                    <span>•</span>
                    <span>{article.date}</span>
                  </div>

                  <h4 className="text-lg sm:text-xl font-display font-bold tracking-tight uppercase text-bone group-hover:text-accent-lime transition-colors">
                    <Link to={`/journal/${article.slug}`} className="flex items-center justify-between gap-2">
                      <span>{article.title}</span>
                      <ArrowUpRight className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-accent-lime" />
                    </Link>
                  </h4>

                  <p className="text-xs text-muted-light font-light leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>

                  <div className="pt-1">
                    <Link
                      to={`/journal/${article.slug}`}
                      className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-bone-soft hover:text-accent-lime transition-colors"
                    >
                      <span>{t.journal.readEssay}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
