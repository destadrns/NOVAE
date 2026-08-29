-- NOVAÉ Migration 012: Style Finder
-- Per NOVAE_DATABASE_SCHEMA.md §14

-- §14.1 style_questions
CREATE TABLE style_questions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        varchar(60) NOT NULL UNIQUE,
  sort_order  integer NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- §14.2 style_question_translations
CREATE TABLE style_question_translations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id   uuid NOT NULL REFERENCES style_questions(id) ON DELETE CASCADE,
  language      language_code NOT NULL,
  question_text text NOT NULL,
  UNIQUE(question_id, language)
);

-- §14.3 style_options
CREATE TABLE style_options (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id     uuid NOT NULL REFERENCES style_questions(id) ON DELETE CASCADE,
  code            varchar(60) NOT NULL,
  score_metadata  jsonb,
  sort_order      integer NOT NULL DEFAULT 0,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(question_id, code)
);

-- §14.4 style_option_translations
CREATE TABLE style_option_translations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id   uuid NOT NULL REFERENCES style_options(id) ON DELETE CASCADE,
  language    language_code NOT NULL,
  label       varchar(120) NOT NULL,
  description text,
  UNIQUE(option_id, language)
);

-- §14.5 style_profiles
CREATE TABLE style_profiles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  archetype_code  varchar(80) NOT NULL,
  score           numeric(5,2) CHECK (score >= 0 AND score <= 100),
  answers         jsonb NOT NULL DEFAULT '{}',
  calculated_at   timestamptz NOT NULL DEFAULT now()
);

-- §14.6 recommendation_rules
CREATE TABLE recommendation_rules (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                varchar(120) NOT NULL,
  priority            integer NOT NULL DEFAULT 0,
  conditions          jsonb NOT NULL DEFAULT '{}',
  target_product_ids  jsonb NOT NULL DEFAULT '[]',
  is_active           boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
