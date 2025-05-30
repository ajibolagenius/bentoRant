import { createRoot } from 'react-dom/client'
import DOMPurify from 'dompurify'
import App from './App.tsx'
import './index.css'

// Initialize DOMPurify with secure configuration
DOMPurify.setConfig({
    ADD_ATTR: ['target'], // Allow target attribute for links
    FORBID_TAGS: ['style', 'script'], // Explicitly forbid potentially dangerous tags
    FORBID_ATTR: ['style', 'onerror', 'onload'] // Forbid event handler attributes
});

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker for offline support (allow in dev for push notification testing)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(
            registration => {
                // console.log('Service Worker registered:', registration);
            },
            err => {
                // console.error('Service Worker registration failed:', err);
            }
        );
    });
}
