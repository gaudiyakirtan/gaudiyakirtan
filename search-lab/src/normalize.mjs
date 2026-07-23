// Query/target normalizers, from the one that ships today to progressively more aggressive folds.
// Every engine declares which normalizer it uses, so the benchmark can attribute a win to the
// *matching algorithm* rather than to a lucky preprocessing step.

/**
 * Exactly what web/src/services/search.ts ships today: NFD-decompose, drop combining marks
 * (ā→a, ṁ→m, ś→s), lowercase, punctuation→space, fold v→b, collapse whitespace. Indic combining
 * signs survive because they sit outside the Latin U+0300-U+036F range.
 */
export function baseline(input) {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/v/g, 'b')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Phonetic key for Gauḍīya romanization. Readers type what they *hear*, and the recorded attempts
 * show exactly which distinctions they lose: aspiration (padha/pada), retroflex vs dental
 * (charna/caraṇa), the three sibilants (sri/śrī), and nasal quality (viṁ/vin/vim). Collapsing each
 * of those classes to one representative turns a dozen plausible spellings into one key.
 *
 * Applied AFTER baseline(), so diacritics are already gone and v is already b.
 */
export function phonetic(input) {
  let s = baseline(input)
  s = s.replace(/w/g, 'b')       // some readers type w for v/b
  s = s.replace(/y/g, 'j')       // j↔y are one sound here (jaya/yaya) - docs/screens/search.md
  s = s.replace(/kh|gh/g, 'k')   // aspirated velars
  s = s.replace(/ch|jh/g, 'c')   // aspirated palatals
  s = s.replace(/th|dh/g, 't')   // aspirated dentals/retroflex
  s = s.replace(/ph|bh/g, 'p')   // aspirated labials
  s = s.replace(/g/g, 'k')       // voicing is unreliable in transliteration
  s = s.replace(/j/g, 'c')
  s = s.replace(/d/g, 't')
  s = s.replace(/b/g, 'p')
  s = s.replace(/[sz]/g, 's')    // ś, ṣ, s all stripped to s already; catch z
  s = s.replace(/[nm]/g, 'n')    // anusvāra and homorganic nasals
  s = s.replace(/r/g, 'r')
  s = s.replace(/[aeiou]/g, 'a') // vowel quality is the least reliable signal of all
  s = s.replace(/(.)\1+/g, '$1') // geminates: sattva/satva
  return s.replace(/\s+/g, ' ').trim()
}

export function tokenize(normalized) {
  return normalized ? normalized.split(' ').filter(Boolean) : []
}

/** Levenshtein similarity in [0,1]. Early-outs on a length gap that can't clear any useful bar. */
export function similarity(a, b) {
  if (a === b) return 1
  const max = Math.max(a.length, b.length)
  if (max === 0) return 1
  if (Math.abs(a.length - b.length) / max > 0.5) return 0
  const prev = new Array(b.length + 1)
  const curr = new Array(b.length + 1)
  for (let j = 0; j <= b.length; j++) prev[j] = j
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j]
  }
  return 1 - prev[b.length] / max
}

/** Character n-grams of a string, space-padded so word boundaries participate. */
export function ngrams(s, n = 3) {
  const padded = ` ${s} `
  const out = []
  for (let i = 0; i + n <= padded.length; i++) out.push(padded.slice(i, i + n))
  return out
}

// ---------------------------------------------------------------- script detection
// Unicode ranges for the scripts the corpus renders into. Used to decide whether an incoming
// query needs transliterating before it can be matched against a Latin index.
const BLOCKS = [
  ['Deva', 0x0900, 0x097f], ['Beng', 0x0980, 0x09ff], ['Gujr', 0x0a80, 0x0aff],
  ['Orya', 0x0b00, 0x0b7f], ['Taml', 0x0b80, 0x0bff], ['Telu', 0x0c00, 0x0c7f],
  ['Knda', 0x0c80, 0x0cff], ['Mlym', 0x0d00, 0x0d7f], ['Cyrl', 0x0400, 0x04ff],
]

/** Script code of the first strong character, or 'Latn' if none matches. */
export function detectScript(s) {
  for (const ch of s) {
    const c = ch.codePointAt(0)
    for (const [code, lo, hi] of BLOCKS) if (c >= lo && c <= hi) return code
  }
  return 'Latn'
}
