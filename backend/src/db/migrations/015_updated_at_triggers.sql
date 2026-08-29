-- NOVAÉ Migration 015: Auto-update updated_at triggers
-- Per NOVAE_DATABASE_SCHEMA.md §2.4

-- Generic trigger function
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'users', 'user_preferences', 'addresses',
    'categories', 'collections', 'collection_translations',
    'products', 'product_translations',
    'product_variants',
    'inventory',
    'carts', 'cart_items',
    'wishlists',
    'orders',
    'payments', 'shipments',
    'articles', 'article_translations',
    'style_questions',
    'recommendation_rules'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();',
      tbl
    );
  END LOOP;
END;
$$;
