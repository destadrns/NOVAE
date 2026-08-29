-- NOVAÉ Migration 004: Products and Translations
-- Per NOVAE_DATABASE_SCHEMA.md §6.4, §6.5

-- §6.4 products
CREATE TABLE products (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_root          varchar(80) NOT NULL UNIQUE,
  slug              varchar(160) NOT NULL UNIQUE,
  category_id       uuid NOT NULL REFERENCES categories(id),
  collection_id     uuid REFERENCES collections(id),
  base_price_idr    bigint NOT NULL CHECK (base_price_idr >= 0),
  status            product_status NOT NULL DEFAULT 'draft',
  featured          boolean NOT NULL DEFAULT false,
  is_new_drop       boolean NOT NULL DEFAULT false,
  limited_run       boolean NOT NULL DEFAULT false,
  featured_rank     integer,
  primary_image_url text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- §6.5 product_translations
CREATE TABLE product_translations (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id            uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  language              language_code NOT NULL,
  name                  varchar(160) NOT NULL,
  short_description     text,
  description           text,
  material_description  text,
  provenance_text       text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, language)
);
