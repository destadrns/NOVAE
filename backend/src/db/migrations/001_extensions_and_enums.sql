-- NOVAÉ Migration 001: Extensions and Enums
-- Per NOVAE_DATABASE_SCHEMA.md §16

-- Enable citext extension for case-insensitive email
CREATE EXTENSION IF NOT EXISTS "citext";

-- Enable uuid-ossp for gen_random_uuid fallback (pg14+ has it built-in)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- §16.1 language_code
CREATE TYPE language_code AS ENUM ('id', 'en');

-- §16.2 user_role
CREATE TYPE user_role AS ENUM ('customer', 'admin');

-- §16.3 user_status
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');

-- §16.4 product_status
CREATE TYPE product_status AS ENUM ('draft', 'active', 'archived');

-- §16.5 variant_status
CREATE TYPE variant_status AS ENUM ('active', 'inactive', 'out_of_stock');

-- §16.6 content_status
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');

-- §16.7 cart_status
CREATE TYPE cart_status AS ENUM ('active', 'converted', 'abandoned', 'expired');

-- §16.8 order_status
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled');

-- §16.9 payment_status
CREATE TYPE payment_status AS ENUM ('pending', 'authorized', 'paid', 'failed', 'refunded', 'partially_refunded');

-- §16.10 fulfillment_status
CREATE TYPE fulfillment_status AS ENUM ('unfulfilled', 'processing', 'fulfilled', 'cancelled');

-- §16.11 shipment_status
CREATE TYPE shipment_status AS ENUM ('pending', 'packed', 'shipped', 'in_transit', 'delivered', 'returned', 'failed');

-- §16.12 inventory_movement_type
CREATE TYPE inventory_movement_type AS ENUM ('purchase', 'sale', 'reservation', 'release', 'restock', 'adjustment', 'return');
