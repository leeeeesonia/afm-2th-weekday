const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Database Connection ---
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.trim(),
  ssl: { rejectUnauthorized: false },
});

// --- Lazy DB Init ---
let dbInitialized = false;

async function initDB() {
  if (dbInitialized) return;

  // Create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      category VARCHAR(20) NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS votes (
      id SERIAL PRIMARY KEY,
      question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
      voter_name VARCHAR(100) NOT NULL,
      choice VARCHAR(1) NOT NULL,
      voted_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(question_id, voter_name)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS participants (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Seed questions if empty
  const { rows: existing } = await pool.query('SELECT COUNT(*)::int AS count FROM questions');
  if (existing[0].count === 0) {
    const defaultQuestions = [
      ['friend', '평생 짜장면만 먹기', '평생 짬뽕만 먹기'],
      ['friend', '10년 전으로 돌아가기', '10년 후로 가기'],
      ['friend', '투명인간 되기', '하늘을 날 수 있기'],
      ['couple', '매일 연락하는 연인', '가끔 연락하는 연인'],
      ['couple', '첫사랑과 재회', '새로운 사람과 시작'],
      ['couple', '연인의 과거를 아는 것', '모르는 것'],
      ['group', '월급 500 + 주7일 출근', '월급 300 + 주4일 출근'],
      ['group', '재택근무 평생', '사무실 출근 평생'],
      ['group', '좋아하는 일 연봉 3000', '싫어하는 일 연봉 8000'],
    ];

    for (const [category, optionA, optionB] of defaultQuestions) {
      await pool.query(
        'INSERT INTO questions (category, option_a, option_b) VALUES ($1, $2, $3)',
        [category, optionA, optionB]
      );
    }

    // Seed participants
    const participants = ['소니아', '민수', '지은'];
    for (const name of participants) {
      await pool.query(
        'INSERT INTO participants (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [name]
      );
    }

    // Seed votes
    const seedVotes = [
      [1, '민수', 'A'],
      [2, '민수', 'A'],
      [3, '민수', 'A'],
      [1, '지은', 'B'],
      [2, '지은', 'B'],
      [3, '지은', 'A'],
      [4, '소니아', 'A'],
      [5, '소니아', 'B'],
      [6, '소니아', 'B'],
    ];
    for (const [qId, voter, choice] of seedVotes) {
      await pool.query(
        'INSERT INTO votes (question_id, voter_name, choice) VALUES ($1, $2, $3) ON CONFLICT (question_id, voter_name) DO NOTHING',
        [qId, voter, choice]
      );
    }
  }

  dbInitialized = true;
  console.log('Database initialized');
}

// --- Middleware ---
app.use(express.json());
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});
app.use(express.static(path.join(__dirname)));

// DB init middleware for /api routes
app.use('/api', async (_req, res, next) => {
  try {
    await initDB();
    next();
  } catch (err) {
    console.error('DB init error:', err);
    res.status(500).json({ success: false, message: 'Database initialization failed' });
  }
});

// --- Helper: build question query with vote counts ---
const QUESTION_WITH_STATS_SQL = `
  SELECT
    q.id,
    q.category,
    q.option_a AS "optionA",
    q.option_b AS "optionB",
    q.created_at AS "createdAt",
    COALESCE(SUM(CASE WHEN v.choice = 'A' THEN 1 ELSE 0 END), 0)::int AS "votesA",
    COALESCE(SUM(CASE WHEN v.choice = 'B' THEN 1 ELSE 0 END), 0)::int AS "votesB"
  FROM questions q
  LEFT JOIN votes v ON v.question_id = q.id
`;

function addPercents(row) {
  const totalVotes = row.votesA + row.votesB;
  return {
    ...row,
    totalVotes,
    percentA: totalVotes === 0 ? 0 : Math.round((row.votesA / totalVotes) * 1000) / 10,
    percentB: totalVotes === 0 ? 0 : Math.round((row.votesB / totalVotes) * 1000) / 10,
  };
}

// --- API Routes ---

