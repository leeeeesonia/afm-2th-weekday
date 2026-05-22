// schema.sql을 DATABASE_URL에 1회 실행.
// 워크스페이스 Supabase에 cardnews_projects 테이블 추가.
import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  console.error('[init-db] DATABASE_URL is required (.env 또는 export)');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const sqlPath = path.join(__dirname, '..', 'schema.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

console.log('[init-db] running schema.sql...');
try {
  await pool.query(sql);
  // 검증
  const r = await pool.query(
    "select count(*)::int as n from information_schema.tables where table_name = 'cardnews_projects'",
  );
  console.log(`[init-db] done. cardnews_projects exists: ${r.rows[0].n === 1}`);
} catch (e) {
  console.error('[init-db] failed:', e.message);
  process.exit(1);
} finally {
  await pool.end();
}
