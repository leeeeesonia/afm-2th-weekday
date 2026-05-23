// Cardnews API — Express app.
// • dev: dev-server.js가 import해서 listen
// • prod (Vercel): api/[...path].js가 serverless function으로 wrap
// 환경변수는 .env(dev) 또는 Vercel Dashboard(prod)에서. hardcoded fallback 금지.
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import ImageKit from 'imagekit';

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

// ImageKit — env 미설정이면 클라이언트 업로드는 비활성화 (auth endpoint가 503 반환)
let imagekit = null;
if (process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT) {
  imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

/* ─── ImageKit 업로드 — 서버 경유 방식 ───
 * 클라이언트가 base64로 인코딩한 파일을 JSON으로 POST.
 * 서버가 ImageKit SDK로 업로드 → CDN URL 반환.
 *
 * 장점:
 *  - private key가 클라이언트에 절대 노출되지 않음
 *  - 서버에서 파일 크기/타입 검증 가능
 *  - ImageKit 클라이언트 사이드 SDK 의존성 0
 *  - JSON 바디라 멀티파트 파서 불필요
 *
 * 제한: Vercel serverless 함수 바디 4.5MB → 이미지 원본도 그 안. base64 오버헤드 33%.
 *       2~3MB 이상 큰 사진은 클라이언트에서 리사이즈하거나, 파일 사이즈 안내.
 */
app.post('/api/upload', async (req, res) => {
  if (!imagekit) {
    return res.status(503).json({ error: 'ImageKit not configured (set IMAGEKIT_* env vars)' });
  }
  try {
    const { file, fileName, folder } = req.body || {};
    if (!file || typeof file !== 'string') {
      return res.status(400).json({ error: 'file (base64 string) required' });
    }
    // file은 'data:image/png;base64,XXX...' 또는 그냥 base64 문자열
    const base64 = file.includes(',') ? file.split(',')[1] : file;
    const buffer = Buffer.from(base64, 'base64');
    const result = await imagekit.upload({
      file: buffer,
      fileName: fileName || `upload-${Date.now()}.png`,
      folder: folder || 'cardnews',
      useUniqueFileName: true,
    });
    res.json({ url: result.url, fileId: result.fileId, name: result.name });
  } catch (e) {
    console.error('[upload]', e);
    res.status(500).json({ error: e.message || 'upload failed' });
  }
});

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
