import ReactDOM from 'react-dom/client'
import React from 'react'
import { MotionConfig } from 'framer-motion'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import './index.css'
import './i18n'

/**
 * MotionConfig (Phase 1.8 — accessibility):
 * - reducedMotion="user"  → respect the user's OS-level reduce-motion preference
 *   and skip transform/scale/opacity transitions automatically.
 * - transition={{ ... }} provides sensible defaults for the whole tree.
 *
 * Individual components can still override per-animation as needed.
 */
const motionDefaults = {
  // spring tuned for "responsive but not bouncy" — used as default for spring transitions
  type: 'spring',
  stiffness: 320,
  damping: 28,
  mass: 0.8,
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user" transition={motionDefaults}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy_client_id'}>
        <App />
      </GoogleOAuthProvider>
    </MotionConfig>
  </React.StrictMode>,
)
