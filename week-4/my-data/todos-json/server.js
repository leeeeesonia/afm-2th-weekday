const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3002;
const ROOT_DIR = __dirname;
const INDEX_HTML = path.join(ROOT_DIR, 'index.html');

// ========================================
// Helpers — read/write todo JSON files
// ========================================
function todoFilePath(id) {
  return path.join(ROOT_DIR, `todo${id}.json`);
}

function parseTodoFile(filename) {
  const filepath = path.join(ROOT_DIR, filename);
  const raw = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(raw);
}

function readAllTodos() {
  const files = fs.readdirSync(ROOT_DIR);
  return files
    .filter((f) => /^todo\d+\.json$/.test(f))
    .map(parseTodoFile)
    .sort((a, b) => a.id - b.id);
}

function nextTodoId() {
  const todos = readAllTodos();
  const max = todos.reduce((m, t) => (t.id > m ? t.id : m), 0);
  return max + 1;
}

function writeTodoFile(todo) {
  const filepath = todoFilePath(todo.id);
  fs.writeFileSync(filepath, JSON.stringify(todo, null, 2) + '\n', 'utf-8');
}

// ========================================
// Response helpers
// ========================================
function sendJSON(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// ========================================
// Server
// ========================================
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // GET / → index.html
    if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
      const html = fs.readFileSync(INDEX_HTML, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    }

    // GET /api/todos
    if (req.method === 'GET' && pathname === '/api/todos') {
      const todos = readAllTodos();
      return sendJSON(res, 200, { success: true, data: todos });
    }

    // POST /api/todos  { title }
    if (req.method === 'POST' && pathname === '/api/todos') {
      const body = await readBody(req);
      const title = (body.title || '').trim();
      if (!title) {
        return sendJSON(res, 400, { success: false, error: 'title is required' });
      }
      const id = nextTodoId();
      const todo = { id, title, completed: false };
      writeTodoFile(todo);
      return sendJSON(res, 201, { success: true, data: todo });
    }

    // PUT /api/todos/:id  { title?, completed? }
    const idMatch = pathname.match(/^\/api\/todos\/(\d+)$/);
    if (req.method === 'PUT' && idMatch) {
      const id = parseInt(idMatch[1], 10);
      const filepath = todoFilePath(id);
      if (!fs.existsSync(filepath)) {
        return sendJSON(res, 404, { success: false, error: 'todo not found' });
      }
      const body = await readBody(req);
      const current = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
      const updated = {
        id: current.id,
        title: body.title !== undefined ? String(body.title) : current.title,
        completed: body.completed !== undefined ? Boolean(body.completed) : current.completed,
      };
      writeTodoFile(updated);
      return sendJSON(res, 200, { success: true, data: updated });
    }

    // DELETE /api/todos/:id
    if (req.method === 'DELETE' && idMatch) {
      const id = parseInt(idMatch[1], 10);
      const filepath = todoFilePath(id);
      if (!fs.existsSync(filepath)) {
        return sendJSON(res, 404, { success: false, error: 'todo not found' });
      }
      fs.unlinkSync(filepath);
      return sendJSON(res, 200, { success: true, data: { id } });
    }

    sendJSON(res, 404, { success: false, error: 'not found' });
  } catch (err) {
    console.error(err);
    sendJSON(res, 500, { success: false, error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Todo JSON server running at http://localhost:${PORT}`);
  console.log(`Reading todo*.json from: ${ROOT_DIR}`);
});
