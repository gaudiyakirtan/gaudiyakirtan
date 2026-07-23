// Unit tests for the 404 URL rescue (src/services/urlResolver.ts). The page that uses it can only
// be exercised in a browser, so the decision logic lives here where it can be pinned down: which
// paths are rewritten, and - more importantly - which are deliberately left to 404.
import { describe, expect, it } from 'vitest'
import { resolvePath, type ISearchEntry } from './urlResolver'

function song(code: string, label: string): ISearchEntry {
  return { type: 'song', label, subtitle: 'Some Author', href: `/songs/${code}`, code }
}

const entries: ISearchEntry[] = [
  song('N9', 'akrodha paramānanda'),
  song('A9', 'bhaja bhakata-batsala śrīgaurahari'),
  song('GP10', 'jayare jayare mora gaurāṅga rāya'),
  song('A10', 'śrīgaura-ārati'),
  song('A11', 'śrīyugala-ārati'),
  { type: 'book', label: 'Śrī Nāmāṣṭaka', href: '/books/book-srinamastaka' },
  { type: 'topic', label: 'Śrī Guru', href: '/topics/topic-sriguru' },
  { type: 'author', label: 'Manohara dāsa', href: '/songs?author=manohara' },
]

describe('resolvePath - case fixes', () => {
  it('rescues a lowercased song uid', () => {
    expect(resolvePath('/songs/n9', entries)).toEqual({ href: '/songs/N9', via: 'case' })
  })

  it('rescues any casing, not just all-lowercase', () => {
    for (const variant of ['gp10', 'Gp10', 'gP10', 'GP10'.toLowerCase(), 'gp10']) {
      expect(resolvePath(`/songs/${variant}`, entries)).toEqual({ href: '/songs/GP10', via: 'case' })
    }
    expect(resolvePath('/SONGS/n9', entries)).toEqual({ href: '/songs/N9', via: 'case' })
  })

  it('rescues a miscased top-level route', () => {
    expect(resolvePath('/Songs', entries)).toEqual({ href: '/songs', via: 'case' })
    expect(resolvePath('/ABOUT', entries)).toEqual({ href: '/about', via: 'case' })
  })

  it('rescues miscased book and topic slugs within their own collection', () => {
    expect(resolvePath('/books/BOOK-SriNamastaka', entries)).toEqual({
      href: '/books/book-srinamastaka',
      via: 'case',
    })
    expect(resolvePath('/topics/TOPIC-SRIGURU', entries)).toEqual({
      href: '/topics/topic-sriguru',
      via: 'case',
    })
  })
})

describe('resolvePath - loop safety', () => {
  it('never returns the path it was given', () => {
    // A path that is already the canonical spelling of a real page has nothing we can fix by
    // rewriting it; redirecting would either loop or silently land the reader somewhere else.
    expect(resolvePath('/songs/N9', entries)).toBeNull()
    expect(resolvePath('/songs', entries)).toBeNull()
    expect(resolvePath('/books/book-srinamastaka', entries)).toBeNull()
  })

  it('only ever returns an href that exists in the index or the route table', () => {
    const known = new Set([...entries.map((e) => e.href), '/songs', '/tracks', '/about'])
    for (const path of ['/songs/n9', '/akrodha', '/Songs', '/books/namastaka', '/ABOUT']) {
      const resolved = resolvePath(path, entries)
      expect(resolved && known.has(resolved.href)).toBe(true)
    }
  })
})

describe('resolvePath - scoping', () => {
  it('keeps a /songs/… path inside songs', () => {
    // "namastaka" is a book, and must stay unreachable from a song URL even though it is the
    // single best match in the whole index.
    expect(resolvePath('/songs/namastaka', entries)).toBeNull()
    expect(resolvePath('/books/namastaka', entries)).toEqual({
      href: '/books/book-srinamastaka',
      via: 'fuzzy',
    })
  })

  it('searches everything from a bare root path', () => {
    expect(resolvePath('/akrodha', entries)).toEqual({ href: '/songs/N9', via: 'fuzzy' })
    expect(resolvePath('/namastaka', entries)).toEqual({
      href: '/books/book-srinamastaka',
      via: 'fuzzy',
    })
  })

  it('gives up on paths it has no index for', () => {
    expect(resolvePath('/resources/pronounciation', entries)).toBeNull()
    expect(resolvePath('/songs/N9/verses', entries)).toBeNull()
    expect(resolvePath('/', entries)).toBeNull()
    expect(resolvePath('', entries)).toBeNull()
  })

  it('does not offer a top-level route from inside a collection', () => {
    expect(resolvePath('/songs/settings', entries)).toBeNull()
  })
})

