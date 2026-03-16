import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="Travellyhub — Search and compare flights from hundreds of airlines worldwide. Find the best prices for your next trip." />
        <meta property="og:site_name" content="Travellyhub" />
        <meta property="og:title" content="Travellyhub — Find & Compare Flights" />
        <meta property="og:description" content="Search and compare flights from multiple airlines. Best prices, instant results." />
        <meta name="theme-color" content="#1d4ed8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
