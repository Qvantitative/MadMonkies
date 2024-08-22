import React, { useEffect, useState } from 'react';

const Leaderboard = () => {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(response => response.json())
      .then(data => setScores(data))
      .catch(error => console.error('Error fetching leaderboard:', error));
  }, []);

  return (
    <div className="leaderboard bg-white p-4 rounded-lg shadow-lg text-black">
      <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
      <ul>
        {scores.map((score, index) => (
          <li key={index} className="mb-2">
            <span className="font-semibold">{score.name}</span>: {score.score}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
