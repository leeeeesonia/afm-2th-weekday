require('dotenv').config();

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const DATABASE_URL = (process.env.DATABASE_URL || '').trim();
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ADMIN_NAME = (process.env.ADMIN_NAME || 'Super Admin').trim();

if (!DATABASE_URL) {
  console.error('[FATAL] DATABASE_URL is not set.');
  process.exit(1);
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('[FATAL] ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
  console.error('예) ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... node seed-admin.js');
  process.exit(1);
}

const USERS_TABLE = 'todo_app_01_users';
const BCRYPT_COST = 10;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    // 1) role 컬럼 추가 ('user' | 'admin'), Supabase table editor에서 그대로 보임
    await pool.query(`
      ALTER TABLE ${USERS_TABLE}
      ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
    `);
    await pool.query(`
      DO $$ BEGIN
        ALTER TABLE ${USERS_TABLE}
        ADD CONSTRAINT ${USERS_TABLE}_role_check CHECK (role IN ('user', 'admin'));
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // 2) 이전 is_admin 컬럼이 남아있다면 role로 이관 후 제거
    const { rows: hasOld } = await pool.query(`
      SELECT 1 FROM information_schema.columns
       WHERE table_name = $1 AND column_name = 'is_admin'
       LIMIT 1
    `, [USERS_TABLE]);
    if (hasOld.length > 0) {
      await pool.query(
        `UPDATE ${USERS_TABLE} SET role = 'admin' WHERE is_admin = TRUE AND role <> 'admin'`
      );
      await pool.query(`ALTER TABLE ${USERS_TABLE} DROP COLUMN is_admin`);
      console.log('→ 기존 is_admin 컬럼을 role로 이관 후 제거했습니다.');
    }

    // 3) 슈퍼관리자 upsert
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_COST);
    const { rows } = await pool.query(
      `INSERT INTO ${USERS_TABLE} (email, password_hash, name, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO UPDATE
         SET password_hash = EXCLUDED.password_hash,
             name          = EXCLUDED.name,
             role          = 'admin'
       RETURNING id, email, name, role`,
      [ADMIN_EMAIL, passwordHash, ADMIN_NAME]
    );

    console.log('슈퍼 관리자 계정이 준비되었습니다:', rows[0]);
  } catch (err) {
    console.error('[seed-admin failed]', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
