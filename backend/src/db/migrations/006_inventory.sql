-- NOVAÉ Migration 006: Inventory
-- Per NOVAE_DATABASE_SCHEMA.md §7

-- §7.1 inventory
CREATE TABLE inventory (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id          uuid NOT NULL UNIQUE REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity_on_hand    integer NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
  reserved_quantity   integer NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  low_stock_threshold integer NOT NULL DEFAULT 3 CHECK (low_stock_threshold >= 0),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- §7.2 inventory_movements (Phase 2 but included for schema completeness)
CREATE TABLE inventory_movements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id      uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  movement_type   inventory_movement_type NOT NULL,
  quantity_delta   integer NOT NULL,
  reference_type  varchar(40),
  reference_id    uuid,
  note            text,
  created_by      uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);
