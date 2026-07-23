# Screen — Observability

**Spec version:** 1

**Figma frames:** none — infrastructure.

## Purpose

Know when the deployed web app breaks or is slow for a real reader — without collecting anything
personal (the app has no accounts and advertises "no data collected").

## Analytics (Vercel)

- **Vercel Analytics** + **Speed Insights** — first-party, **cookieless**, no consent banner needed.
  Mounted in `_app.tsx`; aggregate page + Web-Vitals data, no PII.

## Error monitoring (Sentry — `utils/observability.ts`)

- **`@sentry/react`, deliberately NOT `@sentry/nextjs`** — a **static export with no server runtime**,
  so the Next server instrumentation (config wrapping, source-map upload, tunnel routes) buys nothing;
  the value is catching errors in the reader's browser.
- **Inert until configured.** With no `NEXT_PUBLIC_SENTRY_DSN` the SDK initializes nothing and sends
  zero traffic — safe to ship before a Sentry project exists. Setting the (public) DSN switches it on.
- Tags each event with `NEXT_PUBLIC_VERCEL_ENV` and the deploy commit
  (`NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA`); `sendDefaultPii: false` (never attach IP/PII);
  `tracesSampleRate: 0.1`.
- **Noise control.** Drops stale-service-worker chunk-load errors (`Loading chunk … failed`,
  `ChunkLoadError`, `Importing a module script failed`) — a cached old bundle throwing against a newer
  deploy is expected, not a regression (see [`pwa.md`](pwa.md)).
- **`Sentry.ErrorBoundary` + `CrashFallback`** wrap the app: render-time crashes (invisible to
  `window.onerror`) show an on-theme fallback, not a white screen.

## Per-platform notes

- **Web only.** Native crash/analytics would use their own platform tooling if added later.

## Verification

- With no DSN set: no Sentry traffic, no console errors (fully inert).
- With a DSN: a thrown test error reaches Sentry tagged with env + commit; chunk-load errors are
  filtered out.
- A render-time throw shows `CrashFallback`, not a blank page.

## Change log

- **v1** — Initial spec: cookieless Vercel Analytics + Speed Insights; `@sentry/react` (not nextjs),
  inert-until-DSN, PII-free, sampled, chunk-load noise dropped; `ErrorBoundary` + `CrashFallback`.
