// dev 전용 — server.js의 Express app을 listen.
// .env 자동 로드.
import 'dotenv/config';
import app from './server.js';

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log(`[cardnews] dev API server on http://localhost:${PORT}`);
});
