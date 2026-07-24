// Query transliteration (native Brahmic script -> IAST), in two forms, so the benchmark can weigh
// them against each other:
//
//   romanizeQuery(s)         - the shipping approach. Romanizes the WHOLE string every call. On each
//                              keystroke the app re-romanizes the full query, so typing an N-char
//                              query costs O(1+2+...+N) = O(N^2) characters processed in total.
//
//   IncrementalRomanizer     - a stateful typer. Feed it one character at a time; it keeps the
//                              romanization of the resolved prefix and only touches the trailing
//                              unresolved consonant, so typing an N-char query is O(N) total.
//
// The maps + assembly rules are the same as web/src/services/translit.ts (vendored from
// data/translit-maps.json). The abugida rule the map omits: a consonant carries an inherent 'a'; a
// following matra replaces it; a following virama drops it (which is also how conjuncts fall out).
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const HERE = path.dirname(url.fileURLToPath(import.meta.url))
export const MAPS = JSON.parse(fs.readFileSync(path.join(HERE, '../data/translit-maps.json'), 'utf8'))

const BLOCKS = [
  [0x0900, 0x097f, 'Deva'], [0x0980, 0x09ff, 'Beng'], [0x0a80, 0x0aff, 'Gujr'],
  [0x0b00, 0x0b7f, 'Orya'], [0x0b80, 0x0bff, 'Taml'], [0x0c00, 0x0c7f, 'Telu'],
  [0x0c80, 0x0cff, 'Knda'], [0x0d00, 0x0d7f, 'Mlym'],
]

export function detectScript(s) {
  for (const ch of s) {
    const c = ch.codePointAt(0)
    for (const [lo, hi, code] of BLOCKS) if (c >= lo && c <= hi) return code
  }
  return 'Latn'
}

/** The shipping full-string romanizer (identical logic to web/src/services/translit.ts). */
export function romanizeQuery(query) {
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
      if (next !== undefined && m.matras[next] !== undefined) { out += m.matras[next]; i++ }
      else if (next === m.virama) { i++ }
      else out += 'a'
    } else if (m.vowels[ch] !== undefined) out += m.vowels[ch]
    else if (m.marks[ch] !== undefined) out += m.marks[ch]
    else if (m.digits[ch] !== undefined) out += m.digits[ch]
    else if (ch === m.virama) { /* stray virama */ }
    else out += ch
  }
  return out
}

/**
 * Incremental romanizer. Only the LAST character's romanization can change when the next character
 * arrives (a consonant's inherent 'a' is provisional until its lookahead is known), so we keep the
 * fully-resolved prefix in `stable` and carry the trailing bare consonant in `pend`. Each push() is
 * O(1); the current romanization is `stable` plus the pending consonant rendered with its inherent
 * 'a'. Only models append (the keystroke case); a mid-string edit resets via reset().
 */
export class IncrementalRomanizer {
  constructor(script) {
    this.m = MAPS[script] || null
    this.script = script
    this.stable = ''
    this.pend = null // trailing consonant char whose vowel is not yet decided
  }

  reset() { this.stable = ''; this.pend = null }

  /** Append one character; returns the full current romanization. */
  push(ch) {
    const m = this.m
    if (!m) { this.stable += ch; return this.stable }
    if (this.pend !== null) {
      const p = this.pend
      if (m.matras[ch] !== undefined) { this.stable += m.consonants[p] + m.matras[ch]; this.pend = null; return this.current() }
      if (ch === m.virama) { this.stable += m.consonants[p]; this.pend = null; return this.current() }
      // the pending consonant resolves with its inherent 'a', then this char is processed fresh
      this.stable += m.consonants[p] + 'a'
      this.pend = null
    }
    if (m.consonants[ch] !== undefined) this.pend = ch
    else if (m.vowels[ch] !== undefined) this.stable += m.vowels[ch]
    else if (m.marks[ch] !== undefined) this.stable += m.marks[ch]
    else if (m.digits[ch] !== undefined) this.stable += m.digits[ch]
    else if (ch === m.virama) { /* stray virama */ }
    else this.stable += ch
    return this.current()
  }

  current() {
    return this.pend !== null ? this.stable + this.m.consonants[this.pend] + 'a' : this.stable
  }
}

/** Type `s` one char at a time with a fresh incremental romanizer; returns the array of per-keystroke outputs. */
export function typeIncremental(s) {
  const r = new IncrementalRomanizer(detectScript(s))
  return [...s].map((ch) => r.push(ch))
}
