// ============================================================
// Todos + Users API server (Node.js built-ins only)
// - http + node:sqlite + fs + path
// - Port 3003
// ============================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const PORT = 3003;
const DB_PATH = path.join(__dirname, 'todos.db');
const INDEX_PATH = path.join(__dirname, 'index.html');

// ------------------------------------------------------------
// DB init + migrations
// ------------------------------------------------------------
const db = new DatabaseSync(DB_PATH);

function migrate() {
  // 1. users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT
    );
  `);

  // 2. seed users if empty
  const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (userCount === 0) {
    const insertUser = db.prepare(
      'INSERT INTO users (id, name, emoji) VALUES (?, ?, ?)'
    );
    insertUser.run(1, '소니아', '🐱');
    insertUser.run(2, '민수', '🐶');
    insertUser.run(3, '지영', '🐰');
    console.log('[migrate] seeded 3 default users');
  }

  // 3. add user_id column to todos if missing
  const columns = db.prepare('PRAGMA table_info(todos)').all();
  const hasUserId = columns.some((col) => col.name === 'user_id');
  if (!hasUserId) {
    db.exec('ALTER TABLE todos ADD COLUMN user_id INTEGER REFERENCES users(id)');
    console.log('[migrate] added user_id column to todos');
  }

  // 4. distribute existing NULL user_id todos
  const nullTodos = db
    .prepare('SELECT id FROM todos WHERE user_id IS NULL ORDER BY id ASC')
    .all();
  if (nullTodos.length > 0) {
    const updateUser = db.prepare('UPDATE todos SET user_id = ? WHERE id = ?');
    // Mapping: ids 1,2 -> 1, 3,4 -> 2, 5 -> 3 (by position for safety)
    const mapping = [
      [1, 1],
      [2, 1],
      [3, 2],
      [4, 2],
      [5, 3],
    ];
    // Preferred: exact id mapping when those ids exist
    for (const [todoId, userId] of mapping) {
      updateUser.run(userId, todoId);
    }
    // Fallback: anything still NULL gets user 1
    db.exec('UPDATE todos SET user_id = 1 WHERE user_id IS NULL');
    console.log('[migrate] distributed existing todos to users');
  }
}

migrate();

// ------------------------------------------------------------
// Prepared statements
// ------------------------------------------------------------
const stmts = {
  allTodos: db.prepare(`
    SELECT t.id, t.title, t.completed,
           u.id AS u_id, u.name AS u_name, u.emoji AS u_emoji
    FROM todos t
    LEFT JOIN users u ON u.id = t.user_id
    ORDER BY t.id ASC
  `),
  todoById: db.prepare(`
    SELECT t.id, t.title, t.completed,
           u.id AS u_id, u.name AS u_name, u.emoji AS u_emoji
    FROM todos t
    LEFT JOIN users u ON u.id = t.user_id
    WHERE t.id = ?
  `),
  allUsers: db.prepare('SELECT id, name, emoji FROM users ORDER BY id ASC'),
  insertTodo: db.prepare(
    'INSERT INTO todos (title, completed, user_id) VALUES (?, 0, ?)'
  ),
  deleteTodo: db.prepare('DELETE FROM todos WHERE id = ?'),
  todoExists: db.prepare('SELECT id FROM todos WHERE id = ?'),
};

function rowToTodo(row) {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed === 1,
    user: row.u_id
      ? { id: row.u_id, name: row.u_name, emoji: row.u_emoji }
      : null,
  };
}

// ------------------------------------------------------------
// HTTP helpers
// ------------------------------------------------------------
function sendJSON(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function sendError(res, status, message) {
  sendJSON(res, status, { success: false, error: message });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function serveIndex(res) {
  fs.readFile(INDEX_PATH, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Failed to read index.html');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
}

// ------------------------------------------------------------
// Route handlers
// ------------------------------------------------------------
function handleGetTodos(_req, res) {
  try {
    const rows = stmts.allTodos.all();
    sendJSON(res, 200, { success: true, data: rows.map(rowToTodo) });
  } catch (err) {
    console.error(err);
    sendError(res, 500, 'Failed to fetch todos');
  }
}

function handleGetUsers(_req, res) {
  try {
    const rows = stmts.allUsers.all();
    sendJSON(res, 200, { success: true, data: rows });
  } catch (err) {
    console.error(err);
    sendError(res, 500, 'Failed to fetch users');
  }
}

async function handlePostTodo(req, res) {
  try {
    const body = await readBody(req);
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const userId = Number(body.user_id);
    if (!title) return sendError(res, 400, 'title is required');
    if (!Number.isInteger(userId))
      return sendError(res, 400, 'user_id must be an integer');

    const info = stmts.insertTodo.run(title, userId);
    const newId = Number(info.lastInsertRowid);
    const row = stmts.todoById.get(newId);
    sendJSON(res, 201, { success: true, data: rowToTodo(row) });
  } catch (err) {
    console.error(err);
    sendError(res, 400, err.message || 'Failed to create todo');
  }
}

async function handlePutTodo(req, res, id) {
  try {
    const existing = stmts.todoExists.get(id);
    if (!existing) return sendError(res, 404, 'Todo not found');

    const body = await readBody(req);
    const fields = [];
    const values = [];

    if (typeof body.title === 'string') {
      fields.push('title = ?');
      values.push(body.title);
    }
    if (typeof body.completed === 'boolean') {
      fields.push('completed = ?');
      values.push(body.completed ? 1 : 0);
    }
    if (body.user_id !== undefined) {
      const uid = Number(body.user_id);
      if (!Number.isInteger(uid))
        return sendError(res, 400, 'user_id must be an integer');
      fields.push('user_id = ?');
      values.push(uid);
    }

    if (fields.length === 0)
      return sendError(res, 400, 'No updatable fields provided');

    values.push(id);
    const sql = `UPDATE todos SET ${fields.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...values);

    const row = stmts.todoById.get(id);
    sendJSON(res, 200, { success: true, data: rowToTodo(row) });
  } catch (err) {
    console.error(err);
    sendError(res, 400, err.message || 'Failed to update todo');
  }
}

function handleDeleteTodo(_req, res, id) {
  try {
    const existing = stmts.todoExists.get(id);
    if (!existing) return sendError(res, 404, 'Todo not found');
    stmts.deleteTodo.run(id);
    sendJSON(res, 200, { success: true, data: { id } });
  } catch (err) {
    console.error(err);
    sendError(res, 500, 'Failed to delete todo');
  }
}

// ------------------------------------------------------------
// Router
// ------------------------------------------------------------
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;
  const method = req.method;

  // Static: index.html
  if (method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
    return serveIndex(res);
  }

  // API: /api/todos
  if (pathname === '/api/todos') {
    if (method === 'GET') return handleGetTodos(req, res);
    if (method === 'POST') return handlePostTodo(req, res);
    return sendError(res, 405, 'Method not allowed');
  }

  // API: /api/users
  if (pathname === '/api/users') {
    if (method === 'GET') return handleGetUsers(req, res);
    return sendError(res, 405, 'Method not allowed');
  }

  // API: /api/todos/:id
  const todoIdMatch = pathname.match(/^\/api\/todos\/(\d+)$/);
  if (todoIdMatch) {
    const id = Number(todoIdMatch[1]);
    if (method === 'PUT' || method === 'PATCH')
      return handlePutTodo(req, res, id);
    if (method === 'DELETE') return handleDeleteTodo(req, res, id);
    return sendError(res, 405, 'Method not allowed');
  }

  sendError(res, 404, 'Not found');
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
