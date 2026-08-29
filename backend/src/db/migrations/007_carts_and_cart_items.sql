-- NOVAÉ Migration 007: Carts and Cart Items
-- Per NOVAE_DATABASE_SCHEMA.md §8

-- §8.1 carts
CREATE TABLE carts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES users(id) ON DELETE SET NULL,
  session_key varchar(120) UNIQUE,
  status      cart_status NOT NULL DEFAULT 'active',
  currency    char(3) NOT NULL DEFAULT 'IDR',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- §8.2 cart_items
CREATE TABLE cart_items (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id                     uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  variant_id                  uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity                    integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_snapshot_idr     bigint NOT NULL CHECK (unit_price_snapshot_idr >= 0),
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(cart_id, variant_id)
);
