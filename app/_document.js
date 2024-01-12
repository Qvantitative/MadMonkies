// app/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* Include the favicon from the app directory */}
          <link rel="icon" href="/favicon.ico" type="image/x-icon" />
          {/* Add other meta tags or stylesheets here */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;