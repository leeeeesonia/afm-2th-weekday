// One-shot: apply schema.sql + seed.sql to DATABASE_URL
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

(async () => {
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    for (const file of ['schema.sql', 'seed.sql']) {
      const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
      console.log(`Applying ${file}...`);
      await client.query(sql);
    }
    const counts = await client.query(`
      SELECT 'ingredients_master' t, COUNT(*)::int n FROM ingredients_master
      UNION ALL SELECT 'fridge_items',       COUNT(*)::int FROM fridge_items
      UNION ALL SELECT 'recipes',            COUNT(*)::int FROM recipes
      UNION ALL SELECT 'recipe_ingredients', COUNT(*)::int FROM recipe_ingredients
      UNION ALL SELECT 'recipe_steps',       COUNT(*)::int FROM recipe_steps
      ORDER BY t;
    `);
    console.table(counts.rows);
  } finally {
    await client.end();
  }
})().catch(e => { console.error(e); process.exit(1); });
