// Headless benchmark: every engine × every corpus, scored against the recorded user attempts.
//
//   node bench.mjs                     all engines, all corpora
//   node bench.mjs --corpus titles-all only that corpus
//   node bench.mjs --misses hybrid     show what that engine still gets wrong
//   node bench.mjs --json out.json     also write machine-readable results (the web UI reads this)
//
// Accuracy is measured on 231 real search attempts recorded from the older app - genuine
// misspellings typed by people looking for a song they had heard, not synthetic queries.
import fs from 'node:fs'
import { ENGINES } from './src/engines.mjs'
import { loadCorpora, loadGroundTruth, byUidTitle } from './src/corpora.mjs'

const argv = process.argv.slice(2)
const arg = (f, d = null) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : d }
const onlyCorpus = arg('--corpus')
const missesFor = arg('--misses')
const jsonOut = arg('--json')

const corpora = loadCorpora()
const truth = loadGroundTruth()
const titleOf = byUidTitle()

/** Wall-clock of `fn`, repeated for stability on sub-millisecond work. */
function timed(fn, reps = 1) {
  const t = performance.now()
  for (let i = 0; i < reps; i++) fn()
  return (performance.now() - t) / reps
}

function percentile(sorted, p) {
  if (!sorted.length) return 0
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))]
}

const results = []

for (const [corpusId, corpus] of Object.entries(corpora)) {
  if (onlyCorpus && corpusId !== onlyCorpus) continue
  console.log(`\n\x1b[1m━━ ${corpus.label}\x1b[0m  (${corpus.docs.length} docs)`)
  console.log(`   ${corpus.note}`)
  console.log()
  console.log('  engine                            R@1     R@5    R@10     MRR    build    p50      p95')
  console.log('  ' + '─'.repeat(88))

  for (const engine of ENGINES) {
    let state
    const buildMs = timed(() => { state = engine.build(corpus.docs) })

    let r1 = 0, r5 = 0, r10 = 0, mrr = 0
    const lat = []
    const misses = []
    for (const g of truth) {
      const t = performance.now()
      const res = engine.search(state, g.query, 10)
      lat.push(performance.now() - t)
      const rank = res.findIndex((r) => r.ref === g.uid)
      if (rank === 0) r1++
      if (rank >= 0 && rank < 5) r5++
      if (rank >= 0 && rank < 10) r10++
      if (rank >= 0) mrr += 1 / (rank + 1)
      if (rank !== 0) misses.push({ ...g, rank, got: res.slice(0, 3).map((r) => r.ref) })
    }
    const n = truth.length
    lat.sort((a, b) => a - b)
    const row = {
      corpus: corpusId, engine: engine.id, name: engine.name, blurb: engine.blurb,
      docs: corpus.docs.length,
      r1: r1 / n, r5: r5 / n, r10: r10 / n, mrr: mrr / n,
      buildMs, p50: percentile(lat, 0.5), p95: percentile(lat, 0.95),
      mean: lat.reduce((a, b) => a + b, 0) / lat.length,
    }
    results.push(row)

    const pct = (x) => (100 * x).toFixed(1).padStart(6)
    console.log(
      `  ${engine.name.padEnd(33)}` +
      `${pct(row.r1)} ${pct(row.r5)} ${pct(row.r10)} ${pct(row.mrr)}  ` +
      `${(buildMs.toFixed(0) + 'ms').padStart(7)} ${(row.p50.toFixed(2) + 'ms').padStart(8)} ${(row.p95.toFixed(2) + 'ms').padStart(8)}`
    )

    if (missesFor === engine.id && corpusId === (onlyCorpus ?? 'titles-all')) {
      console.log(`\n  \x1b[2mmisses for ${engine.id} (${misses.length}/${n}):\x1b[0m`)
      for (const m of misses.slice(0, 25)) {
        const mark = m.rank < 0 ? '\x1b[31mnot in top 10\x1b[0m' : `rank ${m.rank + 1}`
        console.log(`    "${m.query}"`)
        console.log(`      want ${m.uid} ${titleOf.get(m.uid) ?? ''}  [${mark}]`)
        console.log(`      got  ${m.got.map((u) => `${u} ${titleOf.get(u) ?? ''}`).join(' | ').slice(0, 110)}`)
      }
      console.log()
    }
  }
}

console.log(`\n\x1b[2m${truth.length} recorded attempts · R@k = share where the intended song ranked in the top k\x1b[0m`)

const best = [...results].sort((a, b) => b.r1 - a.r1)[0]
if (best) {
  console.log(`\x1b[1mbest R@1: ${best.name} on ${best.corpus} — ${(100 * best.r1).toFixed(1)}%\x1b[0m`)
}

if (jsonOut) {
  fs.writeFileSync(jsonOut, JSON.stringify({ generated: null, truth: truth.length, results }, null, 2))
  console.log(`\nwrote ${jsonOut}`)
}
