import { useState } from 'react';
export function usePageTheme() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('giggydev-theme') === 'dark'; } catch { return false; }
  });
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    try { localStorage.setItem('giggydev-theme', next ? 'dark' : 'light'); } catch { /* Storage is optional. */ }
  }
  return { dark, toggleTheme };
}
