// 가계부 (Ledger) Server
// Run: `npm start`, then open http://localhost:3001
//
// Requires DATABASE_URL env var (loaded from .env.local).
// No hardcoded fallback — if missing, the process exits.

require('dotenv').config({ path: '.env.local' });

const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Pool } = require('pg');

// ---- env ----
const DATABASE_URL = (process.env.DATABASE_URL || '').trim();
if (!DATABASE_URL) {
  console.error('[fatal] DATABASE_URL is not set. Put it in .env.local — do NOT hardcode.');
  process.exit(1);
}
const PORT = Number(process.env.PORT) || 3001;
const DEMO_EMAIL = 'demo@ledger.local';

// ---- db ----
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ---- state ----
let demoUserId = null;

async function resolveDemoUser() {
  const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [DEMO_EMAIL]);
  if (rows.length === 0) {
    throw new Error(`Demo user '${DEMO_EMAIL}' not found. Run seed.js first.`);
  }
  demoUserId = rows[0].id;
  console.log(`[db] demo user: ${demoUserId}`);
}

// ---- app ----
const app = express();
app.use(express.json());

// uploads dir (local disk)
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(__dirname, { index: 'index.html' }));

// multer for receipt uploads (disk storage, 2MB, images + pdf)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^\w.\-]+/g, '_');
    cb(null, `${req.params.id}-${Date.now()}-${safe}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only images and PDF are allowed'));
  },
});

// ---- helpers ----
function formatDate(d) {
  if (!d) return null;
  if (typeof d === 'string') return d.slice(0, 10);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function todayStr() {
  return formatDate(new Date());
}

function addMonths(dateStr, months) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1 + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  const day = Math.min(d, lastDay);
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Look up (or create) a category id for the demo user
async function resolveCategoryId({ scope, type, name }) {
  const found = await pool.query(
    'SELECT id FROM categories WHERE user_id=$1 AND scope=$2 AND type=$3 AND name=$4',
    [demoUserId, scope, type, name]
  );
  if (found.rows.length > 0) return found.rows[0].id;
  const ins = await pool.query(
    `INSERT INTO categories (user_id, scope, type, name) VALUES ($1,$2,$3,$4)
     ON CONFLICT (user_id, scope, type, name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [demoUserId, scope, type, name]
  );
  return ins.rows[0].id;
}

// ---- routes ----

