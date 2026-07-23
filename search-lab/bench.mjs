// Headless benchmark: every engine × every corpus, scored against the recorded user attempts.
//
//   node bench.mjs                       all engines, all corpora
//   node bench.mjs --corpus titles-all   only that corpus (repeatable: --corpus a --corpus b)
//   node bench.mjs --engine trigram      only that engine (repeatable)
//   node bench.mjs --list                show the available corpus / engine ids and exit
//   node bench.mjs --misses hybrid       every query that engine did not rank first
//   node bench.mjs --inspect trigram     best / median / worst queries, with what it returned
//   node bench.mjs --top 10              how many rows each inspect slice shows (default 6)
//   node bench.mjs --json out.json       also write machine-readable results
//
// Accuracy is measured on 231 real search attempts recorded from the older app - genuine
// misspellings typed by people looking for a song they had heard, not synthetic queries.
import fs from 'node:fs'
import { ENGINES } from './src/engines.mjs'
import { loadCorpora, loadGroundTruth, loadContentTruth, byUidTitle } from './src/corpora.mjs'
import { inspectEngine, slices, verdict } from './src/inspect.mjs'

const argv = process.argv.slice(2)
const arg = (f, d = null) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : d }
/** Collect every occurrence of a repeatable flag. */
const args = (f) => argv.reduce((a, v, i) => (v === f && argv[i + 1] ? [...a, argv[i + 1]] : a), [])
const onlyCorpora = args('--corpus')
const onlyEngines = args('--engine')
const missesFor = arg('--misses')
const inspectFor = arg('--inspect')
const topN = Number(arg('--top', 6))
const jsonOut = arg('--json')
/** 'titles' = the 231 recorded attempts; 'content' = the 500-query content set. */
const truthSet = arg('--truth', 'titles')

const corpora = loadCorpora()

if (argv.includes('--list')) {
  console.log('corpora:')
  for (const [id, c] of Object.entries(corpora)) console.log(`  ${id.padEnd(22)} ${c.label}`)
  console.log('\nengines:')
  for (const e of ENGINES) console.log(`  ${e.id.padEnd(22)} ${e.name}`)
  process.exit(0)
}

const unknownCorpus = onlyCorpora.find((c) => !corpora[c])
if (unknownCorpus) {
  console.error(`unknown corpus "${unknownCorpus}". Known: ${Object.keys(corpora).join(', ')}`)
  process.exit(1)
}
const unknownEngine = onlyEngines.find((e) => !ENGINES.some((x) => x.id === e))
if (unknownEngine) {
  console.error(`unknown engine "${unknownEngine}". Known: ${ENGINES.map((e) => e.id).join(', ')}`)
  process.exit(1)
}
/**
 * Optional style filter, e.g. --style recall,fragment,script,synthetic.
 *
 * This matters for more than convenience. The 85 English-language queries (styles `semantic` and
 * `english`) are answerable ONLY when the English translations are in the index - against a
 * Latin-only corpus they share no vocabulary at all with their target, and every engine scores 0%
 * on them by construction. Averaging those into a Latin-only run does not measure a weakness, it
 * measures a category error. Filter them out when the index has no English in it.
 */
const styleFilter = arg('--style')
const styles = styleFilter ? new Set(styleFilter.split(',').map((s) => s.trim())) : null

