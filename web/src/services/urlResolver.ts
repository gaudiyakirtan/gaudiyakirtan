// Rescues a URL that would otherwise 404, using the same prebuilt index and the same fuzzy ranker
// the command palette uses (src/components/SearchModal.tsx, src/services/search.ts). Pure and
// client-safe: the site is a static export, so there is no server to do this in a 301.
//
// Why this exists: song uids are case-sensitive in the route (/songs/N9 is a page, /songs/n9 is
// not), and links get retyped by hand, lowercased by chat clients, and shortened to a bare
// /akrodha in conversation. Every one of those is a reader who knows exactly what they want.
import { buildDuet, searchDuet, type IDuetDoc } from './duet'

export type ISearchEntryType = 'page' | 'song' | 'book' | 'topic' | 'author' | 'tag' | 'reciter'

/** One row of /search-index.json, emitted by scripts/gen-markdown.mjs. */
export interface ISearchEntry {
  type: ISearchEntryType
  label: string
  subtitle?: string
  href: string
  /** Song uid, e.g. "N9" - only songs carry one. */
  code?: string
}

export interface IResolvedPath {
  href: string
  /** 'case' = the same page under different capitalization; 'fuzzy' = a confident guess. */
  via: 'case' | 'fuzzy'
}

/**
 * The app's own pages. These have no row in the build-time `/search-index.json` (which only carries
 * data entities), so they must be listed here — and this is the **single source of truth** shared
 * with the command palette (`components/SearchModal.tsx`), which previously kept a second, longer
 * copy. That drift was user-visible: the palette found "Settings" from a typo while `/setings`
 * 404'd, because pages simply were not in this resolver's pool.
 *
 * They now take part in fuzzy matching too. The old note here worried that page names are "short and
 * generic enough to attract false positives from song titles" — but the corpus is transliterated
 * Sanskrit/Bengali, so English page names barely collide with it ("setings" scores 30.5 against
 * "Settings" and 7.1 against the best song), and the ambiguity margin below is the real guard.
 */
export const NAV_ENTRIES: ISearchEntry[] = [
  { type: 'page', label: 'Home', subtitle: 'Page', href: '/' },
  { type: 'page', label: 'Songs', subtitle: 'Page · library', href: '/songs' },
  { type: 'page', label: 'Tracks', subtitle: 'Page · library · recordings', href: '/tracks' },
  { type: 'page', label: 'Authors', subtitle: 'Page · library', href: '/authors' },
  { type: 'page', label: 'Topics', subtitle: 'Page · library', href: '/topics' },
  { type: 'page', label: 'Books', subtitle: 'Page · library', href: '/books' },
  { type: 'page', label: 'Settings', subtitle: 'Page', href: '/settings' },
  { type: 'page', label: 'About', subtitle: 'Page', href: '/about' },
  { type: 'page', label: 'Contact', subtitle: 'Page', href: '/contact' },
  { type: 'page', label: 'Verse Meters', subtitle: 'Page · resources', href: '/resources/meters' },
  { type: 'page', label: 'Diacritic Guide', subtitle: 'Page · resources', href: '/resources/diacritics' },
  { type: 'page', label: 'Pronunciation', subtitle: 'Page · resources', href: '/resources/pronunciation' },
]

// A two-segment path names one collection, so it should only ever resolve inside it - /songs/na9
// must never land on a book. A bare one-segment path has no such hint and searches everything.
const COLLECTION_SCOPES: Record<string, ISearchEntryType> = {
  songs: 'song',
  books: 'book',
  topics: 'topic',
}

/**
 * Minimum Duet score to redirect on. Duet's title path scores a reranked confident match in the low
 * single digits (a gram term near 1 plus wTitleRerank × rerank ≈ 3), while a lone shared trigram
 * scores a fraction of that. This floor sits above the noise: it means "your text really is (most
 * of) this title", not "you happen to share a few characters with it". A wrong redirect is worse
 * than a 404 — the reader loses the evidence of what they actually asked for — so a weak match falls
 * through to the 404 content instead. Duet is what the command palette uses, so both search paths
 * now agree on what a match is; only the acceptance bar differs (a list can afford noise; a
 * redirect cannot).
 */
