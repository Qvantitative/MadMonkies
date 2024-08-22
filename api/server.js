const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { OpenAI } = require('openai');
const express = require('express');

const app = express();
app.use(express.json());

const leaderboard = [];

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

app.post('/api/score-response', async (req, res) => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.TOKEN
    });

    const score = req.body.score;
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { "role": "system", "content": "You are a rugged and humorous assistant who comments on the player's performance in a game. If the score is low, make fun of the player in a harsh but playful way. If the score is high, praise the player in a very positive but rugged way. Make only 2 sentences long" },
        { "role": "user", "content": `The player scored ${score} points. Write a response based on this score.` }
      ]
    });

    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/leaderboard', (req, res) => {
  const { name, score } = req.body;
  leaderboard.push({ name, score });
  leaderboard.sort((a, b) => b.score - a.score); // Sort descending by score
  res.status(200).json({ message: 'Score submitted successfully' });
});

app.get('/api/leaderboard', (req, res) => {
  res.json(leaderboard);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
