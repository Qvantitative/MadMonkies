require('dotenv').config();
import React from "react";
import dynamic from 'next/dynamic';

const P5Sketch = dynamic(() => import('../components/P5Sketch'), {
  ssr: false,
});

const Game = () => {
  return (
    <div className="bg-black relative min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src="/MAD.png" // Path to your image in the "public" folder
          alt="Background Image"
          className="w-full h-full object-cover pointer-events-none"
        />
      </div>

      <div className="flex flex-col justify-start items-center min-h-screen relative z-10">
        {/* Logo */}
        <img
          src="/LOGO.png" // Path to your logo image in the "public" folder
          alt="Logo"
          className="h-24 w-48 sm:h-32 sm:w-64 mt-6 mb-4" // Responsive height and width
        />

        {/* Sketch Component */}
        <div className="flex-grow flex items-center justify-center w-full px-2 sm:px-4">
          <div className="w-full max-w-md h-auto">
            <P5Sketch />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
