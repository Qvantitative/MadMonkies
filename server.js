const express = require('express');
const app = express();
const { OpenAI } = require("openai");
const cors = require("cors");

require('dotenv').config();

// Define CORS options
const corsOptions = {
  origin: 'http://localhost:3001', // Allow requests from this origin
  methods: 'GET,POST', // Allow GET and POST requests
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Enable CORS with the specified options
app.use(cors(corsOptions));

// Middleware to parse JSON bodies
app.use(express.json());

// Log requests to console
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// New endpoint for score-based responses
app.post('/api/score-response', async (req, res) => {
    try {
        const openai = new OpenAI({
            apiKey: process.env.TOKEN
        });

        const score = req.body.score;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {"role": "system", "content": "You are a rugged and humorous assistant who comments on the player's performance in a game. If the score is low, make fun of the player in a harsh but playful way. If the score is high, praise the player in a very positive but rugged way."},
              {"role": "user", "content": `The player scored ${score} points. Write a response based on this score.`}
            ]
          });

        res.json({ response: completion.choices[0].message.content });
    } catch (error) {
        console.error(error); // Logging the error
        res.status(500).send('Something broke!');
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
