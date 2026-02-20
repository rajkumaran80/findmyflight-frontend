import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { loadAirports } from '@/lib/airports';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Preload airports data on app start
    loadAirports();
  }, []);

  return <Component {...pageProps} />;
}
