-- NOVAÉ Migration 010: Payments and Shipments
-- Per NOVAE_DATABASE_SCHEMA.md §11, §12

-- §11.1 payments
CREATE TABLE payments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider            varchar(40) NOT NULL,
  provider_reference  varchar(160),
  method              varchar(60),
  amount_idr          bigint NOT NULL CHECK (amount_idr >= 0),
  status              payment_status NOT NULL DEFAULT 'pending',
  paid_at             timestamptz,
  raw_response        jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- §12.1 shipments
CREATE TABLE shipments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  courier         varchar(60),
  service         varchar(80),
  tracking_number varchar(120),
  status          shipment_status NOT NULL DEFAULT 'pending',
  shipped_at      timestamptz,
  delivered_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
