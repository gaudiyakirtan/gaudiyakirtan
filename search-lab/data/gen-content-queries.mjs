// Generate synthetic CONTENT queries - the half of the content ground truth that a machine can
// make, and therefore make endlessly.
//
//   node data/gen-content-queries.mjs                 250 queries, seed 42
//   node data/gen-content-queries.mjs --n 2000 --seed 7
//   node data/gen-content-queries.mjs --preview 20    print samples instead of writing
//
// Deterministic: the same (seed, n) always produces the same file, so a change in the benchmark is
// a change in the engine rather than a reroll of the dice. Bump the seed to get a fresh sample of
// the same distribution - that is the "run indefinitely" part.
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import { makeRng, synthesizeQuery } from '../src/synth.mjs'

const HERE = path.dirname(url.fileURLToPath(import.meta.url))
const GEN = path.join(HERE, 'gen')
const argv = process.argv.slice(2)
const arg = (f, d) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : d }
const N = Number(arg('--n', 250))
const SEED = Number(arg('--seed', 42))
const preview = argv.includes('--preview') ? Number(arg('--preview', 20)) : 0

const content = JSON.parse(fs.readFileSync(path.join(GEN, 'content.json'), 'utf8'))
// Only source lines: an English translation would exercise a different matcher entirely, and the
// hand-written half already covers meaning-based queries deliberately.
const pool = content.filter((c) => c.kind === 'source' && c.text.split(/\s+/).length >= 3)

const rng = makeRng(SEED)
const rows = []
const seen = new Set()
let attempts = 0
while (rows.length < N && attempts < N * 40) {
  attempts++
  const src = pool[Math.floor(rng() * pool.length)]
  const query = synthesizeQuery(src.text, rng)
  if (!query) continue
  const key = query.toLowerCase()
  if (seen.has(key)) continue          // duplicates would silently weight the metric
  seen.add(key)
  rows.push({ query, uid: src.uid, verse: src.v, source: src.text, origin: 'synthetic' })
}

if (preview) {
  console.log(`seed ${SEED} · ${rows.length} generated from ${pool.length} candidate lines\n`)
  for (const r of rows.slice(0, preview)) {
    console.log(`  "${r.query}"`)
    console.log(`    \x1b[2m${r.uid} v${r.verse} ← ${r.source.slice(0, 88)}\x1b[0m`)
  }
  process.exit(0)
}

const out = path.join(GEN, 'content-queries-synth.json')
fs.writeFileSync(out, JSON.stringify(rows))
console.log(`${rows.length} synthetic content queries (seed ${SEED}) → ${path.relative(HERE, out)}`)
console.log(`distinct songs targeted: ${new Set(rows.map((r) => r.uid)).size}`)
