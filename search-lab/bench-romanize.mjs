// Is incremental romanization worth it, and from what query length?
//
//   node bench-romanize.mjs
//
// Two things a keystroke could do to romanize the query:
//   FULL  - re-romanize the whole prefix every keystroke (what ships). Typing N chars => O(N^2).
//   INCR  - keep the resolved prefix, touch only the trailing consonant. Typing N chars => O(N).
//
// The benchmark (1) proves INCR gives byte-identical output to FULL at EVERY prefix — otherwise the
// speed is meaningless — then (2) times "type the whole query" for each, across lengths, to find the
// crossover, and (3) puts both next to the Duet search that runs on the same keystroke, because that
// is what "worth it" has to be measured against.
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import { romanizeQuery, typeIncremental, IncrementalRomanizer, detectScript } from './src/romanize.mjs'

const HERE = path.dirname(url.fileURLToPath(import.meta.url))
const SONGS = path.join(HERE, '../web/src/data/songs')

// ---- real native-script strings, bucketed by length, for a realistic type-out --------------------
function bengLines() {
  const out = []
  for (const f of fs.readdirSync(SONGS)) {
    if (!f.endsWith('.json')) continue
    const d = JSON.parse(fs.readFileSync(path.join(SONGS, f), 'utf8'))
    for (const t of d.title_main || []) if (t.script_code === 'Beng') out.push(t.text)
    for (const v of d.verses || []) {
      const b = (v.display_scripts || []).find((x) => x.script_code === 'Beng')
      if (b) for (const l of b.text || []) if (l && l.trim()) out.push(l.trim())
    }
    if (out.length > 4000) break
  }
  return out
}

const lines = bengLines()

// ---- (1) correctness: INCR must equal FULL at every prefix ---------------------------------------
let checked = 0
let mismatches = 0
for (const s of lines.slice(0, 1500)) {
  const incr = typeIncremental(s)
  const chars = [...s]
  for (let i = 0; i < chars.length; i++) {
    const full = romanizeQuery(chars.slice(0, i + 1).join(''))
    checked++
    if (incr[i] !== full) {
      if (mismatches < 4) console.log(`  MISMATCH at "${chars.slice(0, i + 1).join('')}"\n    full: "${full}"\n    incr: "${incr[i]}"`)
      mismatches++
    }
  }
}
console.log(`correctness: ${checked.toLocaleString()} prefixes checked, ${mismatches} mismatch${mismatches === 1 ? '' : 'es'}`)
if (mismatches) { console.log('\n✗ incremental is not equivalent — timing below is moot until this is 0'); process.exit(1) }
console.log('✓ incremental output is byte-identical to full at every prefix\n')

// ---- (2) timing: cost to TYPE OUT a whole query, full vs incremental, across lengths -------------
// Pick one representative real string per target length (pad by repeating shorter lines if needed).
function stringOfLength(n) {
  const exact = lines.find((s) => [...s].length === n)
  if (exact) return exact
  let s = ''
  for (const l of lines) { s += (s ? ' ' : '') + l; if ([...s].length >= n) break }
  return [...s].slice(0, n).join('')
}

// Cost of typing `s` with FULL: sum over prefixes of romanizeQuery(prefix).
function typeFull(s) {
  const chars = [...s]
  for (let i = 0; i < chars.length; i++) romanizeQuery(chars.slice(0, i + 1).join(''))
}
// Cost of typing `s` with INCR: one push() per char on a single stateful romanizer.
function typeIncr(s) {
  const r = new IncrementalRomanizer(detectScript(s))
  for (const ch of s) r.push(ch)
}

const time = (f, reps) => { const t = performance.now(); for (let k = 0; k < reps; k++) f(); return (performance.now() - t) / reps }

// A single Duet search's cost is the yardstick — measured once here as a rough anchor (a real
// keystroke runs exactly one). ~950 µs on the full mono index (see the transliteration commit); the
// lab corpus is the same size, so we quote that rather than rebuild the index here.
const SEARCH_US = 950

const LENGTHS = [2, 4, 6, 8, 12, 16, 20, 24, 30, 40, 60, 80, 120]
console.log('type-out cost (romanize the query as it is typed, keystroke by keystroke):\n')
console.log('  len   FULL O(n²)   INCR O(n)   speedup   FULL vs 1 search   INCR vs 1 search')
console.log('  ' + '─'.repeat(78))
let crossover = null
for (const n of LENGTHS) {
  const s = stringOfLength(n)
  const reps = n > 60 ? 2000 : 8000
  const full = time(() => typeFull(s), reps) * 1000 // µs
  const incr = time(() => typeIncr(s), reps) * 1000 // µs
  if (crossover === null && incr < full) crossover = n
  console.log(
    `  ${String(n).padStart(3)}   ${(full.toFixed(2) + ' µs').padStart(10)}   ${(incr.toFixed(2) + ' µs').padStart(9)}   ` +
    `${((full / incr).toFixed(2) + '×').padStart(7)}   ${((100 * full / SEARCH_US).toFixed(2) + '%').padStart(15)}   ${((100 * incr / SEARCH_US).toFixed(2) + '%').padStart(15)}`
  )
}

console.log(`\ncrossover: incremental is faster from length ${crossover ?? '—'} onward (asymptotically it always wins — O(n) vs O(n²)).`)
console.log(`context : one Duet search on the same keystroke is ~${SEARCH_US} µs. The column "FULL vs 1 search" is`)
console.log(`          the entire type-out's romanize cost as a share of a SINGLE search — so per keystroke the`)
console.log(`          romanize share is far smaller still. Worth-it is decided by those last two columns.`)
