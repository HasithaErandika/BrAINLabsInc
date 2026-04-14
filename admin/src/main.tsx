import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { setAuthToken } from './api'

// ── Synchronous token bootstrap ───────────────────────────────────────────────
// Zustand's onRehydrateStorage fires AFTER the first React render, so there is
// a window where ProtectedRoute has already mounted (and triggered API calls)
// but _authToken is still null. Reading from localStorage here — before any
// React code runs — closes that gap completely.
try {
  const raw = localStorage.getItem('brain_labs_auth');
  if (raw) {
    const token = JSON.parse(raw)?.state?.token;
    if (typeof token === 'string' && token.length > 0) {
      setAuthToken(token);
    }
  }
} catch { /* malformed storage — ignore */ }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