let truth = truthSet === 'content' ? loadContentTruth() : loadGroundTruth()
if (styles) truth = truth.filter((t) => styles.has(t.style ?? t.origin))
const titleOf = byUidTitle()
if (truthSet === 'content') {
  const a = truth.filter((t) => t.origin === 'authored').length
  const which = styles ? ` [styles: ${[...styles].join(', ')}]` : ''
  console.log(`\x1b[2mground truth: content — ${truth.length} queries (${a} authored, ${truth.length - a} synthetic)${which}\x1b[0m`)
  if (!truth.length) { console.error('no queries matched that --style filter'); process.exit(1) }
}

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
  if (onlyCorpora.length && !onlyCorpora.includes(corpusId)) continue
  console.log(`\n\x1b[1m━━ ${corpus.label}\x1b[0m  (${corpus.docs.length} docs)`)
  console.log(`   ${corpus.note}`)
  console.log()
  console.log('  engine                            R@1     R@5    R@10     MRR    build    p50      p95')
  console.log('  ' + '─'.repeat(88))

  for (const engine of ENGINES) {
    if (onlyEngines.length && !onlyEngines.includes(engine.id)) continue
    let state
    const buildMs = timed(() => { state = engine.build(corpus.docs) })

    let r1 = 0, r5 = 0, r10 = 0, mrr = 0
    const lat = []
    const misses = []
    // Tracked separately so a strong score on generated spelling-noise cannot mask a weak one on
    // the hand-written meaning/recall/script queries, or the reverse.
    const split = { authored: { n: 0, r1: 0, r5: 0 }, synthetic: { n: 0, r1: 0, r5: 0 }, styles: {} }
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
      const s = split[g.origin]
      if (s) { s.n++; if (rank === 0) s.r1++; if (rank >= 0 && rank < 5) s.r5++ }
      const styleKey = g.style ?? g.origin ?? 'unknown'
      const st = (split.styles[styleKey] ??= { n: 0, r1: 0, r5: 0 })
      st.n++
      if (rank === 0) st.r1++
      if (rank >= 0 && rank < 5) st.r5++
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
    if (truthSet === 'content' && split.authored.n && split.synthetic.n) {
      const half = (s) => `${(100 * s.r1 / s.n).toFixed(1)}/${(100 * s.r5 / s.n).toFixed(1)}`
      console.log(`  \x1b[2m${' '.repeat(33)}authored ${half(split.authored)}   synthetic ${half(split.synthetic)}   (R@1/R@5)\x1b[0m`)
      row.authored = { r1: split.authored.r1 / split.authored.n, r5: split.authored.r5 / split.authored.n }
      row.synthetic = { r1: split.synthetic.r1 / split.synthetic.n, r5: split.synthetic.r5 / split.synthetic.n }
      // Per style, because "text-matching" and "meaning-based" are different questions and only
      // the first one is answerable by a lexical matcher at all.
      const byStyle = {}
      for (const [style, s] of Object.entries(split.styles)) {
        byStyle[style] = { n: s.n, r1: s.r1 / s.n, r5: s.r5 / s.n }
      }
      row.styles = byStyle
      const order = ['recall', 'fragment', 'script', 'semantic', 'english', 'synthetic']
      const parts = order.filter((k) => byStyle[k]).map((k) =>
        `${k} ${(100 * byStyle[k].r1).toFixed(0)}%`)
      console.log(`  \x1b[2m${' '.repeat(33)}${parts.join('  ·  ')}   (R@1 by style)\x1b[0m`)
    }

    if (missesFor === engine.id) {
      console.log(`\n  \x1b[2mmisses for ${engine.id} on ${corpusId} (${misses.length}/${n}):\x1b[0m`)
      for (const m of misses.slice(0, 25)) {
        const mark = m.rank < 0 ? '\x1b[31mnot in top 10\x1b[0m' : `rank ${m.rank + 1}`
        console.log(`    "${m.query}"`)
        console.log(`      want ${m.uid} ${titleOf.get(m.uid) ?? ''}  [${mark}]`)
        console.log(`      got  ${m.got.map((u) => `${u} ${titleOf.get(u) ?? ''}`).join(' | ').slice(0, 110)}`)
      }
      console.log()
    }

    if (inspectFor === engine.id) showInspection(engine, corpus, corpusId)
  }
}

/**
 * Best / median / worst for one engine on one corpus. The median band is the most informative of
 * the three: it is what a typical query actually feels like, which neither the wins nor the
 * disasters tell you.
 */
function showInspection(engine, corpus, corpusId) {
  const rows = inspectEngine(engine, corpus.docs, truth)
  const { best, median, worst } = slices(rows, topN)
  const hits = rows.filter((r) => r.rank === 0).length
  const missing = rows.filter((r) => r.rank < 0).length

  console.log(`\n  \x1b[1minspect ${engine.id} on ${corpusId}\x1b[0m`)
  console.log(`  \x1b[2m${hits} ranked first · ${rows.length - hits - missing} found but lower · ${missing} missed entirely\x1b[0m`)

  const band = (label, list, color) => {
    console.log(`\n  \x1b[${color}m${label}\x1b[0m`)
    for (const r of list) {
      console.log(`    "${r.query}"  \x1b[2m→ ${verdict(r)}\x1b[0m`)
      console.log(`      want ${r.wantUid.padEnd(6)} ${(titleOf.get(r.wantUid) ?? r.wantTitle ?? '').slice(0, 62)}`)
      if (r.rank !== 0) {
        console.log(`      got  ${r.got.map((u) => `${u} ${titleOf.get(u) ?? ''}`).join(' | ').slice(0, 100)}`)
      }
    }
  }
  band(`BEST ${topN}`, best, '32')
  band(`MEDIAN ${topN} (rows ${Math.floor(rows.length / 2) - Math.floor(topN / 2)}–${Math.floor(rows.length / 2) - Math.floor(topN / 2) + topN} of ${rows.length})`, median, '33')
  band(`WORST ${topN}`, worst, '31')
  console.log()
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
