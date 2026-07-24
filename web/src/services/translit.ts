// Query transliteration: romanize a native-Brahmic-script query to IAST so it can match the
// romanized search index (docs/screens/search.md v6). The corpus ships Latin (IAST) text only, so a
// query typed in Bengali or Devanagari would otherwise match nothing. Rather than ship a second
// index per script, we romanize the *query* and search the one Latin index Duet already uses —
// retrieval is ~100% because Duet is fuzzy and its normalizer strips diacritics (search-lab PoC).
//
// The per-script maps (vowels, bare consonants, matra vowels, virama, marks) are generated at build
// time from aksharamukha by pipeline/build_translit_maps.py — the same engine that romanized the
// corpus, so a runtime romanization lines up with the indexed text by construction. This file holds
// only the abugida assembly rules; the maps carry the alphabet.
import RAW from '../data/translit-maps.json'

interface IScriptMap {
  vowels: Record<string, string>
  consonants: Record<string, string>
  matras: Record<string, string>
  virama: string
  marks: Record<string, string>
  digits: Record<string, string>
}

const MAPS = RAW as Record<string, IScriptMap>

// Unicode block ranges for the scripts the corpus renders into. First strong character decides.
const BLOCKS: Array<[number, number, string]> = [
  [0x0900, 0x097f, 'Deva'],
  [0x0980, 0x09ff, 'Beng'],
  [0x0a80, 0x0aff, 'Gujr'],
  [0x0b00, 0x0b7f, 'Orya'],
  [0x0b80, 0x0bff, 'Taml'],
  [0x0c00, 0x0c7f, 'Telu'],
  [0x0c80, 0x0cff, 'Knda'],
  [0x0d00, 0x0d7f, 'Mlym'],
]

/** Script code of the first character that sits in a known block, or 'Latn' if none does. */
export function detectScript(s: string): string {
  for (const ch of s) {
    const c = ch.codePointAt(0)
    if (c === undefined) continue
    for (const [lo, hi, code] of BLOCKS) if (c >= lo && c <= hi) return code
  }
  return 'Latn'
}

/**
 * Romanize a native-Brahmic query to IAST. A no-op (returns the input unchanged) for Latin or
 * unrecognized scripts, so it is safe and cheap to call on every query.
 *
 * The abugida rules the maps do not encode: a consonant carries an inherent 'a'; a following matra
 * replaces that 'a' with its own vowel; a following virama drops it (which is also how conjuncts
 * fall out — क्ष walks to k + (virama: no vowel) + ṣ + a = "kṣa").
 */
export function romanizeQuery(query: string): string {
  const code = detectScript(query)
  if (code === 'Latn') return query
  const m = MAPS[code]
  if (!m) return query

  const chars = [...query]
  let out = ''
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]
    const cons = m.consonants[ch]
    if (cons !== undefined) {
      out += cons
      const next = chars[i + 1]
      if (next !== undefined && m.matras[next] !== undefined) {
        out += m.matras[next]
        i++
      } else if (next === m.virama) {
        i++ // half consonant / conjunct: no vowel
      } else {
        out += 'a' // inherent vowel
      }
    } else if (m.vowels[ch] !== undefined) {
      out += m.vowels[ch]
    } else if (m.marks[ch] !== undefined) {
      out += m.marks[ch]
    } else if (m.digits[ch] !== undefined) {
      out += m.digits[ch]
    } else if (ch === m.virama) {
      // stray virama with no consonant to attach to: drop it
    } else {
      out += ch // whitespace, punctuation, or anything unmapped passes through
    }
  }
  return out
}
