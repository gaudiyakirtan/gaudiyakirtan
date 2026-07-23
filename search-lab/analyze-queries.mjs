// What do real users actually do to a title when they type it from memory?
//
// The 231 resolved attempts in search-database.csv are the only ground truth we have, and they are
// all *titles*. Before synthesizing content queries we have to know which transformations to
// synthesize and at what rate - otherwise the generator encodes my guesses about how people
// misspell Sanskrit, and the benchmark measures those guesses instead of reality.
//
//   node analyze-queries.mjs            distribution report
//   node analyze-queries.mjs --examples show what each class looks like
import { loadGroundTruth, byUidTitle } from './src/corpora.mjs'
import { baseline, tokenize } from './src/normalize.mjs'

const showExamples = process.argv.includes('--examples')
const truth = loadGroundTruth()
const titleOf = byUidTitle()

/** Strip diacritics and case, but keep v/b and letter identity - the raw comparison surface. */
const flat = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()

const sortChars = (s) => [...s].sort().join('')

function editOps(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  }
  return dp[m][n]
}

/** Classify how one query token differs from the title token it most likely came from. */
function classifyToken(q, t) {
  if (q === t) return 'exact'
  if (q.replace(/v/g, 'b') === t.replace(/v/g, 'b')) return 'v/b swap'
  if (q.replace(/[jy]/g, 'j') === t.replace(/[jy]/g, 'j')) return 'j/y swap'
  const deasp = (s) => s.replace(/kh|gh|ch|jh|th|dh|ph|bh/g, (m) => m[0])
  if (deasp(q) === deasp(t)) return 'aspiration'
  const devowel = (s) => s.replace(/[aeiou]+/g, 'a')
  if (devowel(q) === devowel(t)) return 'vowel quality'
  const desib = (s) => s.replace(/s+/g, 's').replace(/(.)\1+/g, '$1')
  if (desib(q) === desib(t)) return 'gemination/sibilant'
  if (q.length === t.length && sortChars(q) === sortChars(t)) return 'metathesis'
  if (t.startsWith(q) && q.length >= 3) return 'truncated'
  const d = editOps(q, t)
  if (d === 1) return '1 edit'
  if (d === 2) return '2 edits'
  return `${d}+ edits`
}

const classes = new Map()
const examples = new Map()
const bump = (k, ex) => {
  classes.set(k, (classes.get(k) ?? 0) + 1)
  if (!examples.has(k)) examples.set(k, [])
  if (examples.get(k).length < 5 && ex) examples.get(k).push(ex)
}

let tokenTotal = 0
const structural = { 'token dropped': 0, 'token added': 0, 'word split': 0, 'word merged': 0 }
const shapes = { 'has diacritics': 0, 'has capitals': 0, 'exact after flatten': 0 }
const lengths = []

for (const g of truth) {
  const title = titleOf.get(g.uid) ?? ''
  const q = flat(g.query), t = flat(title)
  if (!q || !t) continue
  if (/[^\x00-\x7f]/.test(g.query)) shapes['has diacritics']++
  if (/[A-Z]/.test(g.query)) shapes['has capitals']++
  if (q === t) shapes['exact after flatten']++

  const qs = tokenize(q), ts = tokenize(t)
  lengths.push({ q: qs.length, t: ts.length })

  if (qs.length < ts.length) structural['token dropped'] += ts.length - qs.length
  if (qs.length > ts.length) structural['token added'] += qs.length - ts.length
  // A merge shows up as one query token spanning two title tokens, and vice versa.
  if (qs.some((x) => ts.some((a, i) => i + 1 < ts.length && x === a + ts[i + 1]))) structural['word merged']++
  if (ts.some((x) => qs.some((a, i) => i + 1 < qs.length && x === a + qs[i + 1]))) structural['word split']++

  // Greedy align each query token to its closest surviving title token.
  const pool = [...ts]
  for (const qt of qs) {
    let best = null, bestD = Infinity
    for (const [i, tt] of pool.entries()) {
      const d = editOps(qt, tt) / Math.max(qt.length, tt.length)
      if (d < bestD) { bestD = d; best = i }
    }
    tokenTotal++
    if (best === null || bestD > 0.6) { bump('unmatched token', `"${qt}" (in "${g.query}")`); continue }
    const tt = pool.splice(best, 1)[0]
    bump(classifyToken(qt, tt), `${qt} ← ${tt}   "${g.query}"`)
  }
}

const pct = (n, d) => `${((100 * n) / d).toFixed(1)}%`.padStart(6)
console.log(`\n\x1b[1mQuery shape\x1b[0m  (${truth.length} attempts)`)
for (const [k, v] of Object.entries(shapes)) console.log(`  ${k.padEnd(22)} ${pct(v, truth.length)}  ${v}`)
const avgQ = lengths.reduce((a, b) => a + b.q, 0) / lengths.length
const avgT = lengths.reduce((a, b) => a + b.t, 0) / lengths.length
const shorter = lengths.filter((l) => l.q < l.t).length
console.log(`  ${'avg tokens typed'.padEnd(22)} ${avgQ.toFixed(2)}  (title has ${avgT.toFixed(2)})`)
console.log(`  ${'typed fewer tokens'.padEnd(22)} ${pct(shorter, lengths.length)}`)

console.log(`\n\x1b[1mPer-token transformation\x1b[0m  (${tokenTotal} query tokens)`)
for (const [k, v] of [...classes.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(22)} ${pct(v, tokenTotal)}  ${String(v).padStart(4)}`)
  if (showExamples) for (const e of examples.get(k) ?? []) console.log(`      \x1b[2m${e}\x1b[0m`)
}

console.log(`\n\x1b[1mStructural\x1b[0m`)
for (const [k, v] of Object.entries(structural)) console.log(`  ${k.padEnd(22)} ${String(v).padStart(4)}`)
console.log()
