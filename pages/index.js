import React from 'react';
import Link from 'next/link';

const Index = () => {
  return (
    <div className="bg-customGray relative min-h-screen">
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src="/MAD.png"
          alt="Background Image"
          className="max-h-screen max-w-screen w-auto h-auto object-contain pointer-events-none"
        />
      </div>

      <div className="flex flex-col justify-start items-center min-h-screen relative">
        <img
          src="/LOGO.png"
          alt="Logo"
          className="h-32 w-64 mt-24 mb-4"
        />

        <div className="space-y-4 mt-0">
          <Button text="Discord" link="https://discord.gg/madmonkies" />
          <Button text="Twitter" link="https://twitter.com/BtcMonkies" />
          <Button text="Monkies" link="https://magiceden.io/ordinals/marketplace/madmonkies" />
          <Button text="Resident Passes" link="https://magiceden.io/ordinals/marketplace/residentpass" />
        </div>

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

const Button = ({ text, link }) => {
  return (
    <Link href={link} legacyBehavior>
      <a className="bg-customGreen hover:bg-customGreen text-center text-xl text-black font-upheavtt px-6 py-3 squared-lg transition duration-300 block">
        {text}
      </a>
    </Link>
  );
};

export default Index;
