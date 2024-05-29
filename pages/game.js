require('dotenv').config();
import React from "react";
import dynamic from 'next/dynamic';

const P5Sketch = dynamic(() => import('../components/P5Sketch'), {
  ssr: false,
});

const Game = () => {

  return (
    <div className="bg-customGray relative min-h-screen">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Background Image */}
        <img
          src="/MAD.png" // Path to your image in the "public" folder
          alt="Background Image"
          className="max-h-screen max-w-screen w-auto h-auto object-contain pointer-events-none"
        />
      </div>

      <div className="flex flex-col justify-start items-center min-h-screen relative">
        {/* Logo (Adjusted margin-top for higher positioning) */}
        <img
          src="/LOGO.png" // Path to your logo image in the "public" folder
          alt="Logo"
          className="h-32 w-64 mt-24 mb-4" // Adjusted mt-12 to move it higher
        />

        <div className="mx-auto max-w text-center">
            <div className="flex justify-center items-center h-screen bg-gray-900">
                <P5Sketch />
            </div>
        </div>

        {/* Move the content to the bottom */}
        <div className="h-72"></div>
        <div className="mb-0 text-center text-customGreen font-joystix_monospace p-0">
          <p className="text-xs">MONKEYS ARE DEAD</p>
        </div>
        <div className="mb-0 text-center text-customGreen font-upheavtt p-0">
          <p className="text-md">LONG LIVE THE MONKIES</p>
        </div>
      </div>
    </div>
  );
};

export default Game;
