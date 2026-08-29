import React from 'react';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAdminTranslation } from '@/i18n/useAdminTranslation';
import { BookOpen, Plus, Edit3 } from 'lucide-react';

export const JournalListPage: React.FC = () => {
  const { t } = useAdminTranslation();

  const articles = [
    {
      id: 'art-01',
      title: 'The Art of Wearing Less',
      slug: 'the-art-of-wearing-less',
      category: 'Philosophy',
      readTime: '4 min read',
      date: 'October 2026',
      status: t.status.published,
      author: 'NOVAÉ Editorial',
    },
    {
      id: 'art-02',
      title: 'Why Silhouette Comes First',
      slug: 'why-silhouette-comes-first',
      category: 'Design',
      readTime: '6 min read',
      date: 'September 2026',
      status: t.status.published,
      author: 'Atelier Direction',
    },
    {
      id: 'art-03',
      title: 'Inside NOVAÉ: FORM 01',
      slug: 'inside-novae-form-01',
      category: 'Craft',
      readTime: '5 min read',
      date: 'August 2026',
      status: t.status.published,
      author: 'Pattern Atelier',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-mono uppercase tracking-widest text-bone font-bold">
            {t.journal.title}
          </h1>
          <p className="text-xs font-sans text-muted mt-1">
            {t.journal.subtitle}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => alert('Article editor modal...')}
        >
          {t.journal.writeArticleBtn}
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>{t.journal.articleTitleCol}</TableHeaderCell>
            <TableHeaderCell>{t.journal.categoryCol}</TableHeaderCell>
            <TableHeaderCell>{t.journal.readTimeCol}</TableHeaderCell>
            <TableHeaderCell>{t.journal.authorCol}</TableHeaderCell>
            <TableHeaderCell>{t.journal.publishedDateCol}</TableHeaderCell>
            <TableHeaderCell>{t.journal.statusCol}</TableHeaderCell>
            <TableHeaderCell className="text-right">{t.journal.actionsCol}</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {articles.map((art) => (
            <TableRow key={art.id}>
              <TableCell className="font-mono text-xs font-semibold text-bone">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-muted" />
                  <span>{art.title}</span>
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted">
                {art.category}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted">
                {art.readTime}
              </TableCell>
              <TableCell className="font-mono text-xs text-bone">
                {art.author}
              </TableCell>
              <TableCell className="font-mono text-[10px] text-muted">
                {art.date}
              </TableCell>
              <TableCell>
                <Badge variant="emerald" size="sm">
                  {art.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    className="p-1.5 text-muted hover:text-bone hover:bg-white/5 rounded-sm transition-colors"
                    title="Edit"
                    aria-label="Edit Article"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
