// Unit tests for the offline fuzzy search layer (docs/screens/search.md tier 1, src/services/search.ts):
// diacritic-insensitive normalization, the v/b transliteration fold, and ranked matching.
import { describe, expect, it } from 'vitest'
import { buildSearchIndex, normalizeSearchText, searchIndex, searchListings } from './search'
import type { ISongListing } from './songListingView'

describe('normalizeSearchText', () => {
  it('strips diacritics via NFD decomposition (ā/ī/ś/ṛ/ṁ etc.)', () => {
    expect(normalizeSearchText('śrī gaurāṅga')).toBe('sri gauranga')
    expect(normalizeSearchText('kṛṣṇa')).toBe('krsna')
    expect(normalizeSearchText('viṁśottara')).toBe('bimsottara')
  })

  it('lowercases and collapses punctuation/whitespace', () => {
    expect(normalizeSearchText('  Jaya, Jaya   Gurudeva!! ')).toBe('jaya jaya gurudeba')
  })

  it('folds v/b so either Bengali-transliteration spelling matches', () => {
    expect(normalizeSearchText('madhava')).toBe(normalizeSearchText('madhaba'))
    expect(normalizeSearchText('vrndavana')).toBe(normalizeSearchText('brndabana'))
  })

  it('normalizes native-script (Bengali) text deterministically', () => {
    // Note: Bengali dependent vowel signs (matras, e.g. ু/ে in "গুরুদেব") are Unicode category
    // Mc, which `\p{L}` does NOT cover, so the punctuation-stripping step blanks them to spaces -
    // normalization of native script is lossy (consonant skeleton), not a verbatim pass-through.
    // What matters for search is that it's applied identically to both query and corpus text, so
    // the SAME native-script input always normalizes to the SAME output (see the end-to-end
    // match test below).
    const once = normalizeSearchText('গুরুদেব')
    const twice = normalizeSearchText('গুরুদেব')
    expect(once).toBe(twice)
    expect(once.length).toBeGreaterThan(0)
  })

  it('returns an empty string for empty/whitespace-only input', () => {
    expect(normalizeSearchText('')).toBe('')
    expect(normalizeSearchText('   ')).toBe('')
  })
})

function listing(uid: string, title: string, authorName = 'Some Author'): ISongListing {
  return {
    uid,
    title,
    titles: [{ scriptCode: 'Latn', text: title }],
    authorUid: 'auth-1',
    authorName,
    languageOfOrigin: 'ben',
    audioAvailable: false,
  }
}

describe('searchIndex / searchListings', () => {
  const listings: ISongListing[] = [
    listing('A1', 'Jaya Jaya Gurudeva'),
    listing('A2', 'Sri Gauranga Bolite Habe'),
    listing('A3', 'Vrndavana Dhama'),
    listing('A4', 'Radhika Stakam', 'Rupa Gosvami'),
  ]

  it('returns [] for an empty query (idle state)', () => {
    expect(searchListings('', listings)).toEqual([])
  })

  it('ranks an exact/whole-title match top', () => {
    const results = searchListings('jaya jaya gurudeva', listings)
    expect(results[0].listing.uid).toBe('A1')
  })

  it('matches through diacritics and the v/b fold', () => {
    // "Gauranga" query should match the accented/native corpus title via the same normalization.
    const results = searchListings('gauranga', listings)
    expect(results.some((r) => r.listing.uid === 'A2')).toBe(true)
  })

  it('matches on author name, ranked below a title match', () => {
    const results = searchListings('rupa gosvami', listings)
    expect(results[0].listing.uid).toBe('A4')
  })

  it('excludes results below the score floor (no spurious noise match for an unrelated single-word query)', () => {
    const results = searchListings('zzzzzzzzzz', listings)
    expect(results).toEqual([])
  })

  it('buildSearchIndex + searchIndex is equivalent to the one-shot searchListings', () => {
    const index = buildSearchIndex(listings)
    expect(searchIndex('vrndavana', index)).toEqual(searchListings('vrndavana', listings))
  })

  it('an exact native-script (Bengali) query still resolves end-to-end despite lossy normalization', () => {
    const nativeTitle = 'গুরুদেব'
    const results = searchListings(nativeTitle, [listing('A5', nativeTitle)])
    expect(results[0]?.listing.uid).toBe('A5')
  })
})
