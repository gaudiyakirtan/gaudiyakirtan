// Live bench UI. Imports the *same* engine modules the CLI benchmarks - no build step, no copy -
// so anything you see here is what bench.mjs measured. Indexes are built once per corpus on load
// and reused across keystrokes, which is how a real client would do it.
// Absolute paths, not relative: index.html is served at "/" but lives at /web/, so a relative
// specifier resolves against the document URL and misses by one directory.
import { ENGINES } from '/src/engines.mjs'

const $ = (id) => document.getElementById(id)
const jf = (f) => fetch(`/data/gen/${f}`).then((r) => r.json())

const [titles, content, truth] = await Promise.all([
  jf('titles.json'), jf('content.json'), jf('groundtruth.json'),
])

const lines = new Map()
for (const c of content) {
  if (!lines.has(c.uid)) lines.set(c.uid, [])
  lines.get(c.uid).push(c.text)
}
const titleOf = new Map(titles.map((t) => [
  t.uid, t.scripts.find((s) => s.script === 'Latn')?.text ?? t.scripts[0]?.text ?? t.uid,
]))

const CORPORA = {
  'titles-latn': {
    label: 'Titles (Latin only)',
    docs: titles.map((t) => ({ ref: t.uid, texts: t.scripts.filter((s) => s.script === 'Latn').map((s) => s.text) })),
  },
  'titles-all': {
    label: 'Titles (all 10 scripts + author)',
    docs: titles.map((t) => ({ ref: t.uid, texts: [...t.scripts.map((s) => s.text), t.author] })),
  },
  'titles+content': {
    label: 'Titles + verse text + translations',
    docs: titles.map((t) => ({ ref: t.uid, texts: [...t.scripts.map((s) => s.text), t.author, ...(lines.get(t.uid) ?? [])] })),
  },
}

$('gtCount').textContent = truth.length
$('corpus').innerHTML = Object.entries(CORPORA)
  .map(([id, c]) => `<option value="${id}">${c.label}</option>`).join('')

// Indexes are expensive on the big corpus; build lazily and cache per (corpus, engine).
const cache = new Map()
function stateFor(corpusId, engine) {
  const key = `${corpusId}:${engine.id}`
  if (!cache.has(key)) cache.set(key, engine.build(CORPORA[corpusId].docs))
  return cache.get(key)
}

$('live').innerHTML = ENGINES.map((e) => `
  <div class="card">
    <h3><span>${e.name}</span><span class="ms" id="ms-${e.id}">—</span></h3>
    <p class="blurb">${e.blurb}</p>
    <ol id="res-${e.id}"></ol>
  </div>`).join('')

function runLive() {
  const q = $('q').value.trim()
  const corpusId = $('corpus').value
  for (const e of ENGINES) {
    const res$ = $(`res-${e.id}`), ms$ = $(`ms-${e.id}`)
    if (!q) { res$.innerHTML = ''; ms$.textContent = '—'; continue }
    const st = stateFor(corpusId, e)
    const t = performance.now()
    const res = e.search(st, q, 5)
    ms$.textContent = `${(performance.now() - t).toFixed(2)} ms`
    res$.innerHTML = res.length
      ? res.map((r) => `<li><b>${titleOf.get(r.ref) ?? r.ref}</b> <span class="uid">${r.ref}</span></li>`).join('')
      : '<li>no matches</li>'
  }
}

$('q').addEventListener('input', runLive)
$('corpus').addEventListener('change', runLive)

const SAMPLES = ['krishna vimostottra', 'radhika charna renu', 'srirupa manjari padha',
  'chatinya asktham', 'hamare bhraja ke rokowale', 'jaya jay sundara nanda kumra', 'sikshaasktam']
$('samples').innerHTML = SAMPLES.map((s) => `<span class="chip">${s}</span>`).join('')
$('samples').addEventListener('click', (ev) => {
  if (!ev.target.classList.contains('chip')) return
  $('q').value = ev.target.textContent
  runLive()
})

// ---------------------------------------------------------------- accuracy run
function evaluate(corpusId, engine) {
  const st = stateFor(corpusId, engine)
  let r1 = 0, r5 = 0, r10 = 0, mrr = 0
  const lat = []
  for (const g of truth) {
    const t = performance.now()
    const res = engine.search(st, g.query, 10)
    lat.push(performance.now() - t)
    const rank = res.findIndex((r) => r.ref === g.uid)
    if (rank === 0) r1++
    if (rank >= 0 && rank < 5) r5++
    if (rank >= 0 && rank < 10) r10++
    if (rank >= 0) mrr += 1 / (rank + 1)
  }
  lat.sort((a, b) => a - b)
  const n = truth.length
  return { r1: r1 / n, r5: r5 / n, r10: r10 / n, mrr: mrr / n,
    p50: lat[Math.floor(n * 0.5)], p95: lat[Math.floor(n * 0.95)] }
}

$('run').addEventListener('click', async () => {
  const btn = $('run')
  btn.disabled = true
  const rows = []
  const jobs = Object.keys(CORPORA).flatMap((c) => ENGINES.map((e) => [c, e]))
  for (const [i, [corpusId, engine]] of jobs.entries()) {
    $('status').textContent = `${i + 1}/${jobs.length} — ${CORPORA[corpusId].label} · ${engine.name}`
    await new Promise((r) => setTimeout(r, 0))   // let the status paint before we block the thread
    rows.push({ corpusId, engine, ...evaluate(corpusId, engine) })
    render(rows)
  }
  $('status').textContent = `done — ${truth.length} attempts × ${jobs.length} configurations`
  btn.disabled = false
})

function render(rows) {
  const bestR1 = Math.max(...rows.map((r) => r.r1))
  const pct = (x) => `${(100 * x).toFixed(1)}%`
  $('table').innerHTML = `
    <thead><tr><th>Corpus</th><th>Engine</th><th>R@1</th><th>R@5</th><th>R@10</th>
    <th>MRR</th><th>p50</th><th>p95</th></tr></thead>
    <tbody>${rows.map((r) => `
      <tr class="${r.r1 === bestR1 ? 'best' : ''}">
        <td>${CORPORA[r.corpusId].label}</td><td>${r.engine.name}</td>
        <td>${pct(r.r1)}</td><td>${pct(r.r5)}</td><td>${pct(r.r10)}</td><td>${pct(r.mrr)}</td>
        <td>${r.p50.toFixed(2)} ms</td><td>${r.p95.toFixed(2)} ms</td>
      </tr>`).join('')}</tbody>`
}