// GET /api/questions - list all (optional ?category= filter)
app.get('/api/questions', async (req, res) => {
  try {
    const { category } = req.query;
    let query = QUESTION_WITH_STATS_SQL;
    const params = [];

    if (category) {
      query += ' WHERE q.category = $1';
      params.push(category);
    }
    query += ' GROUP BY q.id ORDER BY q.id';

    const { rows } = await pool.query(query, params);
    res.json({ success: true, data: rows.map(addPercents) });
  } catch (err) {
    console.error('GET /api/questions error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch questions' });
  }
});

// GET /api/questions/:id - single question with stats
app.get('/api/questions/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const query = QUESTION_WITH_STATS_SQL + ' WHERE q.id = $1 GROUP BY q.id';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    res.json({ success: true, data: addPercents(rows[0]) });
  } catch (err) {
    console.error('GET /api/questions/:id error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch question' });
  }
});

// POST /api/questions - create new question
app.post('/api/questions', async (req, res) => {
  try {
    const { category, optionA, optionB } = req.body;
    if (!category || !optionA || !optionB) {
      return res.status(400).json({ success: false, message: 'category, optionA, optionB are required' });
    }
    const validCategories = ['friend', 'couple', 'group'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ success: false, message: 'category must be one of: friend, couple, group' });
    }

    const { rows } = await pool.query(
      'INSERT INTO questions (category, option_a, option_b) VALUES ($1, $2, $3) RETURNING id, category, option_a AS "optionA", option_b AS "optionB", created_at AS "createdAt"',
      [category, optionA, optionB]
    );

    const newQ = { ...rows[0], votesA: 0, votesB: 0 };
    res.status(201).json({ success: true, data: addPercents(newQ) });
  } catch (err) {
    console.error('POST /api/questions error:', err);
    res.status(500).json({ success: false, message: 'Failed to create question' });
  }
});

// PUT /api/questions/:id - update question (partial ok)
app.put('/api/questions/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { category, optionA, optionB } = req.body;

    // Check exists
    const { rows: check } = await pool.query('SELECT id FROM questions WHERE id = $1', [id]);
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const validCategories = ['friend', 'couple', 'group'];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({ success: false, message: 'category must be one of: friend, couple, group' });
    }

    // Build dynamic UPDATE
    const sets = [];
    const params = [];
    let idx = 1;
    if (category) { sets.push(`category = $${idx++}`); params.push(category); }
    if (optionA) { sets.push(`option_a = $${idx++}`); params.push(optionA); }
    if (optionB) { sets.push(`option_b = $${idx++}`); params.push(optionB); }

    if (sets.length > 0) {
      params.push(id);
      await pool.query(`UPDATE questions SET ${sets.join(', ')} WHERE id = $${idx}`, params);
    }

    // Return updated question with stats
    const query = QUESTION_WITH_STATS_SQL + ` WHERE q.id = $1 GROUP BY q.id`;
    const { rows } = await pool.query(query, [id]);
    res.json({ success: true, data: addPercents(rows[0]) });
  } catch (err) {
    console.error('PUT /api/questions/:id error:', err);
    res.status(500).json({ success: false, message: 'Failed to update question' });
  }
});

// DELETE /api/questions/:id - delete question (cascades to votes)
app.delete('/api/questions/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Fetch before deleting for response
    const query = QUESTION_WITH_STATS_SQL + ' WHERE q.id = $1 GROUP BY q.id';
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    await pool.query('DELETE FROM questions WHERE id = $1', [id]);
    res.json({ success: true, data: addPercents(rows[0]) });
  } catch (err) {
    console.error('DELETE /api/questions/:id error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete question' });
  }
});