// GET /api/entries?scope=personal|business
// Returns real entries + monthly-expanded virtual occurrences from recurring_rules.
app.get('/api/entries', async (req, res) => {
  try {
    const scope = req.query.scope === 'business' ? 'business' : 'personal';

    const entriesQ = pool.query(
      `SELECT e.id, e.scope, e.type, e.entry_date, e.amount, e.memo,
              e.recurring_rule_id,
              COALESCE(c.name, '기타') AS category_name,
              r.id         AS receipt_id,
              r.file_name  AS receipt_name,
              r.mime_type  AS receipt_mime,
              r.storage_url AS receipt_url
         FROM entries e
         LEFT JOIN categories c ON c.id = e.category_id
         LEFT JOIN LATERAL (
           SELECT id, file_name, mime_type, storage_url
             FROM receipts WHERE entry_id = e.id
             ORDER BY uploaded_at DESC LIMIT 1
         ) r ON true
        WHERE e.user_id=$1 AND e.scope=$2
        ORDER BY e.entry_date DESC, e.id DESC`,
      [demoUserId, scope]
    );

    const rulesQ = pool.query(
      `SELECT rr.id, rr.scope, rr.type, rr.amount, rr.memo,
              rr.start_date, rr.end_date, rr.active,
              COALESCE(c.name, '기타') AS category_name
         FROM recurring_rules rr
         LEFT JOIN categories c ON c.id = rr.category_id
        WHERE rr.user_id=$1 AND rr.scope=$2 AND rr.active = true`,
      [demoUserId, scope]
    );

    const [entriesR, rulesR] = await Promise.all([entriesQ, rulesQ]);

    const result = [];

    // real entries
    for (const row of entriesR.rows) {
      result.push({
        id: `e${row.id}`,
        scope: row.scope,
        type: row.type,
        date: formatDate(row.entry_date),
        amount: Number(row.amount),
        category: row.category_name,
        memo: row.memo || '',
        recurring: false,
        recurringId: row.recurring_rule_id ? `r${row.recurring_rule_id}` : null,
        receipt: row.receipt_id
          ? { name: row.receipt_name, type: row.receipt_mime, url: row.receipt_url }
          : null,
      });
    }

    // recurring rules: one "template" row (recurring: true) + monthly virtual occurrences
    const today = todayStr();
    for (const rule of rulesR.rows) {
      const startDate = formatDate(rule.start_date);
      const endDate = rule.end_date ? formatDate(rule.end_date) : null;
      const ruleKey = `r${rule.id}`;

      // template row (marks the recurring rule itself)
      result.push({
        id: ruleKey,
        scope: rule.scope,
        type: rule.type,
        date: startDate,
        amount: Number(rule.amount),
        category: rule.category_name,
        memo: rule.memo || '',
        recurring: true,
        recurringId: ruleKey,
        receipt: null,
      });

      // monthly virtual entries (months 1..N up to today / end_date)
      let i = 1;
      while (true) {
        const nextDate = addMonths(startDate, i);
        if (nextDate > today) break;
        if (endDate && nextDate > endDate) break;
        result.push({
          id: `${ruleKey}-${nextDate}`,
          scope: rule.scope,
          type: rule.type,
          date: nextDate,
          amount: Number(rule.amount),
          category: rule.category_name,
          memo: rule.memo || '',
          recurring: false,
          recurringId: ruleKey,
          receipt: null,
        });
        i++;
      }
    }

    // sort by date desc, then id desc
    result.sort((a, b) => b.date.localeCompare(a.date) || String(b.id).localeCompare(String(a.id)));

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[GET /api/entries]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/entries   body: { scope, type, date, amount, category, memo, recurring }
app.post('/api/entries', async (req, res) => {
  try {
    const { scope, type, date, amount, category, memo = '', recurring = false } = req.body || {};
    if (!['personal', 'business'].includes(scope)) return res.status(400).json({ success: false, message: 'invalid scope' });
    if (!['income', 'expense'].includes(type)) return res.status(400).json({ success: false, message: 'invalid type' });
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ success: false, message: 'invalid date' });
    const amt = Number(amount);
    if (!amt || amt <= 0) return res.status(400).json({ success: false, message: 'invalid amount' });
    if (!category) return res.status(400).json({ success: false, message: 'category required' });

    const categoryId = await resolveCategoryId({ scope, type, name: category });

    if (recurring) {
      const { rows } = await pool.query(
        `INSERT INTO recurring_rules (user_id, scope, type, category_id, amount, memo, start_date, active)
         VALUES ($1,$2,$3,$4,$5,$6,$7, true) RETURNING id`,
        [demoUserId, scope, type, categoryId, amt, memo, date]
      );
      return res.status(201).json({
        success: true,
        data: {
          id: `r${rows[0].id}`,
          scope, type, date,
          amount: amt,
          category, memo,
          recurring: true,
          recurringId: `r${rows[0].id}`,
          receipt: null,
        },
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO entries (user_id, scope, type, entry_date, amount, category_id, memo)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [demoUserId, scope, type, date, amt, categoryId, memo]
    );
    res.status(201).json({
      success: true,
      data: {
        id: `e${rows[0].id}`,
        scope, type, date,
        amount: amt,
        category, memo,
        recurring: false,
        recurringId: null,
        receipt: null,
      },
    });
  } catch (err) {
    console.error('[POST /api/entries]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/entries/:id   body: { date, amount, category, memo, type, scope }
// Virtual expanded ids (e.g. "r12-2026-03-01") are NOT editable.
app.put('/api/entries/:id', async (req, res) => {
  try {
    const raw = String(req.params.id || '');
    const m = raw.match(/^([er])(\d+)$/);
    if (!m) return res.status(400).json({ success: false, message: 'cannot edit virtual occurrences; edit the recurring template (r<n>) instead' });
    const [, kind, numStr] = m;
    const numericId = Number(numStr);

    const { scope, type, date, amount, category, memo = '' } = req.body || {};
    if (!['personal', 'business'].includes(scope)) return res.status(400).json({ success: false, message: 'invalid scope' });
    if (!['income', 'expense'].includes(type)) return res.status(400).json({ success: false, message: 'invalid type' });
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ success: false, message: 'invalid date' });
    const amt = Number(amount);
    if (!amt || amt <= 0) return res.status(400).json({ success: false, message: 'invalid amount' });
    if (!category) return res.status(400).json({ success: false, message: 'category required' });

    const categoryId = await resolveCategoryId({ scope, type, name: category });

    if (kind === 'e') {
      const { rowCount } = await pool.query(
        `UPDATE entries SET scope=$1, type=$2, entry_date=$3, amount=$4, category_id=$5, memo=$6, updated_at=now()
           WHERE id=$7 AND user_id=$8`,
        [scope, type, date, amt, categoryId, memo, numericId, demoUserId]
      );
      if (rowCount === 0) return res.status(404).json({ success: false, message: 'entry not found' });
      return res.json({ success: true, data: { id: `e${numericId}`, scope, type, date, amount: amt, category, memo, recurring: false, recurringId: null } });
    }

    // recurring rule: date => start_date
    const { rowCount } = await pool.query(
      `UPDATE recurring_rules SET scope=$1, type=$2, start_date=$3, amount=$4, category_id=$5, memo=$6
         WHERE id=$7 AND user_id=$8`,
      [scope, type, date, amt, categoryId, memo, numericId, demoUserId]
    );
    if (rowCount === 0) return res.status(404).json({ success: false, message: 'rule not found' });
    res.json({ success: true, data: { id: `r${numericId}`, scope, type, date, amount: amt, category, memo, recurring: true, recurringId: `r${numericId}` } });
  } catch (err) {
    console.error('[PUT /api/entries/:id]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/entries/:id
// id convention: "e<n>" = entry row, "r<n>" = recurring rule.
// Virtual expanded ids like "r12-2026-03-01" are NOT deletable individually —
// deleting the underlying rule ("r12") removes all its virtual occurrences.
app.delete('/api/entries/:id', async (req, res) => {
  try {
    const raw = String(req.params.id || '');
    const m = raw.match(/^([er])(\d+)$/);
    if (!m) return res.status(400).json({ success: false, message: 'invalid id (expected e<n> or r<n>)' });
    const [, kind, numStr] = m;
    const numericId = Number(numStr);

    if (kind === 'e') {
      const { rowCount } = await pool.query(
        'DELETE FROM entries WHERE id=$1 AND user_id=$2',
        [numericId, demoUserId]
      );
      if (rowCount === 0) return res.status(404).json({ success: false, message: 'entry not found' });
      return res.json({ success: true });
    }

    // kind === 'r' => recurring rule
    const { rowCount } = await pool.query(
      'DELETE FROM recurring_rules WHERE id=$1 AND user_id=$2',
      [numericId, demoUserId]
    );
    if (rowCount === 0) return res.status(404).json({ success: false, message: 'rule not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/entries/:id]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/entries/:id/receipt (multipart form-data, field name "file")
app.post('/api/entries/:id/receipt', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    try {
      const raw = String(req.params.id || '');
      const m = raw.match(/^e(\d+)$/);
      if (!m) return res.status(400).json({ success: false, message: 'receipts only attach to real entries (e<n>)' });
      const entryId = Number(m[1]);
      if (!req.file) return res.status(400).json({ success: false, message: 'no file' });

      const url = `/uploads/${req.file.filename}`;
      await pool.query(
        `INSERT INTO receipts (entry_id, file_name, mime_type, storage_url, file_size)
         VALUES ($1,$2,$3,$4,$5)`,
        [entryId, req.file.originalname, req.file.mimetype, url, req.file.size]
      );
      res.status(201).json({
        success: true,
        data: { name: req.file.originalname, type: req.file.mimetype, url },
      });
    } catch (e) {
      console.error('[POST receipt]', e);
      res.status(500).json({ success: false, message: e.message });
    }
  });
});

// error fallback
app.use((err, _req, res, _next) => {
  console.error('[unhandled]', err);
  res.status(500).json({ success: false, message: err.message });
});

// ---- startup ----
(async () => {
  try {
    await resolveDemoUser();
    app.listen(PORT, () => {
      console.log(`[server] http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error('[fatal] startup failed:', e.message);
    process.exit(1);
  }
})();

module.exports = app;
