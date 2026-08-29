-- NOVAÉ Migration 011: Journal (Articles)
-- Per NOVAE_DATABASE_SCHEMA.md §13

-- §13.1 articles
CREATE TABLE articles (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  varchar(160) NOT NULL UNIQUE,
  category              varchar(80) NOT NULL,
  cover_image_url       text,
  author_user_id        uuid REFERENCES users(id) ON DELETE SET NULL,
  reading_time_minutes  smallint NOT NULL DEFAULT 5 CHECK (reading_time_minutes > 0),
  status                content_status NOT NULL DEFAULT 'draft',
  featured              boolean NOT NULL DEFAULT false,
  published_at          timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- §13.2 article_translations
CREATE TABLE article_translations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id  uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  language    language_code NOT NULL,
  title       varchar(200) NOT NULL,
  excerpt     text,
  content     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(article_id, language)
);
