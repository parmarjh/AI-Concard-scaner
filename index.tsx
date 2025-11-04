import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HashRouter } from 'react-router-dom';
import './i18n'; // Import i18next configuration
import { SpinnerIcon } from './components/icons';

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const loadingMarkup = (
  <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-light">
    <SpinnerIcon className="w-16 h-16 text-primary animate-spin-slow" />
    <p className="mt-4 text-neutral-dark text-lg">Loading...</p>
  </div>
);


const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <React.Suspense fallback={loadingMarkup}>
      <HashRouter>
        <App />
      </HashRouter>
    </React.Suspense>
  </React.StrictMode>
);