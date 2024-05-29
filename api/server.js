const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Adjust the path as needed

const { OpenAI } = require('openai');
const express = require('express');

const app = express();
app.use(express.json());

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
    console.log('API Key:', process.env.TOKEN); // Log the API key to ensure it is being loaded correctly (remove this in production)

    if (!process.env.TOKEN) {
      throw new Error('API Key is missing');
    }

    const openai = new OpenAI({
      apiKey: process.env.TOKEN // Ensure this is properly set in your .env file
    });

    const score = req.body.score;
    console.log('Score received:', score); // Log the score to ensure it's being received

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { "role": "system", "content": "You are a rugged and humorous assistant who comments on the player's performance in a game. If the score is low, make fun of the player in a harsh but playful way. If the score is high, praise the player in a very positive but rugged way." },
        { "role": "user", "content": `The player scored ${score} points. Write a response based on this score.` }
      ]
    });

    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
