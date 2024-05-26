require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');

const app = express();

const corsOptions = {
  origin: '*', // Allow requests from any origin (update if you have specific origins)
  methods: 'GET,POST', // Allow GET and POST requests
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
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
        {"role": "system", "content": "You are a rugged and humorous assistant who comments on the player's performance in a game. If the score is low, make fun of the player in a harsh but playful way. If the score is high, praise the player in a very positive but rugged way."},
        {"role": "user", "content": `The player scored ${score} points. Write a response based on this score.`}
      ]
    });

    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).send('Something broke!');
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Export the app as a module
module.exports = app;
