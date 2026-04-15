require('dotenv').config({ path: './.env.local' });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const PERSONAL_EXPENSE = ['식비','교통','주거','구독료','경조사','의료/건강','쇼핑','여가','교육','기타'];
const PERSONAL_INCOME  = ['급여','용돈','부수입','이자/배당','환급','기타'];
const BUSINESS_EXPENSE = ['직원급여','임대료','공과금','통신/인터넷','세금/공과','소프트웨어 구독','마케팅/광고','접대비','사무용품','출장/교통','지급수수료','외주비','복리후생','기타'];
const BUSINESS_INCOME  = ['매출 정산','용역 수입','환급금','투자/지원금','이자수익','기타'];

const today = new Date();
const d = (offset) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() + offset);
  return dt.toISOString().slice(0, 10);
};
const firstOfMonth = (monthsAgo) => {
  const dt = new Date(today.getFullYear(), today.getMonth() - monthsAgo, 1);
  return dt.toISOString().slice(0, 10);
};

async function run() {
  await client.connect();
  console.log('✓ connected');

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await client.query(schema);
  console.log('✓ schema applied');

  // 데모 사용자
  const demoEmail = 'demo@ledger.local';
  const ures = await client.query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [demoEmail, 'demo-hash-not-real', '데모 사용자']
  );
  const userId = ures.rows[0].id;
  console.log('✓ demo user:', userId);

  // 기존 데모 데이터 정리 (재실행 가능)
  await client.query(`DELETE FROM entries WHERE user_id = $1`, [userId]);
  await client.query(`DELETE FROM recurring_rules WHERE user_id = $1`, [userId]);
  await client.query(`DELETE FROM categories WHERE user_id = $1`, [userId]);

  // 카테고리 삽입
  const catMap = {};
  const insertCats = async (scope, type, names) => {
    for (const name of names) {
      const r = await client.query(
        `INSERT INTO categories (user_id, scope, type, name) VALUES ($1,$2,$3,$4) RETURNING id`,
        [userId, scope, type, name]
      );
      catMap[`${scope}:${type}:${name}`] = r.rows[0].id;
    }
  };
  await insertCats('personal', 'expense', PERSONAL_EXPENSE);
  await insertCats('personal', 'income',  PERSONAL_INCOME);
  await insertCats('business', 'expense', BUSINESS_EXPENSE);
  await insertCats('business', 'income',  BUSINESS_INCOME);
  console.log('✓ categories seeded');

  const cat = (s, t, n) => catMap[`${s}:${t}:${n}`];

  // 정기지출 규칙
  const recurringRules = [
    { scope:'personal', type:'expense', cat:'구독료', amount:15900, memo:'넷플릭스', start:firstOfMonth(2) },
    { scope:'personal', type:'expense', cat:'주거',   amount:750000, memo:'월세',     start:firstOfMonth(2) },
    { scope:'business', type:'expense', cat:'임대료', amount:1200000, memo:'사무실 임대', start:firstOfMonth(3) },
    { scope:'business', type:'expense', cat:'소프트웨어 구독', amount:29000, memo:'GitHub Team', start:firstOfMonth(3) },
  ];
  const ruleIds = {};
  for (const r of recurringRules) {
    const res = await client.query(
      `INSERT INTO recurring_rules (user_id, scope, type, category_id, amount, memo, start_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [userId, r.scope, r.type, cat(r.scope, r.type, r.cat), r.amount, r.memo, r.start]
    );
    ruleIds[r.memo] = res.rows[0].id;
  }
  console.log('✓ recurring rules seeded');

  // 일반 내역
  const entries = [
    // 개인 지출
    { scope:'personal', type:'expense', cat:'식비',     amount:12500, memo:'점심 - 김치찌개',  date:d(-1) },
    { scope:'personal', type:'expense', cat:'식비',     amount:23400, memo:'스타벅스 + 베이커리', date:d(-3) },
    { scope:'personal', type:'expense', cat:'교통',     amount:3200,  memo:'지하철',           date:d(-2) },
    { scope:'personal', type:'expense', cat:'쇼핑',     amount:89000, memo:'운동화',           date:d(-5) },
    { scope:'personal', type:'expense', cat:'의료/건강', amount:45000, memo:'치과 검진',         date:d(-7) },
    { scope:'personal', type:'expense', cat:'여가',     amount:18000, memo:'영화관',           date:d(-9) },
    { scope:'personal', type:'expense', cat:'경조사',   amount:100000,memo:'친구 결혼식',       date:d(-12) },
    // 개인 수입
    { scope:'personal', type:'income',  cat:'급여',     amount:3200000, memo:'4월 급여',        date:firstOfMonth(0) },
    { scope:'personal', type:'income',  cat:'부수입',   amount:150000, memo:'중고 판매',        date:d(-4) },
    { scope:'personal', type:'income',  cat:'이자/배당',amount:23400, memo:'배당금',           date:d(-6) },
    // 사업자 지출
    { scope:'business', type:'expense', cat:'직원급여', amount:3500000, memo:'4월 인턴 급여',   date:d(-2) },
    { scope:'business', type:'expense', cat:'마케팅/광고', amount:480000, memo:'구글 광고',     date:d(-4) },
    { scope:'business', type:'expense', cat:'접대비',   amount:135000, memo:'클라이언트 미팅', date:d(-6) },
    { scope:'business', type:'expense', cat:'사무용품', amount:42000,  memo:'A4, 토너',        date:d(-8) },
    { scope:'business', type:'expense', cat:'출장/교통',amount:185000, memo:'부산 출장 KTX',   date:d(-10) },
    { scope:'business', type:'expense', cat:'지급수수료',amount:33000, memo:'결제 수수료',     date:d(-11) },
    { scope:'business', type:'expense', cat:'통신/인터넷', amount:55000, memo:'인터넷 회선',   date:d(-14) },
    // 사업자 수입
    { scope:'business', type:'income',  cat:'매출 정산', amount:8500000, memo:'3월 매출 정산', date:d(-3) },
    { scope:'business', type:'income',  cat:'용역 수입', amount:2200000, memo:'A사 프로젝트',   date:d(-7) },
    { scope:'business', type:'income',  cat:'환급금',    amount:310000,  memo:'부가세 환급',    date:d(-15) },
  ];

  for (const e of entries) {
    await client.query(
      `INSERT INTO entries (user_id, scope, type, entry_date, amount, category_id, memo)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [userId, e.scope, e.type, e.date, e.amount, cat(e.scope, e.type, e.cat), e.memo]
    );
  }
  console.log(`✓ ${entries.length} entries seeded`);

  // 요약
  const summary = await client.query(
    `SELECT scope, type, COUNT(*)::int AS cnt, SUM(amount)::text AS total
     FROM entries WHERE user_id = $1 GROUP BY scope, type ORDER BY scope, type`,
    [userId]
  );
  console.table(summary.rows);

  await client.end();
}

run().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
