require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');

const app = express();

const corsOptions = {
  origin: '*', // Allow all origins for testing
  methods: 'GET,POST',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.post('/api/score-response', async (req, res) => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.TOKEN
    });

    const score = req.body.score;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {"role": "system", "content": "You are a rugged and humorous assistant who comments on the player's performance in a game. If the score is low, make fun of the player in a harsh but playful way. If the score is high, praise the player in a very positive but rugged way."},
        {"role": "user", "content": `The player scored ${score} points. Write a response based on this score.`}
      ]
    });

    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Something broke!');
  }
});

// Export the app as a module
module.exports = app;
