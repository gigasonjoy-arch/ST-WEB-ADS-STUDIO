import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './context/LanguageContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Suppress benign Vite dev server WebSocket / HMR connection messages
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = typeof event.reason === 'string' ? event.reason : (event.reason?.message || '');
    if (reasonStr.includes('WebSocket') || reasonStr.includes('websocket') || reasonStr.includes('vite')) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (msg.includes('WebSocket') || msg.includes('websocket') || msg.includes('vite')) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>,
);

