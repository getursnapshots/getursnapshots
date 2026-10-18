import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against third-party cross-origin iframe telemetry & script errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (
      event.message === 'Script error.' ||
      event.message?.includes('Script error') ||
      event.filename?.includes('instagram.com') ||
      event.filename?.includes('facebook.com')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason?.message === 'Script error.' ||
      event.reason?.toString?.()?.includes('cross-origin')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
