import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { DataProvider } from './contexts/DataContext';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { registerServiceWorker } from './utils/serviceWorkerRegistration';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <DataProvider>
          <WebSocketProvider>
            <App />
          </WebSocketProvider>
        </DataProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

registerServiceWorker();