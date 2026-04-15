-- 가계부 스키마
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name          text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id        bigserial PRIMARY KEY,
  user_id   uuid REFERENCES users(id) ON DELETE CASCADE,
  scope     text NOT NULL CHECK (scope IN ('business','personal')),
  type      text NOT NULL CHECK (type IN ('income','expense')),
  name      text NOT NULL,
  color     text,
  UNIQUE (user_id, scope, type, name)
);

CREATE TABLE IF NOT EXISTS recurring_rules (
  id                    bigserial PRIMARY KEY,
  user_id               uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scope                 text NOT NULL CHECK (scope IN ('business','personal')),
  type                  text NOT NULL CHECK (type IN ('income','expense')),
  category_id           bigint REFERENCES categories(id) ON DELETE SET NULL,
  amount                numeric(14,2) NOT NULL CHECK (amount > 0),
  memo                  text,
  start_date            date NOT NULL,
  end_date              date,
  last_generated_date   date,
  active                boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS entries (
  id                bigserial PRIMARY KEY,
  user_id           uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scope             text NOT NULL CHECK (scope IN ('business','personal')),
  type              text NOT NULL CHECK (type IN ('income','expense')),
  entry_date        date NOT NULL,
  amount            numeric(14,2) NOT NULL CHECK (amount > 0),
  category_id       bigint REFERENCES categories(id) ON DELETE SET NULL,
  memo              text,
  recurring_rule_id bigint REFERENCES recurring_rules(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz
);

CREATE INDEX IF NOT EXISTS idx_entries_user_date   ON entries (user_id, scope, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_entries_category    ON entries (user_id, category_id);

CREATE TABLE IF NOT EXISTS receipts (
  id           bigserial PRIMARY KEY,
  entry_id     bigint NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  file_name    text NOT NULL,
  mime_type    text,
  storage_url  text NOT NULL,
  file_size    integer,
  uploaded_at  timestamptz NOT NULL DEFAULT now()
);
