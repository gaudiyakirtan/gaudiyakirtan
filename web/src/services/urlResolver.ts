// Rescues a URL that would otherwise 404, using the same prebuilt index and the same fuzzy ranker
// the command palette uses (src/components/SearchModal.tsx, src/services/search.ts). Pure and
// client-safe: the site is a static export, so there is no server to do this in a 301.
//
// Why this exists: song uids are case-sensitive in the route (/songs/N9 is a page, /songs/n9 is
// not), and links get retyped by hand, lowercased by chat clients, and shortened to a bare
// /akrodha in conversation. Every one of those is a reader who knows exactly what they want.
import { scoreText, textCloseness } from './search'

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

/**
 * A hand-retyped path is at least as likely to be *misspelled* as truncated, but every tier
 * `scoreText` is confident about (exact/prefix/substring) requires the query to be literally
 * contained in the target — which a typo never is. So `/setings` scored 30.5 and fell through to
 * the 404 even though it is one dropped character from `/settings`.
 *
 * A near-miss this close is promoted to the substring tier and then judged by exactly the same
 * threshold and ambiguity margin as everything else. 0.8 admits one edit in a five-character name
 * and two in a ten-character one, while "songs"/"books" (0.4 similar) stay comfortably apart.
 */
const TYPO_MIN_SIMILARITY = 0.8

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

  // Pass 2 - fuzzy, and only when the answer is not in doubt. Songs are also scored against their
  // uid so a near-miss code has a chance of finding its song. The label is the only other signal
  // used: an entry's subtitle is an author or a count, and a URL names a thing rather than
  // filtering by one, so matching on it would mostly manufacture ties.
  let bestHref = ''
  let bestScore = 0
  let runnerUpScore = 0
  for (const entry of candidates) {
    if (entry.href === pathname) continue
    const ranked = entry.code
      ? Math.max(scoreText(term, entry.label), scoreText(term, entry.code))
      : scoreText(term, entry.label)
    // A close-enough misspelling counts as at least a substring match (see TYPO_MIN_SIMILARITY),
    // so it clears the floor and is then held to the same ambiguity margin as any other candidate.
    const typo = Math.max(
      textCloseness(term, entry.label),
      entry.code ? textCloseness(term, entry.code) : 0
    )
    const score = Math.max(ranked, typo >= TYPO_MIN_SIMILARITY ? FUZZY_MIN_SCORE : 0)
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
