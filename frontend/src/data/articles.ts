export interface Article {
  id: string;
  slug: string;
  title: string;
  category: 'STYLE' | 'CULTURE' | 'DESIGN' | 'PEOPLE';
  date: string;
  readTime: string;
  excerpt: string;
  coverImage: string;
  author: string;
}

export const ARTICLES: Article[] = [
  {
    id: 'art-01',
    slug: 'the-art-of-wearing-less',
    title: 'The Art of Wearing Less',
    category: 'STYLE',
    date: 'OCTOBER 2026',
    readTime: '4 MIN READ',
    excerpt: 'Deconstructing modern wardrobe bloat. How reductive dressing unlocks sharper personal presence without aesthetic compromise.',
    coverImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    author: 'Elena Vance'
  },
  {
    id: 'art-02',
    slug: 'why-silhouette-matters',
    title: 'Why Silhouette Matters',
    category: 'DESIGN',
    date: 'SEPTEMBER 2026',
    readTime: '6 MIN READ',
    excerpt: 'Before color or fabric, the human eye reads silhouette. An exploration into brutalist architectural silhouettes in modern streetwear.',
    coverImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
    author: 'Marcus Chen'
  },
  {
    id: 'art-03',
    slug: 'inside-novae-form-01',
    title: 'Inside NOVAÉ: FORM 01',
    category: 'CULTURE',
    date: 'AUGUST 2026',
    readTime: '5 MIN READ',
    excerpt: 'A behind-the-scenes look at the pattern drafting, material sourcing, and prototype testing for our debut structural collection.',
    coverImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop',
    author: 'NOVAÉ Atelier'
  }
];
