// The joint objective: an engine has to be good at BOTH jobs at once, so its score is the WORSE of
// the two - min(R@1 on the recorded title attempts, R@1 on the 500 content queries). A title
// specialist that can't find a verse and a content engine that fumbles a misspelled title are both
// disqualified; only an engine that clears the bar on both survives.
//
//   node joint.mjs                 min over both, on titles-latn+content
//   node joint.mjs --corpus X      score on a different corpus
//
// Scored on titles-latn+content because it is the only corpus that can answer all three query
// datasets: titles for dataset 1, verse lines for the recall/synthetic content queries, and the
// English translations for the semantic/english ones.
import { ENGINES } from './src/engines.mjs'
import { loadCorpora, loadGroundTruth, loadContentTruth } from './src/corpora.mjs'

const argv = process.argv.slice(2)
const arg = (f, d) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : d }
const corpusId = arg('--corpus', 'titles-latn+content')

const corpus = loadCorpora()[corpusId]
if (!corpus) { console.error(`unknown corpus ${corpusId}`); process.exit(1) }
const titleTruth = loadGroundTruth()
const contentTruth = loadContentTruth()

/** R@1 of one engine-state over a query set, with an optional per-tag breakdown. */
function r1(state, engine, truth, tag) {
  let hit = 0
  const by = {}
  for (const g of truth) {
    const res = engine.search(state, g.query, 1)
    const ok = res[0]?.ref === g.uid
    if (ok) hit++
    if (tag) {
      const k = g[tag] ?? 'unknown'
      const b = (by[k] ??= { n: 0, hit: 0 })
      b.n++; if (ok) b.hit++
    }
  }
  return { r1: hit / truth.length, by }
}

const rows = ENGINES.map((engine) => {
  const state = engine.build(corpus.docs)
  const t = r1(state, engine, titleTruth)
  const c = r1(state, engine, contentTruth, 'origin')
  const authored = c.by.authored ? c.by.authored.hit / c.by.authored.n : 0
  const synthetic = c.by.synthetic ? c.by.synthetic.hit / c.by.synthetic.n : 0
  return { id: engine.id, name: engine.name, titles: t.r1, content: c.r1, authored, synthetic,
           joint: Math.min(t.r1, c.r1) }
}).sort((a, b) => b.joint - a.joint)

const pct = (x) => `${(100 * x).toFixed(1)}%`.padStart(7)
console.log(`\nJoint objective on ${corpus.label}`)
console.log(`min( R@1 titles [${titleTruth.length}] , R@1 content [${contentTruth.length}] )\n`)
console.log('  engine                              JOINT   titles  content  (authored/synthetic)')
console.log('  ' + '─'.repeat(80))
for (const r of rows) {
  const bound = r.titles <= r.content ? 'titles' : 'content'
  console.log(
    `  ${r.name.padEnd(35)} \x1b[1m${pct(r.joint)}\x1b[0m ${pct(r.titles)} ${pct(r.content)}   ` +
    `${pct(r.authored)}/${pct(r.synthetic).trim()}   \x1b[2m← ${bound}\x1b[0m`)
}
console.log(`\n\x1b[1mwinner: ${rows[0].name} — ${pct(rows[0].joint).trim()} joint\x1b[0m`)
console.log('\x1b[2mThe "← titles/content" column marks which dataset is the binding (worse) one.\x1b[0m')
