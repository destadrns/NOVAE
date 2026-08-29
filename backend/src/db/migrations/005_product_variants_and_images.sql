-- NOVAÉ Migration 005: Product Variants, Images, Tags
-- Per NOVAE_DATABASE_SCHEMA.md §6.6, §6.7, §6.8, §6.9

-- §6.6 product_variants
CREATE TABLE product_variants (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id          uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku                 varchar(100) NOT NULL UNIQUE,
  color_name          varchar(80) NOT NULL,
  color_code          varchar(20),
  size                varchar(20) NOT NULL,
  price_override_idr  bigint CHECK (price_override_idr >= 0),
  status              variant_status NOT NULL DEFAULT 'active',
  image_url           text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, color_name, size)
);

-- §6.7 product_images
CREATE TABLE product_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id  uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  image_url   text NOT NULL,
  alt_text    varchar(255),
  sort_order  integer NOT NULL DEFAULT 0,
  is_primary  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- §6.8 product_tags
CREATE TABLE product_tags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        varchar(60) NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- §6.9 product_tag_map
CREATE TABLE product_tag_map (
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id      uuid NOT NULL REFERENCES product_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);
