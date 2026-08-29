-- NOVAÉ Migration 002: Users, Preferences, Addresses
-- Per NOVAE_DATABASE_SCHEMA.md §5

-- §5.1 users
CREATE TABLE users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           citext NOT NULL UNIQUE,
  full_name       varchar(120) NOT NULL,
  role            user_role NOT NULL DEFAULT 'customer',
  status          user_status NOT NULL DEFAULT 'active',
  avatar_url      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  last_login_at   timestamptz
);

-- §5.2 user_preferences
CREATE TABLE user_preferences (
  user_id          uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  language         language_code NOT NULL DEFAULT 'id',
  marketing_opt_in boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- §5.3 addresses
CREATE TABLE addresses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label           varchar(40),
  recipient_name  varchar(120) NOT NULL,
  phone           varchar(30) NOT NULL,
  address_line1   text NOT NULL,
  address_line2   text,
  city            varchar(100) NOT NULL,
  province        varchar(100) NOT NULL,
  postal_code     varchar(20) NOT NULL,
  country_code    char(2) NOT NULL DEFAULT 'ID',
  is_default      boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
