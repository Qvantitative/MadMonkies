import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL, // Ensure this is correctly set in your environment
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query('SELECT name, score FROM leaderboard ORDER BY score DESC LIMIT 10');
      console.log('Leaderboard fetched:', rows);
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Error fetching leaderboard' });
    }
  } else if (req.method === 'POST') {
    const { name, score } = req.body;
    console.log('Received submission:', { name, score });

    if (!name || !score) {
      console.error('Name and score are required. Request body:', req.body);
      return res.status(400).json({ error: 'Name and score are required' });
    }

    try {
      console.log('Inserting score into database:', { name, score });
      await pool.query('INSERT INTO leaderboard (name, score) VALUES ($1, $2)', [name, score]);
      console.log('Score added successfully:', { name, score });
      res.status(200).json({ message: 'Score added successfully' });
    } catch (error) {
      console.error('Error adding score to leaderboard:', error);
      res.status(500).json({ error: 'Error adding score' });
    }
  }
}

