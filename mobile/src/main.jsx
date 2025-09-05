import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Inizializzazione configurazione backend
import { validateBackendConfig, debugBackendConfig } from './config/backend.js'
import { quickConfigTest } from './utils/configTest.js'

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('🔧 SW registrato:', registration.scope);
      })
      .catch((registrationError) => {
        console.log('❌ SW registration failed:', registrationError);
      });
  });
}

// Prevent context menu on long press
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

// Handle viewport height changes (mobile keyboard)
function setVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setVH();
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', () => {
  setTimeout(setVH, 100);
});

// Inizializzazione e validazione configurazione backend
console.log('🚀 Inizializzazione Movie Collection Mobile App')
quickConfigTest()

// In sviluppo, rendi disponibili utility di debug
if (import.meta.env.DEV) {
  import('./utils/configTest.js').then(({ testBackendConfiguration, debugConfiguration }) => {
    console.log('🔧 Utility di debug disponibili:')
    console.log('  - window.testBackendConfig() - Test completo configurazione')
    console.log('  - window.quickConfigTest() - Test rapido configurazione') 
    console.log('  - window.quickConnectivityTest() - Test connettività')
    console.log('  - window.debugConfig() - Debug configurazione')
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
