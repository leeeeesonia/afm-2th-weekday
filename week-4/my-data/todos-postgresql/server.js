// ============================================================
// Todos PostgreSQL (Supabase) Server
// ------------------------------------------------------------
// Stack: Express + pg
// Tables (public schema):
//   users(id, name, email, created_at)
//   todos(id, title, completed, user_id -> users.id, created_at)
// ============================================================

require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Database ----------
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required. Set it in .env (local) or via `vercel env add DATABASE_URL` (deploy).');
}
const CONNECTION_STRING = process.env.DATABASE_URL.trim();

const pool = new Pool({
  connectionString: CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

// Lazy init: ensure tables exist before first DB request (cold-start friendly).
let dbInitialized = false;
async function initDB() {
  if (dbInitialized) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  dbInitialized = true;
}

// ---------- Middleware ----------
app.use(express.json());
app.use(express.static(__dirname));

app.use('/api', async (_req, res, next) => {
  try {
    await initDB();
    next();
  } catch (err) {
    console.error('initDB failed:', err);
    res.status(500).json({ success: false, message: 'Database initialization failed' });
  }
});

// ---------- Helpers ----------
const TODO_WITH_USER_SQL = `
  SELECT
    t.id,
    t.title,
    t.completed,
    t.user_id,
    t.created_at,
    u.name  AS user_name,
    u.email AS user_email
  FROM todos t
  LEFT JOIN users u ON u.id = t.user_id
`;

// ============================================================
// Routes — TODOS
// ============================================================

// GET /api/todos — all todos joined with owning user
app.get('/api/todos', async (_req, res) => {
  try {
    const { rows } = await pool.query(`${TODO_WITH_USER_SQL} ORDER BY t.id ASC`);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('GET /api/todos:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/todos/:id — single todo with owner
app.get('/api/todos/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`${TODO_WITH_USER_SQL} WHERE t.id = $1`, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('GET /api/todos/:id:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/todos — create
app.post('/api/todos', async (req, res) => {
  try {
    const { title, user_id, completed = false } = req.body || {};
    if (!title || !user_id) {
      return res.status(400).json({ success: false, message: 'title and user_id are required' });
    }
    const inserted = await pool.query(
      `INSERT INTO todos (title, completed, user_id) VALUES ($1, $2, $3) RETURNING id`,
      [title, !!completed, user_id]
    );
    const { rows } = await pool.query(`${TODO_WITH_USER_SQL} WHERE t.id = $1`, [inserted.rows[0].id]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('POST /api/todos:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/todos/:id — update title and/or completed
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { title, completed } = req.body || {};
    if (title === undefined && completed === undefined) {
      return res.status(400).json({ success: false, message: 'Provide title or completed' });
    }
    const { rows } = await pool.query(
      `UPDATE todos
         SET title     = COALESCE($1, title),
             completed = COALESCE($2, completed)
       WHERE id = $3
       RETURNING id`,
      [title ?? null, completed ?? null, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }
    const full = await pool.query(`${TODO_WITH_USER_SQL} WHERE t.id = $1`, [rows[0].id]);
    res.json({ success: true, data: full.rows[0] });
  } catch (err) {
    console.error('PUT /api/todos/:id:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/todos/:id
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM todos WHERE id = $1`, [req.params.id]);
    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }
    res.json({ success: true, data: { id: Number(req.params.id) } });
  } catch (err) {
    console.error('DELETE /api/todos/:id:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// Routes — USERS
// ============================================================

// GET /api/users — list users with todo counts
app.get('/api/users', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        COUNT(t.id)::int AS todo_count
      FROM users u
      LEFT JOIN todos t ON t.user_id = u.id
      GROUP BY u.id, u.name, u.email
      ORDER BY u.id ASC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('GET /api/users:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Static / SPA fallback ----------
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ---------- Startup ----------
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\nTodos PostgreSQL server running on http://localhost:${PORT}`);
    console.log(`Try:`);
    console.log(`  curl http://localhost:${PORT}/api/todos`);
    console.log(`  curl http://localhost:${PORT}/api/users`);
    console.log(`Open http://localhost:${PORT}/ in your browser.\n`);
  });
}

module.exports = app;
