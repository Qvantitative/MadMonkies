import React from "react";

const App = () => {
  return (
    <div className="bg-customGray relative min-h-screen" style={{ paddingTop: "100px" }}>
      {/* Background Image */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src="/MAD.png" // Path to your image in the "public" folder
          alt="Background Image"
          className="max-h-screen max-w-screen w-auto h-auto object-contain pointer-events-none"
        />
      </div>

      <div className="flex flex-col justify-start items-center min-h-screen relative">
        {/* Logo */}
        <img
          src="/LOGO.png" // Path to your logo image in the "public" folder
          alt="Logo"
          className="h-32 w-64 mt-4 mb-4"
        />

        <div className="space-y-4 mt-4">
          <Button text="Discord" link="https://discord.gg/WKWDM9E6" />
          <Button text="Twitter" link="https://twitter.com/BtcMonkies" />
          <Button text="Monkies" link="https://magiceden.io/ordinals/marketplace/madmonkies" />
          <Button text="Resident Passes" link="https://magiceden.io/ordinals/marketplace/residentpass" />
        </div>

        {/* Move the content to the bottom */}
        <div className="flex-grow"></div>
        <div className="mb-0 text-center text-customGreen font-joystix_monospace p-2">
          <p className="text-md">MONKEYS ARE DEAD</p>
          <p className="text-md">LONG LIVE THE MONKIES</p>
        </div>
      </div>
    </div>
  );
};

const Button = ({ text, link }) => {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-customGreen hover:bg-customGreen text-center text-xl text-black font-bold font-upheavtt px-6 py-3 squared-lg transition duration-300 block"
    >
      {text}
    </a>
  );
};

export default App;