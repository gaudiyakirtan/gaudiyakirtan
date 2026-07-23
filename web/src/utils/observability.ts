import * as Sentry from '@sentry/react'

/**
 * Client-side error + performance monitoring (Sentry). This is the browser SDK, not
 * `@sentry/nextjs`: the app is a static export with no server runtime, so the Next server
 * instrumentation (config wrapping, source-map upload, tunnel routes) buys nothing here — the
 * value is catching errors in the reader's browser.
 *
 * **Inert until configured.** With no `NEXT_PUBLIC_SENTRY_DSN` set it initializes nothing, so the
 * bundle carries the SDK but sends zero traffic — safe to ship before a Sentry project exists. Set
 * the DSN as a (public) Vercel env var to switch it on; `NEXT_PUBLIC_VERCEL_*` are provided by
 * Vercel automatically and tag each event with its environment and deploy commit.
 */
let started = false

export function initObservability(): void {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
  if (started || !dsn || typeof window === 'undefined') return
  started = true

  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    // Read-only devotional catalog with no accounts — never attach IP/PII to events.
    sendDefaultPii: false,
    // Errors are captured in full; performance traces are sampled to keep quota sane.
    tracesSampleRate: 0.1,
    // A stale service-worker-cached bundle throwing against a newer deploy is expected noise, not a
    // real regression — drop chunk-load errors that a reload fixes.
    ignoreErrors: [/Loading chunk [\d]+ failed/, /ChunkLoadError/, /Importing a module script failed/],
  })
}

export { Sentry }
