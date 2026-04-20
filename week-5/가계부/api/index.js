// Vercel serverless entry point.
// Re-exports the Express app from ../server.js so the same handlers run
// unchanged in both local (`npm start`) and Vercel (serverless) environments.
//
// server.js guards `app.listen` behind `require.main === module`, so loading
// it here does NOT start a local HTTP server — we just hand the app to Vercel.
module.exports = require('../server.js');
