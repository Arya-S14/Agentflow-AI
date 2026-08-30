import React, { useEffect } from 'react';
import '../styles/globals.css';
import api from '../services/api';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Automatically ping Render backend in the background to wake up free-tier container
    if (typeof window !== 'undefined') {
      api.get('/health').catch(() => {});
    }
  }, []);

  return <Component {...pageProps} />;
}