describe('resolvePath - fuzzy confidence', () => {
  it('matches a hyphenated title slug', () => {
    expect(resolvePath('/songs/srigaura-arati', entries)).toEqual({
      href: '/songs/A10',
      via: 'fuzzy',
    })
  })

  it('refuses a near-miss uid with more than one plausible reading', () => {
    // "NA9" is one deletion away from both N9 and A9. Guessing here would be a coin flip made on
    // the reader's behalf, so it 404s instead.
    expect(resolvePath('/songs/NA9', entries)).toBeNull()
  })

  it('refuses an ambiguous term that several entries share', () => {
    // "arati" is in two titles at the same strength - the margin check rejects the tie.
    expect(resolvePath('/arati', entries)).toBeNull()
  })

  it('refuses a term with no real match', () => {
    expect(resolvePath('/definitely-not-a-real-page', entries)).toBeNull()
    expect(resolvePath('/songs/xyzzy', entries)).toBeNull()
    expect(resolvePath('/wp-admin', entries)).toBeNull()
  })

  it('refuses a single letter, which prefixes half the corpus', () => {
    expect(resolvePath('/songs/s', entries)).toBeNull()
  })

  it('tolerates a malformed percent escape instead of throwing', () => {
    expect(() => resolvePath('/songs/%E0%A4', entries)).not.toThrow()
    expect(resolvePath('/songs/%E0%A4', entries)).toBeNull()
  })

  it('does not resolve to a filter href by path segment', () => {
    // Author/tag/reciter rows are /songs?author=… - their path segment is "songs", which must not
    // be allowed to hijack the /songs library route.
    expect(resolvePath('/Songs', entries)).toEqual({ href: '/songs', via: 'case' })
  })
})

describe('resolvePath - app pages', () => {
  // Regression: pages lived only in the palette's own copy of the list, so they were never in this
  // resolver's fuzzy pool. ⌘K found "Settings" from a typo while /setings 404'd.
  it('rescues a misspelled page', () => {
    expect(resolvePath('/setings', entries)).toEqual({ href: '/settings', via: 'fuzzy' })
  })

  it('rescues a miscased page (unchanged behavior)', () => {
    expect(resolvePath('/Songs', entries)).toEqual({ href: '/songs', via: 'case' })
    expect(resolvePath('/ABOUT', entries)).toEqual({ href: '/about', via: 'case' })
  })

  it('rescues the nested resources pages, which the old static list omitted', () => {
    expect(resolvePath('/pronunciaton', entries)).toEqual({
      href: '/resources/pronunciation',
      via: 'fuzzy',
    })
  })

  it('never resolves a page from inside a collection scope', () => {
    // /songs/settings is not a page - the scope filter must drop nav entries entirely.
    expect(resolvePath('/songs/settings', entries)).toBeNull()
  })

  it('leaves a path that is already the canonical page alone (no redirect loop)', () => {
    expect(resolvePath('/settings', entries)).toBeNull()
    expect(resolvePath('/about', entries)).toBeNull()
  })
})

describe('resolvePath - typo tier', () => {
  it('rescues a one-character typo in a song title', () => {
    expect(resolvePath('/akrodha paramanand', entries)).toEqual({
      href: '/songs/N9',
      via: 'fuzzy',
    })
  })

  it('still refuses a typo that is too far off to be confident about', () => {
    expect(resolvePath('/xyzzy', entries)).toBeNull()
  })

  it('does not let a near-miss bypass the ambiguity margin', () => {
    // Two near-identical siblings: śrīgaura-ārati / śrīyugala-ārati. A query close to both must
    // still 404 rather than coin-flip.
    expect(resolvePath('/arati', entries)).toBeNull()
  })
})
