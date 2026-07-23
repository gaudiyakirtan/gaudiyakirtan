// Offline, diacritic-insensitive fuzzy search over the embedded Manifest (docs/screens/search.md,
// tier 1). Matches a query against every title script + the resolved author name; ranks
// exact/prefix > substring > fuzzy, and title above author. Fully client-safe (no fs) - the
// /search page builds the index once from the bundled listings and queries it per keystroke.
//
// The matcher is deliberately abstracted behind buildSearchIndex/searchIndex so an optional
// semantic tier (docs/screens/search.md tier 2) can layer behind the same result shape later.
import type { ISongListing } from './songListingView'

/**
 * Normalize for matching: NFD-decompose and strip combining marks (ā→a, ṁ→m, ś→s, ṛ→r),
 * lowercase, turn punctuation into spaces, collapse whitespace. Indic scripts are preserved
 * (their combining signs are outside the Latin ̀-ͯ range) so native-script queries match.
 */
export function normalizeSearchText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    // Bengali/Gauḍīya transliteration uses one letter for v/b (madhava↔madhaba,
    // viṁśottara↔biṁśottara); fold them so either spelling matches.
    .replace(/v/g, 'b')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(normalized: string): string[] {
  return normalized ? normalized.split(' ') : []
}

/** Levenshtein similarity ratio in [0,1]; 1 = identical. */
function similarity(a: string, b: string): number {
  if (a === b) return 1
  const max = Math.max(a.length, b.length)
  if (max === 0) return 1
  // Length gap alone already exceeds any useful threshold - skip the DP.
  if (Math.abs(a.length - b.length) / max > 0.5) return 0

  const prev = new Array(b.length + 1)
  const curr = new Array(b.length + 1)
  for (let j = 0; j <= b.length; j++) prev[j] = j
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j]
  }
  return 1 - prev[b.length] / max
}

/**
 * Best match score in [0,1] of one query token against a set of target tokens. Prefix/containment
 * are weighted by the MATCHED (shorter) token length so a short common token like "sri" prefixing a
 * long run-on query token scores low, while a real word inside a compound scores high - otherwise
 * every "śrī…" title would drown out the real fuzzy match.
 */
function tokenScore(queryToken: string, targetTokens: string[]): number {
  let best = 0
  for (const tt of targetTokens) {
    let m: number
    if (tt === queryToken) {
      m = 1
    } else {
      const shorter = queryToken.length <= tt.length ? queryToken : tt
      const longer = shorter === queryToken ? tt : queryToken
      // A prefix/substring match is confident in proportion to the MATCHED length, not the ratio -
      // a 7-char word inside a 16-char compound (radhika ⊂ sriradhikastakam) is a strong signal,
      // while a 3-char "sri" prefixing a long run-on query token is weak.
      const lenScore = Math.min(0.92, 0.45 + 0.07 * shorter.length)

      m = similarity(queryToken, tt)
      if (longer.startsWith(shorter)) m = Math.max(m, lenScore)
      else if (shorter.length >= 3 && longer.includes(shorter)) m = Math.max(m, lenScore - 0.05)
    }
    if (m > best) {
      best = m
      if (best === 1) break
    }
  }
  return best
}

/** Score one normalized target (a title or author) against the normalized query. Higher is better. */
function scoreTarget(
  queryNorm: string,
  queryTokens: string[],
  targetNorm: string,
  targetTokens: string[]
): number {
  if (!queryNorm || !targetNorm) return 0

  // Whole-string tiers: exact > prefix > substring.
  let whole = 0
  if (targetNorm === queryNorm) whole = 100
  else if (targetNorm.startsWith(queryNorm)) whole = 80
  else if (queryNorm.length >= 2 && targetNorm.includes(queryNorm)) whole = 60

  // Token tier: sum of best per-token matches (rewards a distinctive matching token even when the
  // rest of the query is noisy) plus a coverage bonus for matching most of the query.
  let sum = 0
  let matched = 0
  for (const qt of queryTokens) {
    const s = tokenScore(qt, targetTokens)
    sum += s
    if (s >= 0.7) matched += 1
  }
  const coverage = queryTokens.length ? matched / queryTokens.length : 0
  const tokenTier = sum * 12 + coverage * 20

  return Math.max(whole, tokenTier)
}

