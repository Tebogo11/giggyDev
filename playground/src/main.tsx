import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';
import { markSourceUpdate } from './features/code-fix-demo/useResettablePadding';

// Explicit playground-only opt-in: all hosted builds keep the widget and mock chat.
if (import.meta.env.PROD) void import('./features/simulated-chat/bootstrap');
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
// Keep the independent debugger root mounted while playground source changes.
if (import.meta.hot) import.meta.hot.accept('./App', next => {
  if (next) { markSourceUpdate(); root.render(<next.App />); }
});
