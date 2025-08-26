import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from './components/ThemeProvider';
import { analytics } from '../firebase-config';

// Initialize Firebase Analytics
import { logEvent } from 'firebase/analytics';

// Log a page view event
logEvent(analytics, 'page_view');
console.log('Firebase Analytics is ready!');

// Add error boundary
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    console.log('vite:beforeUpdate');
  });
}

// Create a container for the app
const root = document.getElementById('root');

// Render the app
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
}