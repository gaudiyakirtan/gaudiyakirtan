// Rescues a URL that would otherwise 404, using the same prebuilt index and the same fuzzy ranker
// the command palette uses (src/components/SearchModal.tsx, src/services/search.ts). Pure and
// client-safe: the site is a static export, so there is no server to do this in a 301.
//
// Why this exists: song uids are case-sensitive in the route (/songs/N9 is a page, /songs/n9 is
// not), and links get retyped by hand, lowercased by chat clients, and shortened to a bare
// /akrodha in conversation. Every one of those is a reader who knows exactly what they want.
import { scoreText } from './search'

export type ISearchEntryType = 'song' | 'book' | 'topic' | 'author' | 'tag' | 'reciter'

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

// Top-level routes that have no row in the search index. Listed here only so /Songs and /ABOUT
// survive the same case fix that song uids get; they are not fuzzy-matched, because a page name
// is short and generic enough ("about", "contact") to attract false positives from song titles.
const STATIC_ROUTES = [
  '/songs',
  '/tracks',
  '/authors',
  '/topics',
  '/books',
  '/settings',
  '/about',
  '/contact',
]

// A two-segment path names one collection, so it should only ever resolve inside it - /songs/na9
// must never land on a book. A bare one-segment path has no such hint and searches everything.
const COLLECTION_SCOPES: Record<string, ISearchEntryType> = {
  songs: 'song',
  books: 'book',
  topics: 'topic',
}

/**
 * Minimum fuzzy score to redirect. The shared ranker (search.ts) scores a whole-string prefix
 * match at 80 and a substring match at 60, while its own "worth showing in a list" floor is 5 -
 * far too loose to *navigate* on. 60 is deliberately set at the substring tier: it means the typed
 * path is literally contained in the target's name ("akrodha" ⊂ "akrodha paramananda"), rather
 * than merely sharing tokens with it. A wrong redirect is worse than a 404 - the reader loses the
 * evidence of what they actually asked for - so anything softer than "your text is in this title"
 * falls through to the 404 content instead.
 */
const FUZZY_MIN_SCORE = 60

/**
 * The winner must also beat the runner-up by this factor. Two candidates scoring 80 and 79 means
 * the path is ambiguous (e.g. a word shared by several songs), and picking one of them is a coin
 * flip performed on the reader's behalf. Better to show the 404 and let them search.
 */
const FUZZY_MIN_MARGIN = 1.15

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
  const candidates = scope ? entries.filter((entry) => entry.type === scope) : entries
  const lowered = term.toLowerCase()

  // Pass 1 - the same page, differently capitalized. Covers any casing (n9, N9, gp10, Gp10)
  // because both sides are lowercased; no fuzziness is involved, so this is always safe.
  const addressable = [
    ...candidates.map((entry) => entry.href),
    // Static routes only join the search when nothing scopes it - /songs/settings is not a page.
    ...(scope ? [] : STATIC_ROUTES),
  ]
  for (const href of addressable) {
    const key = pathKey(href)
    if (!key || key.toLowerCase() !== lowered) continue
    // The path is already the canonical spelling of a real page, so it 404'd for some reason we
    // cannot fix by rewriting it. Redirecting anywhere from here would be a guess at best and a
    // loop at worst; leave the reader on the 404.
    return href === pathname ? null : { href, via: 'case' }
  }

  // Pass 2 - fuzzy, and only when the answer is not in doubt. Songs are also scored against their
  // uid so a near-miss code has a chance of finding its song. The label is the only other signal
  // used: an entry's subtitle is an author or a count, and a URL names a thing rather than
  // filtering by one, so matching on it would mostly manufacture ties.
  let bestHref = ''
  let bestScore = 0
  let runnerUpScore = 0
  for (const entry of candidates) {
    if (entry.href === pathname) continue
    const score = entry.code
      ? Math.max(scoreText(term, entry.label), scoreText(term, entry.code))
      : scoreText(term, entry.label)
    if (score > bestScore) {
      runnerUpScore = bestScore
      bestScore = score
      bestHref = entry.href
    } else if (score > runnerUpScore) {
      runnerUpScore = score
    }
  }

  if (!bestHref || bestScore < FUZZY_MIN_SCORE) return null
  if (bestScore < runnerUpScore * FUZZY_MIN_MARGIN) return null
  return { href: bestHref, via: 'fuzzy' }
}
