-- NOVAÉ Migration 013: Analytics Events
-- Per NOVAE_DATABASE_SCHEMA.md §15

-- §15.1 analytics_events
CREATE TABLE analytics_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES users(id) ON DELETE SET NULL,
  session_id  varchar(120),
  event_name  varchar(100) NOT NULL,
  entity_type varchar(60),
  entity_id   uuid,
  metadata    jsonb NOT NULL DEFAULT '{}',
  occurred_at timestamptz NOT NULL DEFAULT now()
);