const DUET_MIN_SCORE = 1.5

/**
 * The winner must also beat the runner-up by this factor. Two candidates within 15% of each other
 * (e.g. śrīgaura-ārati / śrīyugala-ārati both matched by "/arati") means the path is ambiguous, and
 * picking one of them is a coin flip performed on the reader's behalf. Show the 404 and let them
 * search instead.
 */
const DUET_MIN_MARGIN = 1.15

/** Percent-decode one path segment, tolerating the malformed escapes that hand-typed URLs carry. */
function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

/**
 * The final path segment an entry can be addressed by, or null if it has none. Author/tag/reciter
 * rows are filters (/songs?tag=…), not paths - they share the /songs segment with the library
 * route itself, so they can never be identified by segment and take part in fuzzy matching only.
 */
function pathKey(href: string): string | null {
  if (href.includes('?')) return null
  const segments = href.split('/').filter(Boolean)
  return segments.length ? segments[segments.length - 1] : null
}

interface IParsedPath {
  term: string
  /** null = search every type (a bare root path). */
  scope: ISearchEntryType | null
}

function parsePath(pathname: string): IParsedPath | null {
  const segments = pathname.split('/').filter(Boolean).map(decodeSegment)
  if (segments.length === 1) return { term: segments[0], scope: null }
  if (segments.length === 2) {
    const scope = COLLECTION_SCOPES[segments[0].toLowerCase()]
    // An unknown two-segment prefix (/resources/typo) is left alone: we have nothing to search.
    return scope ? { term: segments[1], scope } : null
  }
  return null
}

/**
 * Best guess at what a 404ing path meant, or null to show the 404 as-is.
 *
 * Every href returned comes from the prebuilt index or STATIC_ROUTES, so it is a route that
 * definitely exists - a redirect can never bounce into another 404. The one remaining loop risk is
 * resolving a path to itself, which is checked explicitly.
 */
export function resolvePath(pathname: string, entries: ISearchEntry[]): IResolvedPath | null {
  const parsed = parsePath(pathname)
  if (!parsed || !parsed.term) return null

  const { term, scope } = parsed
  // Pages join the pool only when nothing scopes the path - /songs/settings is not a page. Being
  // typed entries, the scope filter below excludes them on its own.
  const pool = scope ? entries : [...NAV_ENTRIES, ...entries]
  const candidates = scope ? pool.filter((entry) => entry.type === scope) : pool
  const lowered = term.toLowerCase()

  // Pass 1 - the same page, differently capitalized. Covers any casing (n9, N9, gp10, Gp10)
  // because both sides are lowercased; no fuzziness is involved, so this is always safe.
  for (const href of candidates.map((entry) => entry.href)) {
    const key = pathKey(href)
    if (!key || key.toLowerCase() !== lowered) continue
    // The path is already the canonical spelling of a real page, so it 404'd for some reason we
    // cannot fix by rewriting it. Redirecting anywhere from here would be a guess at best and a
    // loop at worst; leave the reader on the 404.
    return href === pathname ? null : { href, via: 'case' }
  }

  // Pass 2 - fuzzy, and only when the answer is not in doubt. The same Duet matcher the command
  // palette uses (services/duet.ts) ranks the candidates, so both search paths agree on relevance.
  // Only the LABEL is indexed here, never verse content: a URL names a thing, it does not quote a
  // line of one, and letting a path match a verse would manufacture wrong redirects. Codes are
  // handled exactly by pass 1 above; a near-miss code ("NA9", one edit from both N9 and A9) is left
  // to 404 rather than trigram-guessed onto whichever song happens to share more characters.
  const docs: IDuetDoc[] = candidates.map((entry, ref) => ({ ref, title: [entry.label], content: [] }))
  const ranked = searchDuet(buildDuet(docs), term, 5).filter((r) => candidates[r.ref].href !== pathname)
  const best = ranked[0]
  const runnerUp = ranked[1]
  if (!best || best.score < DUET_MIN_SCORE) return null
  if (runnerUp && best.score < runnerUp.score * DUET_MIN_MARGIN) return null
  return { href: candidates[best.ref].href, via: 'fuzzy' }
}
