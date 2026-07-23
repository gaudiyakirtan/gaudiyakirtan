// Deterministic synthetic query generator, fitted to the 231 real attempts in search-database.csv.
//
// Run `node analyze-queries.mjs` to see the distribution this encodes. Every rate below is measured,
// not invented - that is the whole point. Guessing how people misspell Sanskrit would make the
// benchmark measure my guesses.
//
// Measured on the real title attempts:
//   45.2% of query tokens are already exact once diacritics are stripped
//   11.5% "unmatched" - overwhelmingly a compound that the user split into pieces
//    6.7% truncated tokens        6.7% two edits       5.7% three-or-more edits
//    5.3% one edit                5.1% v/b swap        4.5% vowel quality
//    2.7% aspiration added/lost   0.5% metathesis
//   58.9% of queries use capitals, only 9.1% keep any diacritic
//   40.3% type fewer tokens than the target has; 168 dropped tokens vs 36 added
//
// Seeded so a given (seed, line) always yields the same query: the corpus can be regenerated
// forever, and a regression is a real regression rather than a reroll.

/** mulberry32 - small, fast, and identical across runs and platforms. */
export function makeRng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)]
const chance = (rng, p) => rng() < p

/**
 * Romanization variants people actually type, lifted from the recorded attempts
 * (krishna ← śrīkṛṣṇera, goswami ← gosbāmi, govardhan ← gobardhana). This is lexical substitution,
 * not character noise - no amount of random editing produces "krishna" from "kṛṣṇa", because the
 * two spellings come from different transliteration traditions rather than from a slip.
 */
const LEXICAL = [
  [/\bkrsna\b/g, 'krishna'], [/krsna/g, 'krishna'],
  [/\bcaitanya\b/g, 'chaitanya'], [/\bgosbami\b/g, 'goswami'], [/\bgoswami\b/g, 'goswami'],
  [/\bbaisnaba\b/g, 'vaisnava'], [/\bbisnu\b/g, 'vishnu'], [/\bsib\b/g, 'shiv'],
  [/\bgobardhana\b/g, 'govardhan'], [/\bnabadbipa\b/g, 'navadipa'], [/\bbrndabana\b/g, 'vrindavan'],
  [/\bradhe\b/g, 'radha'], [/\bharinama\b/g, 'harinam'], [/\bkirtana\b/g, 'kirtan'],
  [/\bprabhu\b/g, 'prabhu'], [/\bthakura\b/g, 'thakur'], [/\bgaura\b/g, 'gour'],
  [/\bsri\b/g, 'shri'], [/\bs r i\b/g, 'sri'],
]

const VOWELS = 'aeiou'
const ASPIRATED = ['kh', 'gh', 'ch', 'jh', 'th', 'dh', 'ph', 'bh']

/** Strip combining marks. Only 9.1% of real attempts keep any, so this is the default. */
const strip = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')

function editOnce(rng, w) {
  if (w.length < 3) return w
  const i = 1 + Math.floor(rng() * (w.length - 2))
  const kind = rng()
  if (kind < 0.34) return w.slice(0, i) + w.slice(i + 1)                       // drop a letter
  if (kind < 0.67) return w.slice(0, i) + w[i] + w.slice(i)                    // double a letter
  return w.slice(0, i) + pick(rng, VOWELS.split('')) + w.slice(i + 1)          // substitute
}

function metathesize(rng, w) {
  if (w.length < 5) return w
  const i = 1 + Math.floor(rng() * (w.length - 3))
  return w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2)
}

function vowelShift(rng, w) {
  const idx = [...w].map((c, i) => (VOWELS.includes(c) ? i : -1)).filter((i) => i >= 0)
  if (!idx.length) return w
  const i = pick(rng, idx)
  return w.slice(0, i) + pick(rng, VOWELS.split('')) + w.slice(i + 1)
}

function aspirationShift(rng, w) {
  const found = ASPIRATED.filter((a) => w.includes(a))
  if (found.length && chance(rng, 0.6)) {
    const a = pick(rng, found)
    return w.replace(a, a[0])                                   // lose the aspiration
  }
  const i = [...w].findIndex((c, j) => j > 0 && 'kgcjtdpb'.includes(c))
  return i > 0 ? w.slice(0, i + 1) + 'h' + w.slice(i + 1) : w   // or add one that was not there
}

/** Split a long compound where a real reader would - at a vowel-consonant boundary mid-word. */
function splitCompound(rng, w) {
  if (w.length < 8) return [w]
  const lo = 3, hi = w.length - 3
  const at = lo + Math.floor(rng() * (hi - lo))
  return [w.slice(0, at), w.slice(at)]
}

/** Per-token noise, at the measured rates. Returns an array so a token can split into two. */
function noiseToken(rng, tok) {
  let w = tok
  const r = rng()
  if (r < 0.452) { /* exact - the single most common outcome */ }
  else if (r < 0.503) w = w.replace(/v/g, 'b')
  else if (r < 0.530) w = w.replace(/b/g, 'v')
  else if (r < 0.575) w = vowelShift(rng, w)
  else if (r < 0.602) w = aspirationShift(rng, w)
  else if (r < 0.669) w = w.slice(0, Math.max(3, w.length - 1 - Math.floor(rng() * 2)))  // truncate
  else if (r < 0.722) w = editOnce(rng, w)
  else if (r < 0.789) w = editOnce(rng, editOnce(rng, w))
  else if (r < 0.846) w = editOnce(rng, editOnce(rng, editOnce(rng, w)))
  else if (r < 0.851) w = metathesize(rng, w)
  else if (r < 0.966) { /* leave it - covers the long exact tail */ }
  else return splitCompound(rng, w)
  return [w]
}

/**
 * One synthetic query for a line of text, plus a note on what was done to it.
 * `line` should already be the Latin rendering; content lines can be long, so a window is taken
 * first - nobody types a whole verse, they type the phrase they remember.
 */
export function synthesizeQuery(line, rng) {
  const all = strip(String(line)).toLowerCase()
    .replace(/[^a-z0-9\s'’-]/g, ' ').replace(/\s+/g, ' ').trim().split(' ')
    // Corpus lines carry a trailing stanza number ("...bale haribola 6"). It is typography, not
    // something a reader would ever type, so it must not become a query token - and being a rare
    // literal it would otherwise be an unfairly strong match signal.
    .filter((t) => t && !/^\d+$/.test(t))
  if (!all.length) return null

  // Window: people type a fragment. 3-4 tokens is the measured centre (3.57 avg on titles).
  const size = Math.min(all.length, 1 + Math.floor(rng() * 5) + (chance(rng, 0.5) ? 1 : 0))
  const start = Math.floor(rng() * Math.max(1, all.length - size + 1))
  let toks = all.slice(start, start + size)

  // 40.3% of real attempts drop at least one token from what they were aiming at.
  if (toks.length > 2 && chance(rng, 0.403)) {
    toks.splice(Math.floor(rng() * toks.length), 1)
  }

  let out = toks.flatMap((t) => noiseToken(rng, t))

  let q = out.join(' ')
  // Lexical substitution runs on the assembled string so it can catch whole words.
  if (chance(rng, 0.35)) for (const [re, to] of LEXICAL) q = q.replace(re, to)
  // 58.9% use capitals; a minority Title-Case every word.
  if (chance(rng, 0.589)) {
    q = chance(rng, 0.5)
      ? q.replace(/\b\w/g, (c) => c.toUpperCase())
      : q.charAt(0).toUpperCase() + q.slice(1)
  }
  q = q.trim()
  return q.length >= 3 ? q : null
}
