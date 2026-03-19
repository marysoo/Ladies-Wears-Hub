import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handler for startup issues
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  const root = document.getElementById('root');
  if (root && root.innerHTML === '') {
    root.innerHTML = `
      <div style="padding: 40px; font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.5;">
        <h1 style="color: #e11d48; margin-bottom: 16px;">Critical Startup Error</h1>
        <p style="color: #4b5563; margin-bottom: 24px;">The application failed to start. This is often caused by a missing configuration or a network issue.</p>
        <div style="background: #fef2f2; padding: 20px; border-radius: 12px; border: 1px solid #fee2e2; overflow: auto;">
          <pre style="margin: 0; font-size: 13px; color: #991b1b; white-space: pre-wrap;">${event.error?.stack || event.message}</pre>
        </div>
        <button onclick="window.location.reload()" style="margin-top: 24px; padding: 12px 24px; background: #111827; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
          Try Reloading
        </button>
      </div>
    `;
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
