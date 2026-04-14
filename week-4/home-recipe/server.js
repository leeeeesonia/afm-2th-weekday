// Home Recipe — Express + Postgres (Supabase) backend
require('dotenv').config();

const express = require('express');
const path = require('path');
const { Pool } = require('pg');

// --- Required env: never fall back to a hardcoded secret ---
const DATABASE_URL = (process.env.DATABASE_URL || '').trim();
if (!DATABASE_URL) {
  console.error('FATAL: DATABASE_URL env var is required (set it in .env)');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// ---------- helpers ----------
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

async function upsertIngredientByName(client, { name, category = null, default_unit = null }) {
  const trimmed = String(name || '').trim();
  if (!trimmed) throw new Error('ingredient name is required');
  const q = `
    INSERT INTO ingredients_master (name, category, default_unit)
    VALUES ($1, $2, $3)
    ON CONFLICT (name) DO UPDATE
      SET category = COALESCE(EXCLUDED.category, ingredients_master.category),
          default_unit = COALESCE(EXCLUDED.default_unit, ingredients_master.default_unit)
    RETURNING id, name, category, default_unit
  `;
  const { rows } = await client.query(q, [trimmed, category, default_unit]);
  return rows[0];
}

async function loadRecipeById(client, id) {
  const r = await client.query(
    `SELECT id, name, description, servings, cook_time FROM recipes WHERE id = $1`,
    [id]
  );
  if (r.rows.length === 0) return null;
  const recipe = r.rows[0];
  const ings = await client.query(
    `SELECT ri.ingredient_id, im.name, ri.amount, ri.unit, ri.is_optional
       FROM recipe_ingredients ri
       JOIN ingredients_master im ON im.id = ri.ingredient_id
      WHERE ri.recipe_id = $1
      ORDER BY im.name`,
    [id]
  );
  const steps = await client.query(
    `SELECT description FROM recipe_steps WHERE recipe_id = $1 ORDER BY step_no ASC`,
    [id]
  );
  return {
    ...recipe,
    ingredients: ings.rows,
    steps: steps.rows.map((s) => s.description),
  };
}

// ============================================================
// Ingredients master
// ============================================================
app.get('/api/ingredients-master', wrap(async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT id, name, category, default_unit FROM ingredients_master ORDER BY name`
  );
  res.json(rows);
}));

app.post('/api/ingredients-master', wrap(async (req, res) => {
  const { name, category, default_unit } = req.body || {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  const row = await upsertIngredientByName(pool, { name, category, default_unit });
  res.status(201).json(row);
}));

// ============================================================
// Fridge items
// ============================================================
app.get('/api/fridge', wrap(async (_req, res) => {
  const { rows } = await pool.query(`
    SELECT f.id,
           f.ingredient_id,
           im.name,
           im.category,
           f.amount,
           f.unit,
           f.expiry_date
      FROM fridge_items f
      JOIN ingredients_master im ON im.id = f.ingredient_id
     ORDER BY f.added_at DESC
  `);
  res.json(rows);
}));

app.post('/api/fridge', wrap(async (req, res) => {
  const { name, amount = null, unit = null, expiry_date = null, category = null } = req.body || {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const ing = await upsertIngredientByName(client, { name, category, default_unit: unit });
    const ins = await client.query(
      `INSERT INTO fridge_items (ingredient_id, amount, unit, expiry_date)
       VALUES ($1, $2, $3, $4)
       RETURNING id, ingredient_id, amount, unit, expiry_date`,
      [ing.id, amount === '' ? null : amount, unit, expiry_date || null]
    );
    await client.query('COMMIT');
    res.status(201).json({
      id: ins.rows[0].id,
      ingredient_id: ing.id,
      name: ing.name,
      category: ing.category,
      amount: ins.rows[0].amount,
      unit: ins.rows[0].unit,
      expiry_date: ins.rows[0].expiry_date,
    });
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}));

app.delete('/api/fridge/:id', wrap(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'invalid id' });
  const r = await pool.query(`DELETE FROM fridge_items WHERE id = $1`, [id]);
  if (r.rowCount === 0) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
}));

// ============================================================
// Recipes
// ============================================================
app.get('/api/recipes', wrap(async (_req, res) => {
  const recipes = await pool.query(
    `SELECT id, name, description, servings, cook_time, created_at
       FROM recipes
      ORDER BY created_at DESC`
  );
  if (recipes.rows.length === 0) return res.json([]);

  const ids = recipes.rows.map((r) => r.id);
  const ings = await pool.query(
    `SELECT ri.recipe_id, ri.ingredient_id, im.name, ri.amount, ri.unit, ri.is_optional
       FROM recipe_ingredients ri
       JOIN ingredients_master im ON im.id = ri.ingredient_id
      WHERE ri.recipe_id = ANY($1::int[])
      ORDER BY im.name`,
    [ids]
  );
  const steps = await pool.query(
    `SELECT recipe_id, step_no, description
       FROM recipe_steps
      WHERE recipe_id = ANY($1::int[])
      ORDER BY recipe_id, step_no ASC`,
    [ids]
  );

  const ingByRecipe = new Map();
  for (const row of ings.rows) {
    if (!ingByRecipe.has(row.recipe_id)) ingByRecipe.set(row.recipe_id, []);
    ingByRecipe.get(row.recipe_id).push({
      ingredient_id: row.ingredient_id,
      name: row.name,
      amount: row.amount,
      unit: row.unit,
      is_optional: row.is_optional,
    });
  }
  const stepsByRecipe = new Map();
  for (const row of steps.rows) {
    if (!stepsByRecipe.has(row.recipe_id)) stepsByRecipe.set(row.recipe_id, []);
    stepsByRecipe.get(row.recipe_id).push(row.description);
  }

  res.json(
    recipes.rows.map((r) => ({
      ...r,
      ingredients: ingByRecipe.get(r.id) || [],
      steps: stepsByRecipe.get(r.id) || [],
    }))
  );
}));

app.get('/api/recipes/:id', wrap(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'invalid id' });
  const recipe = await loadRecipeById(pool, id);
  if (!recipe) return res.status(404).json({ error: 'not found' });
  res.json(recipe);
}));

app.post('/api/recipes', wrap(async (req, res) => {
  const {
    name,
    description = null,
    servings = null,
    cook_time = null,
    ingredients = [],
    steps = [],
  } = req.body || {};

  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: 'ingredients must be a non-empty array' });
  }
  if (!Array.isArray(steps) || steps.length === 0) {
    return res.status(400).json({ error: 'steps must be a non-empty array' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const r = await client.query(
      `INSERT INTO recipes (name, description, servings, cook_time)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [String(name).trim(), description, servings, cook_time]
    );
    const recipeId = r.rows[0].id;

    // dedupe ingredients by lowercased name (composite PK forbids dupes)
    const seen = new Set();
    for (const ing of ingredients) {
      if (!ing || !ing.name || !String(ing.name).trim()) continue;
      const key = String(ing.name).trim().toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const master = await upsertIngredientByName(client, {
        name: ing.name,
        default_unit: ing.unit || null,
      });
      await client.query(
        `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, is_optional)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          recipeId,
          master.id,
          ing.amount === '' || ing.amount === undefined ? null : ing.amount,
          ing.unit || null,
          !!ing.is_optional,
        ]
      );
    }

    let stepNo = 1;
    for (const s of steps) {
      const text = String(s || '').trim();
      if (!text) continue;
      await client.query(
        `INSERT INTO recipe_steps (recipe_id, step_no, description) VALUES ($1, $2, $3)`,
        [recipeId, stepNo++, text]
      );
    }

    await client.query('COMMIT');
    const full = await loadRecipeById(pool, recipeId);
    res.status(201).json(full);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}));

app.delete('/api/recipes/:id', wrap(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'invalid id' });
  const r = await pool.query(`DELETE FROM recipes WHERE id = $1`, [id]);
  if (r.rowCount === 0) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
}));

// ============================================================
// Recommendations — match recipes vs current fridge
// ============================================================
app.get('/api/recommendations', wrap(async (_req, res) => {
  const sql = `
    WITH fridge AS (
      SELECT DISTINCT ingredient_id FROM fridge_items
    ),
    required AS (
      SELECT recipe_id, ingredient_id, is_optional FROM recipe_ingredients
    ),
    stats AS (
      SELECT
        r.id,
        r.name,
        r.description,
        COUNT(*) FILTER (WHERE NOT req.is_optional) AS total_required,
        COUNT(*) FILTER (WHERE NOT req.is_optional AND f.ingredient_id IS NOT NULL) AS matched,
        ARRAY_REMOVE(
          ARRAY_AGG(
            CASE WHEN NOT req.is_optional AND f.ingredient_id IS NULL THEN im.name END
          ),
          NULL
        ) AS missing
      FROM recipes r
      JOIN required req ON req.recipe_id = r.id
      JOIN ingredients_master im ON im.id = req.ingredient_id
      LEFT JOIN fridge f ON f.ingredient_id = req.ingredient_id
      GROUP BY r.id, r.name, r.description
    )
    SELECT
      id,
      name,
      description,
      total_required,
      matched,
      missing,
      CASE WHEN total_required = 0 THEN 0
           ELSE ROUND((matched::numeric / total_required) * 100)::int
      END AS match_pct
    FROM stats
    ORDER BY match_pct DESC, array_length(missing, 1) NULLS FIRST, name
  `;
  const { rows } = await pool.query(sql);
  res.json(rows);
}));

// ============================================================
// SPA fallback (Express 5 wildcard)
// ============================================================
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================================
// Error handler — JSON only, log to stderr
// ============================================================
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[server error]', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Home Recipe server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
