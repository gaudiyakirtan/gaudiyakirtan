// Unit tests for the Duet matcher (src/services/duet.ts) — the engine behind both the command
// palette and the 404 URL rescuer. Covers the two retrieval paths (title, per-line content), the
// content-match `line` metadata, and that a native-script query is romanized before matching.
import { describe, expect, it } from 'vitest'
import { buildDuet, searchDuet, type IDuetDoc } from './duet'

// A tiny fielded corpus: title texts + Latin verse lines, refs are indices.
const DOCS: IDuetDoc[] = [
  { ref: 0, title: ['akrodha paramānanda nityānanda rāya', 'N9'], content: ['akrodha paramānanda nityānanda-rāya', 'abhimāna-śūnya nitāi nagare beḓāya'] },
  { ref: 1, title: ['rādhikā-caraṇareṇu', 'R23'], content: ['rādhikā-caraṇareṇu, bhūṣaṇa kariyā tanu', 'anāyāse pābe giridhārī'] },
  { ref: 2, title: ['nitāi-pada-kamala', 'N7'], content: ['nitāi-pada-kamala, koṭīcandra-suśītala', 'ye chāyāya jagat juḓāya'] },
  { ref: 3, title: ['jaya jaya gurudeba śrībhaktiprajñāna', 'A1'], content: [] },
]

const index = buildDuet(DOCS)
const topRef = (q: string) => searchDuet(index, q, 5)[0]?.ref
const top = (q: string) => searchDuet(index, q, 5)[0]

describe('searchDuet — title path', () => {
  it('finds a song by its (romanized) title', () => {
    expect(topRef('akrodha')).toBe(0)
    expect(topRef('nitai pada kamala')).toBe(2)
  })

  it('tolerates the misspellings the tiered ranker could not', () => {
    // Diacritics dropped, one-off spelling — the trigram + rerank path still lands it.
    expect(topRef('radhika charana renu')).toBe(1)
    expect(topRef('gurudeva sribhaktiprajnana')).toBe(3)
  })

  it('matches a song by its code', () => {
    expect(topRef('N7')).toBe(2)
  })

  it('returns nothing for an empty query', () => {
    expect(searchDuet(index, '', 5)).toEqual([])
    expect(searchDuet(index, '   ', 5)).toEqual([])
  })
})

describe('searchDuet — content path', () => {
  it('finds a song by a line of its verse text, not its title', () => {
    const r = top('koticandra susitala') // a phrase from N7's second field, not its title
    expect(r?.ref).toBe(2)
  })

  it('reports the matched line when the content path wins', () => {
    const r = top('abhimana sunya nitai nagare')
    expect(r?.ref).toBe(0)
    // The win came from the verse line, so `line` is the original text of that line.
    expect(r?.line).toContain('abhimāna')
  })

  it('leaves `line` undefined when the title path wins', () => {
    expect(top('akrodha')?.line).toBeUndefined()
  })
})

describe('searchDuet — native-script query', () => {
  it('romanizes a Bengali query before matching, so it finds the same song as its Latin spelling', () => {
    // জয় জয় গুরুদেব → "jaya jaya gurudeba…"
    expect(topRef('জয় জয় গুরুদেব')).toBe(3)
  })

  it('romanizes a Devanagari query', () => {
    // राधिका → "rādhikā"
    expect(topRef('राधिका')).toBe(1)
  })

  it('gives a native-script query the same top hit as its Latin transliteration', () => {
    expect(topRef('রাধিকা')).toBe(topRef('radhika'))
  })
})
