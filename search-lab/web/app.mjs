// Live bench UI. Imports the *same* engine modules the CLI benchmarks - no build step, no copy -
// so anything you see here is what bench.mjs measured. Indexes are built once per corpus on load
// and reused across keystrokes, which is how a real client would do it.
// Absolute paths, not relative: index.html is served at "/" but lives at /web/, so a relative
// specifier resolves against the document URL and misses by one directory.
// Absolute paths, not relative: index.html is served at "/" but lives at /web/, so a relative
// specifier resolves against the document URL and misses by one directory.
import { ENGINES } from '/src/engines.mjs'
import { buildCorpora, titleIndex } from '/src/corpus-defs.mjs'
import { inspectEngine, slices, verdict } from '/src/inspect.mjs'

const $ = (id) => document.getElementById(id)
const jf = (f) => fetch(`/data/gen/${f}`).then((r) => r.json())

const [titles, content, truth] = await Promise.all([
  jf('titles.json'), jf('content.json'), jf('groundtruth.json'),
])

const titleOf = titleIndex(titles)
const CORPORA = buildCorpora(titles, content)

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

let lastRows = []

async function runBench(corpusIds) {
  for (const b of ['run', 'runOne']) $(b).disabled = true
  const rows = []
  const jobs = corpusIds.flatMap((c) => ENGINES.map((e) => [c, e]))
  for (const [i, [corpusId, engine]] of jobs.entries()) {
    $('status').textContent = `${i + 1}/${jobs.length} — ${CORPORA[corpusId].label} · ${engine.name}`
    await new Promise((r) => setTimeout(r, 0))   // let the status paint before we block the thread
    rows.push({ corpusId, engine, ...evaluate(corpusId, engine) })
    render(rows)
  }
  lastRows = rows
  renderPareto(rows)
  $('status').textContent = `done — ${truth.length} attempts × ${jobs.length} configurations`
  for (const b of ['run', 'runOne']) $(b).disabled = false
}

// ---------------------------------------------------------------- pareto frontier
// One panel per corpus: accuracy against cost, with the non-dominated set called out. An engine is
// ON THE FRONTIER when nothing else in its corpus is both faster AND more accurate - so the
// frontier is the only set worth choosing from, and everything behind it is strictly a worse deal.
//
// Latency is log-scaled because it spans four orders of magnitude here (0.01 ms to 155 ms); on a
// linear axis every index engine would collapse onto the y-axis. All panels share one scale so
// they can be read against each other.
const X_MIN = 0.005, X_MAX = 300
const lx = (v) => Math.log10(Math.max(X_MIN, v))
const X_TICKS = [0.01, 0.1, 1, 10, 100]
const Y_TICKS = [0, 25, 50, 75, 100]

/** Non-dominated set: walk fastest-first and keep any point that beats every cheaper one. */
function frontierOf(points) {
  const byCost = [...points].sort((a, b) => a.p50 - b.p50 || b.r1 - a.r1)
  const keep = []
  let bestR1 = -Infinity
  for (const p of byCost) {
    if (p.r1 > bestR1) { keep.push(p); bestR1 = p.r1 }
  }
  return keep
}

