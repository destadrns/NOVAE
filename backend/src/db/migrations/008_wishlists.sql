-- NOVAÉ Migration 008: Wishlists
-- Per NOVAE_DATABASE_SCHEMA.md §9

-- §9.1 wishlists
CREATE TABLE wishlists (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- §9.2 wishlist_items
CREATE TABLE wishlist_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id   uuid NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id    uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(wishlist_id, product_id)
);
