import React, { useState } from "react";
import dynamic from 'next/dynamic';
import Leaderboard from '../components/Leaderboard'; // Import the leaderboard component

const P5Sketch = dynamic(() => import('../components/P5Sketch'), {
  ssr: false,
});

const Game = () => {
  const [lives, setLives] = useState(3);

  return (
    <div className="bg-black relative min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src="/images/BGPage.png"
          alt="Background Image"
          className="pointer-events-none"
          style={{ width: '75%', height: '75%' }}
        />
      </div>

      {/* Controls for Larger Screens */}
      <div className="controls-container absolute left-0 top-1/2 transform -translate-y-1/2 hidden sm:flex" style={{ padding: '350px' }}>
        <img
          src="/images/controls.png"
          alt="Controls"
          className="w-40 sm:w-48 h-auto"
        />
      </div>

      <div className="flex flex-col justify-start items-center min-h-screen relative z-10">
        {/* Logo */}
        <img
          src="/LOGO.png"
          alt="Logo"
          className="h-24 w-48 sm:h-32 sm:w-64 mt-6 mb-4"
        />

        <div className="flex flex-grow items-center justify-center w-full px-2 sm:px-4 relative">
          {/* Sketch Component */}
          <div className="flex-grow flex items-center justify-center w-full">
            <div className="relative w-full max-w-md h-auto">
              <P5Sketch updateLives={setLives} />
            </div>
          </div>

          {/* Leaderboard */}
          <div className="leaderboard-container absolute right-0 top-1/2 transform -translate-y-1/2">

          </div>
        </div>

        {/* Lives Display */}
        <div className="absolute left-0 ml-4 mb-4 flex items-center" style={{ bottom: '40px' }}>
          <img
            src="/images/serum.png"
            alt="Serum"
            className="w-8 h-auto"
          />
          <span className="text-white ml-2">{lives}</span>
        </div>
      </div>
    </div>
  );
};

export default Game;
