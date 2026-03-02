import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// ── Service Worker (PWA) ─────────────────────────────────────
if ('serviceWorker' in navigator && !import.meta.env.PROD) {
  // DEV: Unregister any previously registered service workers
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
      console.log('[PWA] Service Worker unregistered (dev mode)');
    });
  });
} else if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker enregistré:', registration.scope);

        // Vérifier les mises à jour toutes les heures
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

        // Nouvelle version disponible → activer automatiquement
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
                // Nouvelle version installée — rafraîchir au prochain chargement
                console.log('[PWA] Nouvelle version disponible');
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('[PWA] Erreur enregistrement SW:', error);
      });
  });
}
