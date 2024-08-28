import React from 'react';

const Leaderboard = ({ leaderboard }) => {
  console.log("Leaderboard component received leaderboard:", leaderboard);

  return (
    <div className="leaderboard bg-transparent p-4 rounded-lg shadow-md">
      <h2 className="text-white text-lg mb-4">Leaderboard</h2>
      {leaderboard.length > 0 ? (
        <ul className="text-white">
          {leaderboard.map((entry, index) => (
            <li key={index}>
              <strong>{entry.name}:</strong> {entry.score}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-white">No scores yet.</p>
      )}
    </div>
  );
};

export default Leaderboard;