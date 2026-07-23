// Hand-rolled service worker - no workbox/next-pwa (see docs/theme + PWA task constraints).
// Kept deliberately small: this app is 736 static pages + a public S3 media bucket, not a
// classic app-shell SPA, so the job here is "make the shell installable + make repeat visits
// resilient to flaky/offline network", not "cache everything forever".
//
// CACHE_VERSION is the whole update story. Bump it whenever SHELL_URLS changes or the caching
// logic below changes in a way that should invalidate what's already on disk. Bumping it changes
// the cache names, which is what activate() uses to know which old caches to delete - see below.
// There's no bundler plugin generating this automatically (that's the tradeoff of not using
// workbox), so it's a manual step, same as bumping a version string anywhere else.
const CACHE_VERSION = 'v1'
const SHELL_CACHE = `gk-shell-${CACHE_VERSION}`
const RUNTIME_CACHE = `gk-runtime-${CACHE_VERSION}`
const CURRENT_CACHES = [SHELL_CACHE, RUNTIME_CACHE]

// The ONLY things precached at install. Everything else (hashed JS/CSS chunks, the 736 song
// pages, the JSON indexes) is populated into RUNTIME_CACHE lazily as it's actually requested -
// see the fetch handler. Precaching all 736 pages was explicitly out of scope: it would make
// every deploy re-download the entire site up front instead of only what a visitor touches.
const SHELL_URLS = [
  '/',
  '/offline.html',
  '/icon-192.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS))
  )
  // Move a waiting worker straight to "installed" instead of leaving it stuck behind still-open
  // tabs. A service worker that never updates because a tab is always open somewhere is exactly
  // the "stale SW serving an old build forever" failure mode this task calls out as worse than
  // having no SW - we'd rather have an open tab briefly hand off to the new version mid-session.
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name.startsWith('gk-') && !CURRENT_CACHES.includes(name))
          .map((name) => caches.delete(name))
      )
    )
  )
  // Paired with skipWaiting() above: take control of any already-open clients immediately so
  // the cache cleanup and new runtime strategy apply right away, not just after the next
  // full reload.
  self.clients.claim()
})

/** Only cache clean, same-origin, non-partial responses - never opaque cross-origin ones and
 * never 206 Range responses (defensive; this app doesn't intentionally send Range requests to
 * itself, but a corrupted cache entry for a partial response is worse than no entry at all). */
function isCacheable(response) {
  return response && response.ok && response.status === 200 && response.type === 'basic'
}

/** Cache-first: Next's hashed /_next/static/ chunks never change content for a given URL (the
 * hash IS the content), so once fetched there is nothing to "revalidate" - re-fetching on every
 * visit would just waste bandwidth for a byte-identical response. */
async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE)
  const cached = await cache.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (isCacheable(response)) cache.put(request, response.clone())
  return response
}

/** Stale-while-revalidate: used for navigations (visited pages) and the static JSON/MD indexes
 * (search-index.json, artist-index.json, tag-index.json, songs.md, etc.). These can change
 * between deploys, so unlike hashed chunks we do want to refresh them - but a cache hit answers
 * immediately so the app still feels instant and still works offline, while the network fetch
 * quietly updates the cache for next time. */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE)
  const cached = await cache.match(request)

  const networkFetch = fetch(request)
    .then((response) => {
      if (isCacheable(response)) cache.put(request, response.clone())
      return response
    })
    .catch(() => null)

  if (cached) {
    // Update the cache in the background; the page in front of the user keeps its already-
    // rendered copy instead of hot-swapping content underneath it mid-view.
    networkFetch.catch(() => {})
    return cached
  }

  const fresh = await networkFetch
  if (fresh) return fresh

  // No runtime cache, network failed. Fall back to the precached shell before giving up: the
  // install step put '/' in SHELL_CACHE precisely so the home page survives a first-ever offline
  // visit, but the runtime lookup above only consults RUNTIME_CACHE - without this the precached
  // copy would never actually be served and the shell precache would be dead weight.
  const shell = await caches.open(SHELL_CACHE)
  const precached = await shell.match(request)
  if (precached) return precached

  // Still nothing: for a page navigation show the offline page rather than the browser's generic
  // connection-error interstitial. For anything else (a JSON index requested for the first time
  // while offline) there's no sane HTML fallback to hand back - let the caller's existing
  // "missing data" handling deal with it, same as it would look with no service worker at all.
  if (request.mode === 'navigate') {
    const offline = await shell.match('/offline.html')
    if (offline) return offline
  }
  return Response.error()
}

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Only GET is meaningful to cache; this static site never issues same-origin POST/PUT/etc.,
  // but bail out defensively rather than assume.
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Cross-origin (the gaudiyakirtan S3 bucket serving audio + artist/collection images) is never
  // touched: no event.respondWith at all, so the browser handles it exactly as if no service
  // worker existed. This is deliberate and load-bearing, not an oversight - intercepting the
  // audio bucket would risk breaking Range-request seeking and would blow the cache storage
  // quota on multi-minute kirtan recordings. Not calling respondWith is also simpler and safer
  // than trying to allowlist-by-hostname: it can't drift out of sync with config.ts's
  // AUDIO_BASE_URL/IMAGE_BASE if those ever change.
  if (url.origin !== self.location.origin) return

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request))
    return
  }

  event.respondWith(staleWhileRevalidate(request))
})
