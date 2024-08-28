const express = require('express');
const next = require('next');
const path = require('path');
const cors = require('cors');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const allowedOrigins = ['http://localhost:3000', 'https://madmonki.es', 'https://www.madmonki.es'];

const corsOptions = {
  origin: ['http://localhost:3000', 'https://madmonki.es'],
  methods: ['GET', 'POST'],
  credentials: true,
  optionsSuccessStatus: 204
};

server.options('*', cors(corsOptions));

app.prepare().then(() => {
  const server = express();

  server.use(express.json());
  server.use(cors(corsOptions));

  // API routes
  server.get('/api/leaderboard', (req, res) => {
    // Your leaderboard logic here
    res.json([/* your leaderboard data */]);
  });

  server.post('/api/submit-score', (req, res) => {
    // Your score submission logic here
    res.json({ success: true });
  });

  server.post('/api/score-response', (req, res) => {
    // Your AI response generation logic here
    res.json({ response: "AI generated response" });
  });

  // Next.js request handling
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
}).catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
});