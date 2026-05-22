// Vercel serverless wrapper — 모든 /api/* 요청을 Express app으로 전달.
// rootDirectory = cardnews-app/ 기준이라 '../server.js'.
import app from '../server.js';
export default app;
