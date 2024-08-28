export default function handler(req, res) {
  if (req.method === 'POST') {
    const { score, gameId } = req.body;

    // Process the score submission logic here (e.g., save it to a database)

    res.status(200).json({ message: 'Score submitted successfully' });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
