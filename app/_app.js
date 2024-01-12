// app/_app.js
import React from 'react';
import '../styles/globals.css'; // Import your global styles here

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;