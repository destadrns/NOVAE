-- NOVAÉ Migration 009: Orders, Order Items, Order Status History
-- Per NOVAE_DATABASE_SCHEMA.md §10

-- §10.1 orders
CREATE TABLE orders (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number                varchar(40) NOT NULL UNIQUE,
  user_id                     uuid REFERENCES users(id) ON DELETE SET NULL,
  customer_email              citext NOT NULL,
  status                      order_status NOT NULL DEFAULT 'pending',
  payment_status              payment_status NOT NULL DEFAULT 'pending',
  fulfillment_status          fulfillment_status NOT NULL DEFAULT 'unfulfilled',
  subtotal_idr                bigint NOT NULL DEFAULT 0 CHECK (subtotal_idr >= 0),
  discount_idr                bigint NOT NULL DEFAULT 0 CHECK (discount_idr >= 0),
  shipping_idr                bigint NOT NULL DEFAULT 0 CHECK (shipping_idr >= 0),
  tax_idr                     bigint NOT NULL DEFAULT 0 CHECK (tax_idr >= 0),
  total_idr                   bigint NOT NULL DEFAULT 0 CHECK (total_idr >= 0),
  currency                    char(3) NOT NULL DEFAULT 'IDR',
  shipping_address_snapshot   jsonb NOT NULL,
  billing_address_snapshot    jsonb,
  placed_at                   timestamptz,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

-- §10.2 order_items
CREATE TABLE order_items (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id              uuid NOT NULL REFERENCES products(id),
  variant_id              uuid NOT NULL REFERENCES product_variants(id),
  product_name_snapshot   varchar(160) NOT NULL,
  sku_snapshot            varchar(100) NOT NULL,
  color_snapshot          varchar(80),
  size_snapshot           varchar(20),
  unit_price_idr          bigint NOT NULL CHECK (unit_price_idr >= 0),
  quantity                integer NOT NULL CHECK (quantity > 0),
  line_total_idr          bigint NOT NULL CHECK (line_total_idr >= 0),
  created_at              timestamptz NOT NULL DEFAULT now()
);

-- §10.3 order_status_history
CREATE TABLE order_status_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status order_status,
  to_status   order_status NOT NULL,
  note        text,
  changed_by  uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