// POST /api/questions/:id/vote - vote on a question
app.post('/api/questions/:id/vote', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { choice, voterName } = req.body;

    if (!choice || !['A', 'B'].includes(choice)) {
      return res.status(400).json({ success: false, message: 'choice must be "A" or "B"' });
    }
    if (!voterName) {
      return res.status(400).json({ success: false, message: 'voterName is required' });
    }

    // Check question exists
    const { rows: check } = await pool.query('SELECT id FROM questions WHERE id = $1', [id]);
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Auto-create participant if new
    await pool.query(
      'INSERT INTO participants (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
      [voterName]
    );

    // Upsert vote
    await pool.query(
      `INSERT INTO votes (question_id, voter_name, choice)
       VALUES ($1, $2, $3)
       ON CONFLICT (question_id, voter_name) DO UPDATE SET choice = $3, voted_at = NOW()`,
      [id, voterName, choice]
    );

    // Return updated question stats
    const query = QUESTION_WITH_STATS_SQL + ' WHERE q.id = $1 GROUP BY q.id';
    const { rows } = await pool.query(query, [id]);
    res.json({ success: true, data: addPercents(rows[0]) });
  } catch (err) {
    console.error('POST /api/questions/:id/vote error:', err);
    res.status(500).json({ success: false, message: 'Failed to vote' });
  }
});

// DELETE /api/questions/:id/vote - cancel a vote
app.delete('/api/questions/:id/vote', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { voterName } = req.body;

    if (!voterName) {
      return res.status(400).json({ success: false, message: 'voterName is required' });
    }

    // Check question exists
    const { rows: check } = await pool.query('SELECT id FROM questions WHERE id = $1', [id]);
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const { rowCount } = await pool.query(
      'DELETE FROM votes WHERE question_id = $1 AND voter_name = $2',
      [id, voterName]
    );

    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Vote not found' });
    }

    // Return updated question stats
    const query = QUESTION_WITH_STATS_SQL + ' WHERE q.id = $1 GROUP BY q.id';
    const { rows } = await pool.query(query, [id]);
    res.json({ success: true, data: addPercents(rows[0]) });
  } catch (err) {
    console.error('DELETE /api/questions/:id/vote error:', err);
    res.status(500).json({ success: false, message: 'Failed to cancel vote' });
  }
});

// GET /api/stats - overall statistics
app.get('/api/stats', async (_req, res) => {
  try {
    const { rows: [{ count: totalQuestions }] } = await pool.query('SELECT COUNT(*)::int AS count FROM questions');
    const { rows: [{ count: totalVotes }] } = await pool.query('SELECT COUNT(*)::int AS count FROM votes');

    // Most popular question (highest total votes)
    let mostPopular = null;
    if (totalQuestions > 0) {
      const { rows } = await pool.query(`
        ${QUESTION_WITH_STATS_SQL}
        GROUP BY q.id
        ORDER BY COUNT(v.id) DESC
        LIMIT 1
      `);
      if (rows.length > 0) {
        mostPopular = addPercents(rows[0]);
      }
    }

    // Category breakdown
    const { rows: catRows } = await pool.query(`
      SELECT
        q.category,
        COUNT(DISTINCT q.id)::int AS questions,
        COUNT(v.id)::int AS "totalVotes"
      FROM questions q
      LEFT JOIN votes v ON v.question_id = q.id
      GROUP BY q.category
    `);

    const categoryBreakdown = {};
    for (const cat of ['friend', 'couple', 'group']) {
      const found = catRows.find(r => r.category === cat);
      categoryBreakdown[cat] = {
        questions: found ? found.questions : 0,
        totalVotes: found ? found.totalVotes : 0,
      };
    }

    res.json({
      success: true,
      data: { totalQuestions, totalVotes, mostPopular, categoryBreakdown },
    });
  } catch (err) {
    console.error('GET /api/stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// GET /api/participants - list all participants with vote info
app.get('/api/participants', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.name,
        COUNT(v.id)::int AS "voteCount",
        COALESCE(
          ARRAY_AGG(DISTINCT q.category) FILTER (WHERE q.category IS NOT NULL),
          '{}'
        ) AS categories,
        p.created_at AS "joinedAt"
      FROM participants p
      LEFT JOIN votes v ON v.voter_name = p.name
      LEFT JOIN questions q ON q.id = v.question_id
      GROUP BY p.id
      ORDER BY p.id
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('GET /api/participants error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch participants' });
  }
});

// --- Local / Vercel dual-mode ---
if (require.main === module) {
  initDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  }).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
}
module.exports = app;
