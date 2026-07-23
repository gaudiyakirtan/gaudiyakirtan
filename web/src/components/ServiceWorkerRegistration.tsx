import { useEffect } from 'react'

// Registers public/sw.js. Production-only, deliberately: `next dev` rebuilds constantly and an
// active service worker caching those responses would make edits look like they "aren't taking
// effect" - a classic dev-mode PWA footgun. Renders nothing; mount once from Layout.tsx.
export const ServiceWorkerRegistration: React.FC = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Best-effort: e.g. some private-browsing modes reject registration. The app works fine
      // without a service worker, just without install/offline support.
    })
  }, [])

  return null
}

export default ServiceWorkerRegistration