function renderPareto(rows) {
  const byCorpus = new Map()
  for (const r of rows) {
    if (!byCorpus.has(r.corpusId)) byCorpus.set(r.corpusId, [])
    byCorpus.get(r.corpusId).push({ id: r.engine.id, name: r.engine.name, r1: r.r1 * 100, r5: r.r5 * 100, p50: r.p50 })
  }

  const W = 340, H = 232, M = { l: 40, r: 16, t: 8, b: 32 }
  const iw = W - M.l - M.r, ih = H - M.t - M.b
  const px = (v) => M.l + ((lx(v) - lx(X_MIN)) / (lx(X_MAX) - lx(X_MIN))) * iw
  const py = (v) => M.t + ih - (v / 100) * ih

  const panels = [...byCorpus.entries()].map(([corpusId, pts]) => {
    const front = frontierOf(pts)
    const frontIds = new Set(front.map((p) => p.id))
    // Stepped path: hold accuracy until the next frontier point earns an increase.
    let d = ''
    front.forEach((p, i) => {
      if (i === 0) d += `M${px(p.p50).toFixed(1)},${py(p.r1).toFixed(1)}`
      else d += ` H${px(p.p50).toFixed(1)} V${py(p.r1).toFixed(1)}`
    })

    const grid = [
      ...Y_TICKS.map((t) => `<line class="gridline" x1="${M.l}" y1="${py(t)}" x2="${M.l + iw}" y2="${py(t)}"/>`),
      ...X_TICKS.map((t) => `<line class="gridline" x1="${px(t)}" y1="${M.t}" x2="${px(t)}" y2="${M.t + ih}"/>`),
    ].join('')
    const axes = `<g class="axis">
      ${Y_TICKS.map((t) => `<text x="${M.l - 6}" y="${py(t) + 3}" text-anchor="end">${t}%</text>`).join('')}
      ${X_TICKS.map((t) => `<text x="${px(t)}" y="${M.t + ih + 13}" text-anchor="middle">${t < 1 ? t : t + ''}</text>`).join('')}
      <text class="axis-title" x="${M.l + iw / 2}" y="${M.t + ih + 27}" text-anchor="middle">p50 latency (ms, log)</text>
    </g>`

    // Frontier points are direct-labelled; dominated ones rely on hover, so the panel stays legible.
    // Engines can land on identical coordinates - trigram-fielded IS trigram when the content field
    // is empty - and an exactly-stacked dot is invisible and unhoverable. Nudge duplicates apart
    // rather than hide one: the coincidence is itself a finding worth being able to see.
    const seen = new Map()
    const dots = pts.map((p) => {
      const on = frontIds.has(p.id)
      const key = `${px(p.p50).toFixed(1)},${py(p.r1).toFixed(1)}`
      const dup = seen.get(key) ?? 0
      seen.set(key, dup + 1)
      const off = dup * 5.5
      return `<circle class="dot ${on ? 'f' : 'd'}" cx="${(px(p.p50) + off).toFixed(1)}" cy="${(py(p.r1) - off).toFixed(1)}"
        r="${on ? 6 : 4.5}" data-t="${esc(p.name)} — R@1 ${p.r1.toFixed(1)}% · R@5 ${p.r5.toFixed(1)}% · p50 ${p.p50.toFixed(2)} ms${on ? ' · on frontier' : dup ? ' · identical to the engine beneath it' : ''}"/>`
    }).join('')
    const labels = front.map((p) => {
      const x = px(p.p50), anchor = x > M.l + iw - 70 ? 'end' : 'start'
      return `<text class="dot-label" x="${(x + (anchor === 'end' ? -9 : 9)).toFixed(1)}" y="${(py(p.r1) - 8).toFixed(1)}" text-anchor="${anchor}">${esc(p.id)}</text>`
    }).join('')

    return `<div class="panel">
      <h4>${esc(CORPORA[corpusId].label)}</h4>
      <p class="cap">${front.length} of ${pts.length} on the frontier — ${esc(front.map((p) => p.id).join(', '))}</p>
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Accuracy versus latency for ${esc(CORPORA[corpusId].label)}">
        ${grid}${axes}<path class="front-line" d="${d}"/>${dots}${labels}
      </svg>
    </div>`
  }).join('')

  $('pareto').innerHTML = `
    <div class="panels">${panels}</div>
    <p class="legend">
      <span><i style="background:var(--front)"></i>On frontier — nothing is both faster and more accurate</span>
      <span><i style="background:var(--dom)"></i>Dominated — strictly beaten by another engine</span>
    </p>
    <p class="note">Accuracy is R@1; hover any point for R@5 and exact figures. All panels share one
      scale, so they read against each other. The dashed step is the frontier itself — the only set
      worth choosing from.</p>`

  for (const c of $('pareto').querySelectorAll('.dot')) {
    c.addEventListener('mouseenter', (ev) => {
      const t = $('tip')
      const [name, ...rest] = ev.target.dataset.t.split(' — ')
      t.innerHTML = `<b>${name}</b>${rest.join(' — ')}`
      t.style.opacity = '1'
    })
    c.addEventListener('mousemove', (ev) => {
      const t = $('tip')
      t.style.left = `${Math.min(ev.clientX + 14, innerWidth - 244)}px`
      t.style.top = `${ev.clientY + 14}px`
    })
    c.addEventListener('mouseleave', () => { $('tip').style.opacity = '0' })
  }
}

