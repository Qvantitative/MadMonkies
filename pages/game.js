import React, { useState, useEffect, useCallback } from "react";
import dynamic from 'next/dynamic';
import Leaderboard from '../components/Leaderboard';
const P5Sketch = dynamic(() => import('../components/P5Sketch'), { ssr: false });

// Logo component
const Logo = () => (
  <img
    src="/LOGO.png"
    alt="Logo"
    className="h-24 w-48 sm:h-32 sm:w-64 mt-6 mb-4"
  />
);

// Controls component
const Controls = () => (
  <div className="controls-container absolute left-0 top-1/2 transform -translate-y-1/2 flex p-5">
    <img
      src="/images/controls.png"
      alt="Controls"
      className="w-24 sm:w-32 md:w-40 h-auto"
    />
  </div>
);

// Lives display component
const LivesDisplay = ({ lives }) => (
  <div className="absolute left-0 ml-4 mb-4 flex items-center" style={{ bottom: '40px' }}>
    <img
      src="/images/serum.png"
      alt="Serum"
      className="w-8 h-auto"
    />
    <span className="text-white ml-2">{lives}</span>
  </div>
);

// Name Modal component
const NameModal = ({ score, playerName, setPlayerName, handleSubmitScore, response }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
    <div className="bg-transparent p-4 rounded shadow-lg">
      <input
        type="text"
        placeholder="Enter your name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className="bg-gray-800 text-white px-4 py-2 rounded mt-4"
      />
      <button
        onClick={handleSubmitScore}
        className="bg-blue-500 text-white px-4 py-2 rounded ml-2 mt-4"
      >
        Submit Score
      </button>
    </div>
  </div>
);

// Component for AI Response
const AIResponse = ({ response, className }) => (
  <div className={`bg-transparent text-white p-64 rounded-lg max-w-2xl ${className}`}>
    <img
      src="/capt.png"
      alt="Capt"
      className="w-32 mb-2"
    />
    <p>{response}</p>
  </div>
);

// API configuration
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // We're in the browser
    return window.location.hostname === 'localhost'
      ? process.env.NEXT_PUBLIC_DEVELOPMENT_API_URL
      : process.env.NEXT_PUBLIC_PRODUCTION_API_URL;
  } else {
    // We're on the server
    return process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_PRODUCTION_API_URL
      : process.env.NEXT_PUBLIC_DEVELOPMENT_API_URL;
  }
};

const Game = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [showNameModal, setShowNameModal] = useState(false);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [playerName, setPlayerName] = useState("");
  const [aiResponse, setAiResponse] = useState('');
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    const API_BASE_URL = getApiBaseUrl();
    const leaderboardUrl = `${API_BASE_URL}/leaderboard`;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(leaderboardUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setLeaderboard(data);

    } catch (error) {
      console.error("Error fetching leaderboard:", error.message);
      setError("Failed to fetch leaderboard. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    setIsClient(true);
  }, [fetchLeaderboard]);

  const handleSubmitScore = async () => {
    if (playerName.trim() !== "") {
      try {
        const response = await fetch('/api/leaderboard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: playerName, score }),
        });

        if (response.ok) {
          fetchLeaderboard();
          setShowNameModal(false);
          setPlayerName("");
          setGameOver(false);
          setGameStarted(false);
        }
      } catch (error) {
        console.error('Error submitting score:', error);
      }
    } else {
      alert("Please enter your name before submitting your score.");
    }
  };

  const handleGameOver = async (finalScore) => {
    setScore(finalScore);
    setGameOver(true);
    setGameStarted(false);
    setShowNameModal(true);

    // Generate AI response
    try {
      const response = await fetch('/api/score-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score: finalScore }),
      });
      const data = await response.json();
      setAiResponse(data.response);
    } catch (error) {
      console.error('Error generating AI response:', error);
    }
  };

  const startNewGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setLives(3);
    setScore(0);
    setGamesPlayed(prevGames => prevGames + 1);
  };

  return (
    <div className="bg-black relative min-h-screen">
      {gameStarted && <Controls />}
      <div className="flex flex-col justify-start items-center min-h-screen relative z-10">
        <Logo />
        {!gameStarted && !gameOver && (
          <div className="w-full max-w-6xl px-4 flex flex-col items-center relative">
            <button onClick={startNewGame} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
              {gamesPlayed === 0 ? "Start Game" : "Play Again"}
            </button>
            {gamesPlayed > 0 && (
              <>
                <div className="mt-4 w-full flex justify-center">
                  <AIResponse response={aiResponse} />
                </div>
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1/4 bg-transparent-100 p-4 rounded-lg border-2 border-white">
                  <Leaderboard leaderboard={leaderboard} />
                </div>
              </>
            )}
          </div>
        )}

        {isClient && gameStarted && !gameOver && (
          <div className="flex flex-grow items-center justify-center w-full relative">
            <div className="relative w-full max-w-md h-auto">
              <P5Sketch
                key={gameStarted ? 'started' : 'not-started'}
                aiResponse={aiResponse}
                showSpeechBubble={showSpeechBubble}
                updateLives={setLives}
                handleGameOver={handleGameOver}
                setAiResponseState={setAiResponse}
              />
            </div>
            <div className="leaderboard-container absolute right-0 top-1/2 transform -translate-y-1/2 bg-transparent-100 p-4 rounded-lg border-2 border-white">
              <Leaderboard leaderboard={leaderboard} />
            </div>
          </div>
        )}

        {gameStarted && <LivesDisplay lives={lives} />}
        {showNameModal && (
          <NameModal
            score={score}
            playerName={playerName}
            setPlayerName={setPlayerName}
            handleSubmitScore={handleSubmitScore}
          />
        )}
      </div>
    </div>
  );
};

export default Game;