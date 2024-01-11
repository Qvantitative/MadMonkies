import React from 'react';

export default function Example() {
  const card = {
    name: 'MONKIES ARE COMING',
    description: 'Residents in BlockTownCity should proceed immediately to the Qz Zone',
  };

  return (
    <div className="relative isolate overflow-hidden bg-gray-900 py-24 sm:py-32">
      <div className="absolute top-0 left-0 p-4">
        <a href="https://twitter.com/BtcMonkies" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-400 mr-4">
          Twitter
        </a>
        <a href="https://magiceden.io/ordinals/marketplace/madmonkies" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-400">
          MagicEden
        </a>
      </div>
      <img
        src="/mm.jpg"
        alt=""
        className="absolute inset-0 -z-10 h-full w-full object-cover object-right md:object-center"
      />
      <div className="hidden sm:absolute sm:-top-10 sm:right-1/2 sm:-z-10 sm:mr-10 sm:block sm:transform-gpu sm:blur-3xl">
        <div
          className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-[#ff4694] to-[#776fff] opacity-20"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
      <div className="absolute -top-52 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:top-[-28rem] sm:ml-16 sm:translate-x-0 sm:transform-gpu">
        <div
          className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-[#ff4694] to-[#776fff] opacity-20"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">MAD MONKIES</h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Once upon a time, but not too long ago, there existed a thriving community of monkeys who roamed Blocktown City with great enthusiasm.
            They swung from one building to another and engaged in reckless behavior, often referred to as "degen-ing" .
          </p>
        </div>
        <div className="mx-auto mt-16">
          <div className="flex gap-x-4 rounded-xl bg-white/5 p-6 ring-1 ring-inset ring-white/10">
            <div className="text-base leading-7">
              <h3 className="font-semibold text-white">{card.name}</h3>
              <p className="mt-2 text-gray-300">{card.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}