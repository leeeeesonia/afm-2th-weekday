const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const TODOS_DIR = path.join(__dirname, 'todos');
const INDEX_HTML = path.join(TODOS_DIR, 'index.html');

// ========================================
// Helpers — read/write todo files
// ========================================
function parseTodoFile(filename) {
  const filepath = path.join(TODOS_DIR, filename);
  const raw = fs.readFileSync(filepath, 'utf-8');
  const lines = raw.split('\n');
  const text = (lines[0] || '').trim();
  const doneStr = (lines[1] || '').trim().toLowerCase();
  return {
    id: filename,
    text,
    done: doneStr === 'true',
  };
}

function writeTodoFile(id, text, done) {
  const filepath = path.join(TODOS_DIR, id);
  fs.writeFileSync(filepath, `${text}\n${done ? 'true' : 'false'}\n`, 'utf-8');
}

function readAllTodos() {
  const files = fs.readdirSync(TODOS_DIR);
  return files
    .filter((f) => /^todo\d+$/.test(f))
    .sort((a, b) => {
      const na = parseInt(a.replace('todo', ''), 10);
      const nb = parseInt(b.replace('todo', ''), 10);
      return na - nb;
    })
    .map(parseTodoFile);
}

function nextTodoId() {
  const files = fs.readdirSync(TODOS_DIR).filter((f) => /^todo\d+$/.test(f));
  const max = files.reduce((m, f) => {
    const n = parseInt(f.replace('todo', ''), 10);
    return n > m ? n : m;
  }, 0);
  return `todo${max + 1}`;
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

    // POST /api/todos  { text }
    if (req.method === 'POST' && pathname === '/api/todos') {
      const body = await readBody(req);
      const text = (body.text || '').trim();
      if (!text) {
        return sendJSON(res, 400, { success: false, error: 'text is required' });
      }
      const id = nextTodoId();
      writeTodoFile(id, text, false);
      return sendJSON(res, 201, { success: true, data: { id, text, done: false } });
    }

    // PUT /api/todos/:id  { done?, text? }
    const putMatch = pathname.match(/^\/api\/todos\/(todo\d+)$/);
    if (req.method === 'PUT' && putMatch) {
      const id = putMatch[1];
      const filepath = path.join(TODOS_DIR, id);
      if (!fs.existsSync(filepath)) {
        return sendJSON(res, 404, { success: false, error: 'todo not found' });
      }
      const body = await readBody(req);
      const current = parseTodoFile(id);
      const text = body.text !== undefined ? String(body.text).trim() : current.text;
      const done = body.done !== undefined ? Boolean(body.done) : current.done;
      writeTodoFile(id, text, done);
      return sendJSON(res, 200, { success: true, data: { id, text, done } });
    }

    // DELETE /api/todos/:id
    if (req.method === 'DELETE' && putMatch) {
      const id = putMatch[1];
      const filepath = path.join(TODOS_DIR, id);
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
  console.log(`Todo server running at http://localhost:${PORT}`);
  console.log(`Reading todos from: ${TODOS_DIR}`);
});
