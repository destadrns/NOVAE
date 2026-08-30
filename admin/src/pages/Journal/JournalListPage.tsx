import React, { useEffect, useState, useCallback } from 'react';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAdminTranslation } from '@/i18n/useAdminTranslation';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import {
  BookOpen, Plus, Edit3, Eye, Trash2, Send, Archive, Search, Loader2, X,
} from 'lucide-react';
import {
  adminGetArticles,
  adminCreateArticle,
  adminUpdateArticle,
  adminPublishArticle,
  adminArchiveArticle,
  adminDeleteArticle,
  AdminArticle,
  AdminArticleTranslation,
} from '@/lib/api';

type StatusFilter = 'ALL' | 'draft' | 'published' | 'archived';

export const JournalListPage: React.FC = () => {
  const { t } = useAdminTranslation();
  const { token } = useAdminAuthStore();
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<AdminArticle | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<AdminArticle | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Editor form state
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formCover, setFormCover] = useState('');
  const [formReadTime, setFormReadTime] = useState(5);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formTitleId, setFormTitleId] = useState('');
  const [formExcerptId, setFormExcerptId] = useState('');
  const [formContentId, setFormContentId] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formExcerptEn, setFormExcerptEn] = useState('');
  const [formContentEn, setFormContentEn] = useState('');

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    const { data } = await adminGetArticles(token, statusFilter, searchTerm);
    if (data) setArticles(data.data);
    setIsLoading(false);
  }, [token, statusFilter, searchTerm]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const resetForm = () => {
    setFormSlug(''); setFormCategory(''); setFormCover(''); setFormReadTime(5); setFormFeatured(false);
    setFormTitleId(''); setFormExcerptId(''); setFormContentId('');
    setFormTitleEn(''); setFormExcerptEn(''); setFormContentEn('');
  };

  const openCreate = () => {
    setEditingArticle(null);
    resetForm();
    setEditorOpen(true);
  };

  const openEdit = (art: AdminArticle) => {
    setEditingArticle(art);
    setFormSlug(art.slug);
    setFormCategory(art.category);
    setFormCover(art.coverImageUrl || '');
    setFormReadTime(art.readingTimeMinutes);
    setFormFeatured(art.featured);
    const idTr = art.translations.find((t) => t.language === 'id');
    const enTr = art.translations.find((t) => t.language === 'en');
    setFormTitleId(idTr?.title || ''); setFormExcerptId(idTr?.excerpt || ''); setFormContentId(idTr?.content || '');
    setFormTitleEn(enTr?.title || ''); setFormExcerptEn(enTr?.excerpt || ''); setFormContentEn(enTr?.content || '');
    setEditorOpen(true);
  };

  const handleSave = async (asDraft = true) => {
    if (!formSlug || !formCategory || !formTitleId || !formContentId) return;
    setIsSaving(true);

    const translations: AdminArticleTranslation[] = [
      { language: 'id', title: formTitleId, excerpt: formExcerptId || null, content: formContentId },
    ];
    if (formTitleEn && formContentEn) {
      translations.push({ language: 'en', title: formTitleEn, excerpt: formExcerptEn || null, content: formContentEn });
    }

    if (editingArticle) {
      await adminUpdateArticle(token, editingArticle.id, {
        slug: formSlug,
        category: formCategory,
        coverImageUrl: formCover || undefined,
        readingTimeMinutes: formReadTime,
        featured: formFeatured,
        translations,
      });
    } else {
      await adminCreateArticle(token, {
        slug: formSlug,
        category: formCategory,
        coverImageUrl: formCover || undefined,
        readingTimeMinutes: formReadTime,
        status: asDraft ? 'draft' : 'published',
        featured: formFeatured,
        translations,
      });
    }

    setIsSaving(false);
    setEditorOpen(false);
    resetForm();
    fetchArticles();
  };

  const handlePublish = async (id: string) => {
    await adminPublishArticle(token, id);
    fetchArticles();
  };

  const handleArchive = async (id: string) => {
    await adminArchiveArticle(token, id);
    fetchArticles();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    await adminDeleteArticle(token, id);
    fetchArticles();
  };

  const statusBadgeVariant = (s: string) => {
    if (s === 'published') return 'emerald' as const;
    if (s === 'archived') return 'muted' as const;
    return 'amber' as const;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
          onClick={openCreate}
        >
          {t.journal.writeArticleBtn}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-sm pl-9 pr-3 py-2 text-xs font-mono text-bone placeholder:text-muted focus:border-accent-lime/50 focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-1.5">
          {(['ALL', 'draft', 'published', 'archived'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-sm text-[10px] uppercase tracking-wider font-mono transition-colors ${
                statusFilter === s
                  ? 'bg-accent-lime text-obsidian font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-muted-light border border-white/10'
              }`}
            >
              {s === 'ALL' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-5 h-5 text-accent-lime animate-spin" />
        </div>
      )}

      {/* Table */}
      {!isLoading && articles.length === 0 && (
        <div className="p-8 border border-dashed border-white/10 rounded-sm text-center bg-obsidian/40">
          <p className="text-xs font-mono text-muted-light">No articles found.</p>
        </div>
      )}

      {!isLoading && articles.length > 0 && (
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
                    <div>
                      <span className="block">{art.title}</span>
                      <span className="block text-[10px] text-muted font-normal">/{art.slug}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted">
                  {art.category}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted">
                  {art.readingTimeMinutes} min
                </TableCell>
                <TableCell className="font-mono text-xs text-bone">
                  {art.author}
                </TableCell>
                <TableCell className="font-mono text-[10px] text-muted">
                  {art.publishedAt
                    ? new Date(art.publishedAt).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })
                    : '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant(art.status)} size="sm">
                    {art.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      className="p-1.5 text-muted hover:text-bone hover:bg-white/5 rounded-sm transition-colors"
                      title="Preview"
                      onClick={() => { setPreviewArticle(art); setPreviewOpen(true); }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="p-1.5 text-muted hover:text-bone hover:bg-white/5 rounded-sm transition-colors"
                      title="Edit"
                      onClick={() => openEdit(art)}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {art.status === 'draft' && (
                      <button
                        className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-sm transition-colors"
                        title="Publish"
                        onClick={() => handlePublish(art.id)}
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {art.status === 'published' && (
                      <button
                        className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-sm transition-colors"
                        title="Archive"
                        onClick={() => handleArchive(art.id)}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-sm transition-colors"
                      title="Delete"
                      onClick={() => handleDelete(art.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Preview Drawer */}
      {previewOpen && previewArticle && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setPreviewOpen(false)} />
          <div className="relative w-full max-w-xl bg-charcoal border-l border-white/10 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono uppercase tracking-widest text-accent-lime font-bold">Article Preview</h2>
              <button onClick={() => setPreviewOpen(false)} className="p-1.5 text-muted hover:text-bone"><X className="w-4 h-4" /></button>
            </div>
            {previewArticle.coverImageUrl && (
              <div className="aspect-[16/9] bg-obsidian overflow-hidden border border-white/10">
                <img src={previewArticle.coverImageUrl} alt={previewArticle.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="space-y-2">
              <Badge variant={statusBadgeVariant(previewArticle.status)} size="sm">{previewArticle.status}</Badge>
              <h3 className="text-xl font-display font-bold uppercase text-bone">{previewArticle.title}</h3>
              <div className="flex items-center gap-3 text-[10px] font-mono text-muted uppercase tracking-widest">
                <span>{previewArticle.category}</span>
                <span>•</span>
                <span>{previewArticle.readingTimeMinutes} min read</span>
                <span>•</span>
                <span>{previewArticle.author}</span>
              </div>
              {previewArticle.excerpt && <p className="text-xs text-muted-light italic">&quot;{previewArticle.excerpt}&quot;</p>}
            </div>
            {previewArticle.translations.map((tr) => (
              <div key={tr.language} className="border border-white/10 rounded-sm p-4 space-y-2">
                <div className="text-[10px] font-mono text-accent-lime uppercase tracking-widest">{tr.language === 'id' ? 'Bahasa Indonesia' : 'English'}</div>
                <h4 className="text-sm font-bold text-bone">{tr.title}</h4>
                {tr.excerpt && <p className="text-xs text-muted-light italic">{tr.excerpt}</p>}
                <p className="text-xs text-bone-soft/80 whitespace-pre-line leading-relaxed">{tr.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Article Editor Modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setEditorOpen(false)} />
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-charcoal border border-white/10 rounded-sm overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-sm font-mono uppercase tracking-widest text-accent-lime font-bold">
                {editingArticle ? 'Edit Article' : 'Create Article'}
              </h2>
              <button onClick={() => setEditorOpen(false)} className="p-1.5 text-muted hover:text-bone"><X className="w-4 h-4" /></button>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted uppercase tracking-widest">Slug *</label>
                <input value={formSlug} onChange={(e) => setFormSlug(e.target.value)} placeholder="anatomy-of-form"
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-xs font-mono text-bone placeholder:text-muted focus:border-accent-lime/50 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted uppercase tracking-widest">Category *</label>
                <input value={formCategory} onChange={(e) => setFormCategory(e.target.value)} placeholder="Design Philosophy"
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-xs font-mono text-bone placeholder:text-muted focus:border-accent-lime/50 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted uppercase tracking-widest">Cover Image URL</label>
                <input value={formCover} onChange={(e) => setFormCover(e.target.value)} placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-xs font-mono text-bone placeholder:text-muted focus:border-accent-lime/50 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-muted uppercase tracking-widest">Read Time (min)</label>
                  <input type="number" value={formReadTime} onChange={(e) => setFormReadTime(Number(e.target.value))} min={1}
                    className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-xs font-mono text-bone focus:border-accent-lime/50 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-muted uppercase tracking-widest">Featured</label>
                  <button onClick={() => setFormFeatured(!formFeatured)}
                    className={`w-full px-3 py-2 rounded-sm text-xs font-mono border transition-colors ${
                      formFeatured ? 'bg-accent-lime/20 border-accent-lime/40 text-accent-lime' : 'bg-white/5 border-white/10 text-muted'
                    }`}>
                    {formFeatured ? 'YES' : 'NO'}
                  </button>
                </div>
              </div>
            </div>

            {/* Indonesian Translation */}
            <div className="space-y-3 border border-white/10 rounded-sm p-4">
              <h3 className="text-[10px] font-mono text-accent-lime uppercase tracking-widest font-bold">🇮🇩 Bahasa Indonesia *</h3>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted uppercase tracking-widest">Title *</label>
                <input value={formTitleId} onChange={(e) => setFormTitleId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-xs font-mono text-bone focus:border-accent-lime/50 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted uppercase tracking-widest">Excerpt</label>
                <input value={formExcerptId} onChange={(e) => setFormExcerptId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-xs font-mono text-bone focus:border-accent-lime/50 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted uppercase tracking-widest">Content *</label>
                <textarea value={formContentId} onChange={(e) => setFormContentId(e.target.value)} rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-xs font-mono text-bone focus:border-accent-lime/50 focus:outline-none resize-y" />
              </div>
            </div>

            {/* English Translation */}
            <div className="space-y-3 border border-white/10 rounded-sm p-4">
              <h3 className="text-[10px] font-mono text-accent-lime uppercase tracking-widest font-bold">🇬🇧 English (Optional)</h3>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted uppercase tracking-widest">Title</label>
                <input value={formTitleEn} onChange={(e) => setFormTitleEn(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-xs font-mono text-bone focus:border-accent-lime/50 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted uppercase tracking-widest">Excerpt</label>
                <input value={formExcerptEn} onChange={(e) => setFormExcerptEn(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-xs font-mono text-bone focus:border-accent-lime/50 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted uppercase tracking-widest">Content</label>
                <textarea value={formContentEn} onChange={(e) => setFormContentEn(e.target.value)} rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-xs font-mono text-bone focus:border-accent-lime/50 focus:outline-none resize-y" />
              </div>
            </div>

            {/* Save Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <Button variant="ghost" size="sm" onClick={() => setEditorOpen(false)}>Cancel</Button>
              <Button variant="secondary" size="sm" onClick={() => handleSave(true)} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save as Draft'}
              </Button>
              {!editingArticle && (
                <Button variant="primary" size="sm" onClick={() => handleSave(false)} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save & Publish'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
