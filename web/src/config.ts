// App-wide runtime config constants. Kept tiny and dependency-free so it can be imported from
// both server (getStaticProps) and client code.

/**
 * Artwork for a Gaudiya lunar month, served from `public/assets/months/`.
 *
 * The twelve Gaudiya months are named for forms of Viṣṇu (Vāmana, Dāmodara, Keśava, …), so the
 * month name is also the subject of its artwork. Images are **self-hosted**, not hotlinked: the
 * app is offline-first, and upstream hosts (Wikimedia among them) ask not to be hotlinked.
 *
 * Most months have no image yet and will 404 — callers MUST degrade gracefully to the banner's
 * gradient (see components/HeroBanner.tsx), exactly as book covers do. Provenance and licensing
 * for each file are recorded in `public/assets/months/CREDITS.md`.
 */
export function monthImageUrlFor(gaudiyaMonth: string): string {
  const slug = gaudiyaMonth
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
  return `/assets/months/${slug}.jpg`
}

/**
 * Contact + project links, surfaced by /about and /contact (docs/screens/about-contact.md).
 *
 * ⚠️ `CONTACT_EMAIL` is a PLACEHOLDER. No contact address exists anywhere in this repo, so this
 * one is invented scaffolding - replace it with the real address (or delete the mailto affordance)
 * before shipping. `/contact` renders a "not yet published" state when it is left unset, rather
 * than mailing a dead address.
 */
export const CONTACT_EMAIL: string | null = null // TODO: set the real address
export const PROJECT_SITE = 'https://www.gaudiyakirtan.com'

/**
 * Canonical origin for SEO — the URL search engines should treat as the real home of this content,
 * used for `<link rel="canonical">`, `og:url`, and the sitemap. Defaults to the production apex
 * ([PROJECT_SITE]) rather than wherever a given deploy happens to serve (e.g. dev.gaudiyakirtan.com),
 * so preview/dev deploys declare production as canonical and don't get indexed as duplicates.
 * Override per-environment with `NEXT_PUBLIC_SITE_URL` (no trailing slash) if that ever changes.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || PROJECT_SITE).replace(/\/$/, '')

/** Absolute canonical URL for a site-relative path (e.g. `canonical('/songs/N9')`). */
export function canonical(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/** The default social-share image (1200×630), served from public/. */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

/** Human-readable site name for `og:site_name` / structured data. */
export const SITE_NAME = 'Gaudiya Kirtan'

/**
 * Base URL for the public `gaudiyakirtan` S3 bucket's `audio/` prefix (docs/screens/player.md).
 * The playable URL for an AudioTrack (docs/data/song.md) is `AUDIO_BASE_URL + filename`,
 * e.g. `AUDIO_BASE_URL + "A10-bvsm-1.mp3"`. No auth required - the bucket is public.
 */
export const AUDIO_BASE_URL = 'https://gaudiyakirtan.s3.amazonaws.com/audio/'

/** The playable URL for an AudioTrack's filename. */
export function audioUrlFor(filename: string): string {
  return AUDIO_BASE_URL + filename
}

/**
 * Base URL for the public `gaudiyakirtan` S3 bucket itself (docs/screens/player.md,
 * docs/data/collections.md). Houses `audio/` (see AUDIO_BASE_URL above), `artists/`, and
 * `collections/` prefixes. Image lookups here are best-effort - most slugs 404 (no image
 * shipped yet for that artist/book) - callers MUST degrade gracefully (onError -> placeholder),
 * never block/crash on a missing image.
 */
export const IMAGE_BASE = 'https://gaudiyakirtan.s3.amazonaws.com/'

/**
 * The artist-code prefix of an AudioTrack `uid`, e.g. `"bvsm-2"` -> `"bvsm"`, `"anad-1"` ->
 * `"anad"` (docs/data/collections.md). Every track uid in the shipped corpus matches
 * `<code>-<take number>`; falls back to the whole uid on an unexpected shape rather than throwing.
 */
export function artistCodeFromTrackUid(trackUid: string): string {
  const match = /^([a-z]+)-\d+$/i.exec(trackUid)
  return match ? match[1] : trackUid
}

/** Artist portrait URL for a recording, e.g. `artistImageUrlFor("bvsm-1")` ->
 * `.../artists/bvsm.jpg` (docs/data/collections.md). Most artist codes have no portrait yet -
 * render with a graceful onError fallback, never a broken-image icon. */
export function artistImageUrlFor(trackUid: string): string {
  return `${IMAGE_BASE}artists/${artistCodeFromTrackUid(trackUid)}.jpg`
}

/** Optional book-cover image URL for a SongGroup('book'), by slug (docs/data/collections.md:
 * `gaura`/`nitai`/`radha` currently exist on the bucket; most other slugs 404). Callers must fall
 * back to the group's `color` accent on load failure - see components/BookCard.tsx. */
export function collectionCoverUrlFor(slug: string): string {
  return `${IMAGE_BASE}collections/${slug}.jpg`
}
