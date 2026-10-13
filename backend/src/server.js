/**
 * AI Interview Coach - Standalone Backend Server (Node.js/Express)
 */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AI Interview Coach Production Backend',
    database: 'MySQL 8.0',
    ai_provider: process.env.AI_PROVIDER || 'gemini',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes (auth, profile, interviews, questions, analytics, resumes)
// Refer to individual controllers in src/controllers/
app.listen(PORT, () => {
  console.log(`AI Interview Coach Backend listening on port ${PORT}`);
});

module.exports = app;