interface IndexedListing {
  listing: ISongListing
  titleNorms: string[]
  titleTokens: string[][]
  authorNorm: string
  authorTokens: string[]
}

export interface ISearchIndex {
  entries: IndexedListing[]
}

/** Precompute normalized titles/author once; reused across keystrokes. */
export function buildSearchIndex(listings: ISongListing[]): ISearchIndex {
  const entries = listings.map((listing) => {
    const titleNorms = listing.titles.map((t) => normalizeSearchText(t.text)).filter(Boolean)
    const authorNorm = normalizeSearchText(listing.authorName)
    return {
      listing,
      titleNorms,
      titleTokens: titleNorms.map(tokenize),
      authorNorm,
      authorTokens: tokenize(authorNorm),
    }
  })
  return { entries }
}

export interface ISearchResult {
  listing: ISongListing
  score: number
}

/** Minimum score to surface a result - keeps noise out while allowing a single strong token match. */
const SCORE_FLOOR = 5
/** Author matches rank below title matches (docs/screens/search.md). */
const AUTHOR_WEIGHT = 0.6

/** Ranked results for a query. Returns [] for an empty query (idle state). */
export function searchIndex(query: string, index: ISearchIndex, limit = 50): ISearchResult[] {
  const queryNorm = normalizeSearchText(query)
  if (!queryNorm) return []
  const queryTokens = tokenize(queryNorm)

  const results: ISearchResult[] = []
  for (const entry of index.entries) {
    let titleScore = 0
    for (let i = 0; i < entry.titleNorms.length; i++) {
      const s = scoreTarget(queryNorm, queryTokens, entry.titleNorms[i], entry.titleTokens[i])
      if (s > titleScore) titleScore = s
    }
    const authorScore =
      scoreTarget(queryNorm, queryTokens, entry.authorNorm, entry.authorTokens) * AUTHOR_WEIGHT

    const score = Math.max(titleScore, authorScore)
    if (score >= SCORE_FLOOR) results.push({ listing: entry.listing, score })
  }

  results.sort((a, b) => b.score - a.score || a.listing.title.localeCompare(b.listing.title))
  return results.slice(0, limit)
}

/** Convenience one-shot search (builds an index each call) - prefer buildSearchIndex + searchIndex
 * in a UI that queries repeatedly. */
export function searchListings(
  query: string,
  listings: ISongListing[],
  limit = 50
): ISearchResult[] {
  return searchIndex(query, buildSearchIndex(listings), limit)
}

/**
 * Normalized edit-distance similarity in [0,1] between two labels — 1 = identical after
 * normalization. This is the "did they *mistype* it?" signal, which the tiered `scoreText` ranker
 * cannot express: its confident tiers (exact/prefix/substring) all require the query to be
 * literally *contained* in the target, and a typo never is. "setings" vs "Settings" scores only
 * 30.5 through `scoreText` but is 0.88 similar here.
 */
export function textCloseness(a: string, b: string): number {
  const na = normalizeSearchText(a)
  const nb = normalizeSearchText(b)
  if (!na || !nb) return 0
  return similarity(na, nb)
}

/**
 * Generic relevance score of a query against one or more label texts (best wins). Same
 * diacritic-insensitive, v/b-folding ranker used for song titles — used by the command palette to
 * rank arbitrary entities (pages, books, topics, authors, tags) alongside songs. 0 = no match.
 */
export function scoreText(query: string, ...texts: string[]): number {
  const queryNorm = normalizeSearchText(query)
  if (!queryNorm) return 0
  const queryTokens = tokenize(queryNorm)
  let best = 0
  for (const t of texts) {
    const tn = normalizeSearchText(t)
    if (!tn) continue
    best = Math.max(best, scoreTarget(queryNorm, queryTokens, tn, tokenize(tn)))
  }
  return best
}
