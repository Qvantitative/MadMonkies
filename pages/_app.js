// pages/_app.js
import '../styles/globals.css';
import React from 'react';
import { ThemeProvider } from 'next-themes';
import { ClientProvider } from '@micro-stacks/react';

function MyApp({ Component, pageProps }) {
  return (
    <ClientProvider
      appName="Nextjs + Microstacks"
      appIconUrl="/vercel.png"
    >
      <ThemeProvider attribute="class">
        <Component {...pageProps} />
      </ThemeProvider>
    </ClientProvider>
  );
}

export default MyApp;
