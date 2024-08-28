import { OpenAI } from 'openai';

export default async function handler(req, res) {
  // Ensure only POST requests are handled
  if (req.method === 'POST') {
    try {
      // Validate request body and score
      const { score } = req.body;

      if (!score || typeof score !== 'number' || score < 0) {
        return res.status(400).json({ error: 'Invalid score. Score must be a positive number.' });
      }

      // Initialize OpenAI with the API key
      const openai = new OpenAI({
        apiKey: process.env.TOKEN, // Ensure TOKEN is correctly set in production environment
      });

      // Generate the completion using OpenAI GPT-4
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a rugged and humorous assistant..." },
          { role: "user", content: `The player scored ${score} points. Write a response based on this score.` }
        ]
      });

      // Validate response from OpenAI
      const aiResponse = completion?.choices?.[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('Invalid AI response');
      }

      // Send back the response
      res.status(200).json({ response: aiResponse });

    } catch (error) {
      // Catch and log errors, including OpenAI errors
      console.error('Error communicating with OpenAI:', error);

      // Return a 500 error if something goes wrong
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  } else {
    // Respond with 405 Method Not Allowed for unsupported methods
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
