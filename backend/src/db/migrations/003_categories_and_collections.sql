-- NOVAÉ Migration 003: Categories and Collections
-- Per NOVAE_DATABASE_SCHEMA.md §6.1, §6.2, §6.3

-- §6.1 categories
CREATE TABLE categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        varchar(120) NOT NULL UNIQUE,
  name        varchar(120) NOT NULL,
  description text,
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- §6.2 collections
CREATE TABLE collections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code            varchar(50) NOT NULL UNIQUE,
  slug            varchar(120) NOT NULL UNIQUE,
  name            varchar(120) NOT NULL,
  description     text,
  cover_image_url text,
  status          content_status NOT NULL DEFAULT 'draft',
  sort_order      integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- §6.3 collection_translations
CREATE TABLE collection_translations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id   uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  language        language_code NOT NULL,
  name            varchar(120) NOT NULL,
  description     text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(collection_id, language)
);
