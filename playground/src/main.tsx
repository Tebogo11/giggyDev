import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';

// Explicit playground-only opt-in: all hosted builds keep the widget and mock chat.
if (import.meta.env.PROD) void import('./features/simulated-chat/bootstrap');
createRoot(document.getElementById('root')!).render(<App />);
