-- Home Recipe schema
DROP TABLE IF EXISTS recipe_steps CASCADE;
DROP TABLE IF EXISTS recipe_ingredients CASCADE;
DROP TABLE IF EXISTS fridge_items CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS ingredients_master CASCADE;

CREATE TABLE ingredients_master (
  id           SERIAL PRIMARY KEY,
  name         TEXT UNIQUE NOT NULL,
  category     TEXT,
  default_unit TEXT
);

CREATE TABLE fridge_items (
  id            SERIAL PRIMARY KEY,
  ingredient_id INTEGER NOT NULL REFERENCES ingredients_master(id) ON DELETE CASCADE,
  amount        REAL,
  unit          TEXT,
  expiry_date   DATE,
  added_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_fridge_ingredient ON fridge_items(ingredient_id);

CREATE TABLE recipes (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  servings    INTEGER DEFAULT 1,
  cook_time   INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE recipe_ingredients (
  recipe_id     INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id INTEGER NOT NULL REFERENCES ingredients_master(id) ON DELETE RESTRICT,
  amount        REAL,
  unit          TEXT,
  is_optional   BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (recipe_id, ingredient_id)
);

CREATE TABLE recipe_steps (
  recipe_id   INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_no     INTEGER NOT NULL,
  description TEXT NOT NULL,
  PRIMARY KEY (recipe_id, step_no)
);