$('run').addEventListener('click', () => runBench(Object.keys(CORPORA)))
$('runOne').addEventListener('click', () => runBench([$('corpus').value]))

function render(rows) {
  const bestR1 = Math.max(...rows.map((r) => r.r1))
  const pct = (x) => `${(100 * x).toFixed(1)}%`
  $('table').innerHTML = `
    <thead><tr><th>Corpus</th><th>Engine</th><th>R@1</th><th>R@5</th><th>R@10</th>
    <th>MRR</th><th>p50</th><th>p95</th></tr></thead>
    <tbody>${rows.map((r, i) => `
      <tr data-idx="${i}" class="${r.r1 === bestR1 ? 'best' : ''}">
        <td>${CORPORA[r.corpusId].label}</td><td>${r.engine.name}</td>
        <td>${pct(r.r1)}</td><td>${pct(r.r5)}</td><td>${pct(r.r10)}</td><td>${pct(r.mrr)}</td>
        <td>${r.p50.toFixed(2)} ms</td><td>${r.p95.toFixed(2)} ms</td>
      </tr>`).join('')}</tbody>`
}

// ---------------------------------------------------------------- inspector
$('table').addEventListener('click', (ev) => {
  const tr = ev.target.closest('tr[data-idx]')
  if (!tr) return
  const row = lastRows[Number(tr.dataset.idx)]
  if (row) showInspector(row.corpusId, row.engine)
})

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))

function showInspector(corpusId, engine) {
  const rows = inspectEngine(engine, CORPORA[corpusId].docs, truth)
  const { best, median, worst } = slices(rows, 6)
  const first = rows.filter((r) => r.rank === 0).length
  const missed = rows.filter((r) => r.rank < 0).length
  const mid = Math.floor(rows.length / 2)

  const band = (cls, title, list) => `
    <div class="band ${cls}"><h4>${title}</h4>${list.map((r) => `
      <div class="row">
        <span class="v">${esc(verdict(r))}</span>
        <span class="q">“${esc(r.query)}”</span>
        <span class="want">want <code>${r.wantUid}</code> ${esc(titleOf.get(r.wantUid) ?? '')}</span>
        ${r.rank === 0 ? '' : `<span class="got">got ${r.got.map((u) => esc(titleOf.get(u) ?? u)).join(' · ')}</span>`}
      </div>`).join('')}</div>`

  $('inspector').innerHTML = `
    <h2>Inspecting — ${engine.name} on ${CORPORA[corpusId].label}</h2>
    <p class="note">${first} ranked first · ${rows.length - first - missed} found but lower ·
      ${missed} missed entirely. Ordered by reciprocal rank, then by how far the winner cleared
      the runner-up — so “best” means confidently right, not merely right.</p>
    <div class="bands">
      ${band('good', 'Best 6', best)}
      ${band('mid', `Median 6 (rows ${mid - 3}–${mid + 3})`, median)}
      ${band('bad', 'Worst 6', worst)}
    </div>`
  $('inspector').scrollIntoView({ behavior: 'smooth', block: 'start' })
}
