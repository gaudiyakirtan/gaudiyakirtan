# Screen — Progressive Web App (offline & install)

**Spec version:** 1

**Figma frames:** none — infrastructure, built behaviorally.

## Purpose

Make the web app **installable** and make repeat visits **resilient to flaky/offline network** —
without turning it into a classic app-shell SPA. The app is 700+ static pages plus a public S3 media
bucket, so the job is "the shell installs and visited pages keep working offline," not "cache
everything forever."

## Pieces

- **Manifest** (`public/manifest.json`, linked from `Layout`) — name, theme/background colours from
  the real Gaura/Shyam palette, and the icons (`icon-192.png` / `icon-512.png`, `purpose: "any"` —
  the art bleeds to the canvas edge, so **not** maskable). This is what makes the app installable.
- **Service worker** (`public/sw.js`), registered by `components/ServiceWorkerRegistration.tsx`.
- **Offline fallback** (`public/offline.html`) — shown for a navigation that misses both caches.

## Service worker behaviour (`public/sw.js`)

Hand-rolled — **no** `next-pwa` / Workbox (zero new deps; Next-15 support for those is shaky). Two
caches, both versioned by one `CACHE_VERSION` constant (`gk-shell-<v>`, `gk-runtime-<v>`).

- **Install** precaches only a **3-URL shell** (`/`, `/offline.html`, `/icon-192.png`) — never the
  700+ pages, which would re-download the whole site on every deploy. `skipWaiting()` so a new worker
  isn't stuck behind an open tab.
- **Activate** deletes any `gk-*` cache not in the current set, then `clients.claim()`.
- **Fetch** (same-origin `GET` only):
  - `/_next/static/*` → **cache-first** (the hash *is* the content; nothing to revalidate).
  - everything else same-origin (navigations + the JSON/MD indexes) → **stale-while-revalidate** — a
    cache hit answers instantly and works offline while the network quietly refreshes for next time;
    a miss that fails offline falls back to the precached `/`, then `/offline.html` for navigations.
  - **Cross-origin is never intercepted** (no `respondWith`) — the S3 audio/image bucket behaves as
    if no worker existed. Load-bearing: intercepting it would break audio Range-request seeking and
    blow the cache quota on multi-minute recordings; an **origin check** (not a hostname allowlist)
    can't drift out of sync with `config.ts`.
- Only clean responses are stored: `ok && status === 200 && type === 'basic'` (never opaque
  cross-origin or `206` partials).

## Update story

`CACHE_VERSION` is the entire update mechanism (the tradeoff of not using Workbox): **bump it** when
`SHELL_URLS` or the caching logic changes, so `activate` evicts the old caches. A missed bump degrades
to *one* stale view via stale-while-revalidate — not a build pinned forever.

## Per-platform notes

- **Web only.** iOS/Android are native apps with their own bundled-corpus offline stores; PWA is a
  web concern.

## Verification

- Manifest valid and the app installable (Lighthouse PWA / install affordance).
- Offline: a previously-visited page still renders; a never-visited navigation shows `offline.html`;
  S3 audio is unaffected by the worker.
- Bumping `CACHE_VERSION` evicts the old caches on next activation.

## Change log

- **v1** — Initial spec for the hand-rolled service worker + manifest: 3-URL shell precache,
  cache-first hashed static / stale-while-revalidate same-origin, cross-origin S3 bypass, and the
  `CACHE_VERSION` update model.
