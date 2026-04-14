require('dotenv').config();

const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// --- Secrets: no hardcoded fallback ---
const DATABASE_URL = (process.env.DATABASE_URL || '').trim();
if (!DATABASE_URL) {
  console.error('[FATAL] DATABASE_URL is not set. Create a .env file with DATABASE_URL=...');
  process.exit(1);
}

const JWT_SECRET = (process.env.JWT_SECRET || '').trim();
if (!JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET is not set. Create a .env file with JWT_SECRET=...');
  process.exit(1);
}

const PORT = process.env.PORT || 3001;
const TODOS_TABLE = 'todo_app_01_todos';
const USERS_TABLE = 'todo_app_01_users';
const JWT_EXPIRES_IN = '7d';
const BCRYPT_COST = 10;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// --- DB init (lazy, idempotent) ---
// Note: the users table and user_id FK on todos were created out-of-band.
// This only guards against a missing todos table.
let dbInitialized = false;
async function initDB() {
  if (dbInitialized) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${TODOS_TABLE} (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  dbInitialized = true;
}

app.use('/api', async (_req, res, next) => {
  try {
    await initDB();
    next();
  } catch (err) {
    console.error('[DB init failed]', err);
    res.status(500).json({ success: false, message: 'Database initialization failed' });
  }
});

// --- Helpers ---
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function requireAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  try {
    const payload = jwt.verify(match[1], JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

// --- Auth routes ---

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    const emailStr = typeof email === 'string' ? email.trim() : '';
    const passwordStr = typeof password === 'string' ? password : '';
    const nameStr = typeof name === 'string' ? name.trim() : null;

    if (!EMAIL_RE.test(emailStr)) {
      return res.status(400).json({ success: false, message: '올바른 이메일 형식이 아닙니다.' });
    }
    if (passwordStr.length < 8) {
      return res.status(400).json({ success: false, message: '비밀번호는 8자 이상이어야 합니다.' });
    }

    const dup = await pool.query(
      `SELECT 1 FROM ${USERS_TABLE} WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [emailStr]
    );
    if (dup.rowCount > 0) {
      return res.status(409).json({ success: false, message: '이미 가입된 이메일입니다.' });
    }

    const passwordHash = await bcrypt.hash(passwordStr, BCRYPT_COST);
    const { rows } = await pool.query(
      `INSERT INTO ${USERS_TABLE} (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name`,
      [emailStr, passwordHash, nameStr]
    );
    const user = rows[0];
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    // Unique index on LOWER(email) safety net
    if (err && err.code === '23505') {
      return res.status(409).json({ success: false, message: '이미 가입된 이메일입니다.' });
    }
    console.error('[POST /api/auth/signup]', err);
    res.status(500).json({ success: false, message: '회원가입에 실패했습니다.' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const emailStr = typeof email === 'string' ? email.trim() : '';
    const passwordStr = typeof password === 'string' ? password : '';

    if (!emailStr || !passwordStr) {
      return res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const { rows } = await pool.query(
      `SELECT id, email, name, password_hash
         FROM ${USERS_TABLE}
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1`,
      [emailStr]
    );
    const user = rows[0];
    const ok = user && await bcrypt.compare(passwordStr, user.password_hash);
    if (!ok) {
      return res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const token = signToken(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('[POST /api/auth/login]', err);
    res.status(500).json({ success: false, message: '로그인에 실패했습니다.' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, email, name FROM ${USERS_TABLE} WHERE id = $1 LIMIT 1`,
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }
    res.json({ user: rows[0] });
  } catch (err) {
    console.error('[GET /api/auth/me]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/logout — no-op, client drops the token
app.post('/api/auth/logout', (_req, res) => {
  res.json({ success: true });
});

// --- Todos routes (all require auth, scoped by user_id) ---

app.use('/api/todos', requireAuth);

// GET /api/todos
app.get('/api/todos', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, text, completed, created_at
         FROM ${TODOS_TABLE}
        WHERE user_id = $1
        ORDER BY created_at DESC, id DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('[GET /api/todos]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/todos
app.post('/api/todos', async (req, res) => {
  try {
    const text = (req.body && req.body.text || '').trim();
    if (!text) {
      return res.status(400).json({ success: false, message: 'text is required' });
    }
    const { rows } = await pool.query(
      `INSERT INTO ${TODOS_TABLE} (text, user_id)
       VALUES ($1, $2)
       RETURNING id, text, completed, created_at`,
      [text, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[POST /api/todos]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/todos?completed=true
app.delete('/api/todos', async (req, res) => {
  try {
    if (req.query.completed === 'true') {
      const { rowCount } = await pool.query(
        `DELETE FROM ${TODOS_TABLE} WHERE completed = TRUE AND user_id = $1`,
        [req.user.id]
      );
      return res.json({ success: true, deleted: rowCount });
    }
    res.status(400).json({ success: false, message: 'Specify ?completed=true or use /api/todos/:id' });
  } catch (err) {
    console.error('[DELETE /api/todos]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/todos/:id
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }
    const { rowCount } = await pool.query(
      `DELETE FROM ${TODOS_TABLE} WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/todos/:id]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/todos/:id
app.patch('/api/todos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }
    const { text, completed } = req.body || {};
    const sets = [];
    const vals = [];
    let i = 1;
    if (typeof text === 'string') {
      sets.push(`text = $${i++}`);
      vals.push(text);
    }
    if (typeof completed === 'boolean') {
      sets.push(`completed = $${i++}`);
      vals.push(completed);
    }
    if (sets.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }
    vals.push(id, req.user.id);
    const { rows } = await pool.query(
      `UPDATE ${TODOS_TABLE}
          SET ${sets.join(', ')}
        WHERE id = $${i} AND user_id = $${i + 1}
        RETURNING id, text, completed, created_at`,
      vals
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('[PATCH /api/todos/:id]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Startup (dual-mode) ---
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
