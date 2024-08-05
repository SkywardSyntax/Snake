import '../styles/global.css'
import { useState, useEffect, createContext } from 'react';

export const ThemeContext = createContext();

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}
