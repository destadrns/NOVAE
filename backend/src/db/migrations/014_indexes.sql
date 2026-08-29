-- NOVAÉ Migration 014: Recommended Indexes
-- Per NOVAE_DATABASE_SCHEMA.md §18

CREATE INDEX idx_products_status
  ON products(status);

CREATE INDEX idx_products_collection
  ON products(collection_id);

CREATE INDEX idx_products_category
  ON products(category_id);

CREATE INDEX idx_products_new_drop
  ON products(is_new_drop);

CREATE INDEX idx_product_variants_product
  ON product_variants(product_id);

-- Functional index on derived available_quantity expression
-- Schema §18 note: available_quantity is derived, use expression index
CREATE INDEX idx_inventory_low_stock
  ON inventory ((quantity_on_hand - reserved_quantity));

CREATE INDEX idx_carts_user
  ON carts(user_id);

CREATE INDEX idx_orders_user
  ON orders(user_id);

CREATE INDEX idx_orders_status
  ON orders(status);

CREATE INDEX idx_orders_created_at
  ON orders(created_at DESC);

CREATE INDEX idx_order_items_order
  ON order_items(order_id);

CREATE INDEX idx_articles_status_published
  ON articles(status, published_at DESC);

CREATE INDEX idx_analytics_events_name_time
  ON analytics_events(event_name, occurred_at DESC);
