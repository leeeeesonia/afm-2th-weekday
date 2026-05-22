// Cardnews API — Express app.
// • dev: dev-server.js가 import해서 listen
// • prod (Vercel): api/[...path].js가 serverless function으로 wrap
// 환경변수는 .env(dev) 또는 Vercel Dashboard(prod)에서. hardcoded fallback 금지.
import express from 'express';
import cors from 'cors';
import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('[cardnews] DATABASE_URL is required. See .env.example.');
}

// pg pool은 모듈 단위 싱글톤 — serverless 환경에서도 cold-start당 1회만 생성
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
  max: process.env.VERCEL ? 1 : 10, // serverless에선 connection 적게
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

/* ─── Health ─── */
app.get('/api/health', async (req, res) => {
  try {
    const r = await pool.query('select 1 as ok');
    res.json({ ok: true, db: r.rows[0]?.ok === 1, ts: Date.now() });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/* ─── Projects CRUD ─── */
app.get('/api/projects', async (req, res) => {
  try {
    const r = await pool.query(
      `select id, name, template_id, status, created_at, updated_at
       from cardnews_projects
       order by updated_at desc
       limit 200`,
    );
    res.json({ projects: r.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const r = await pool.query('select * from cardnews_projects where id = $1', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'not found' });
    const p = r.rows[0];
    res.json({
      project: {
        id: p.id,
        name: p.name,
        templateId: p.template_id,
        status: p.status,
        data: p.data,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  const { name, templateId, status, data } = req.body || {};
  if (!name || !templateId) return res.status(400).json({ error: 'name and templateId required' });
  try {
    await pool.query(
      `insert into cardnews_projects(id, name, template_id, status, data, updated_at)
       values ($1, $2, $3, $4, $5::jsonb, now())
       on conflict (id) do update set
         name = excluded.name,
         template_id = excluded.template_id,
         status = excluded.status,
         data = excluded.data,
         updated_at = now()`,
      [id, name, templateId, status || 'draft', JSON.stringify(data || {})],
    );
    res.json({ ok: true, id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/projects', async (req, res) => {
  let { id, name, templateId, status, data } = req.body || {};
  if (!name || !templateId) return res.status(400).json({ error: 'name and templateId required' });
  if (!id) id = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    await pool.query(
      `insert into cardnews_projects(id, name, template_id, status, data)
       values ($1, $2, $3, $4, $5::jsonb)
       on conflict (id) do update set updated_at = now()`,
      [id, name, templateId, status || 'draft', JSON.stringify(data || {})],
    );
    res.json({ ok: true, id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    await pool.query('delete from cardnews_projects where id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default app;
