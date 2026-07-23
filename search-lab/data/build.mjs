// Builds every artifact the lab needs, from the corpus in this worktree + the recorded user
// search attempts. Zero dependencies, zero network: `node data/build.mjs`.
//
// Outputs into data/gen/:
//   entities.json    - the 968-row index the shipping palette uses (copied from web/public)
//   titles.json      - one row per song, every script rendering (the script-agnostic target)
//   content.json     - one row per verse line: Latn rendering + English translations
//   groundtruth.json - {query, uid} pairs resolved from search-database.csv
//
// Why Latn display_scripts and NOT source_text_master: the master carries a pipeline sentinel
// ([FLAG_HYPHEN_ALPHA], 8751 occurrences across 647 songs) that marks a hyphen dropped when
// generating Indic scripts. Tokenized naively it makes "flag"/"hyphen"/"alpha" three of the most
// common words in the corpus. The Latn rendering is the same text, already clean.
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const HERE = path.dirname(url.fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../..')
const SONGS = path.join(ROOT, 'web/src/data/songs')
const PUBLIC = path.join(ROOT, 'web/public')
const OUT = path.join(HERE, 'gen')

// The recorded attempts stay OUTSIDE the repo on purpose: each row carries a real user_name
// alongside what they searched for and when. It is fine as a local fixture, not as something
// pushed to a public remote. Point GK_SEARCH_CSV at it, or keep it where it already lives.
const CSV_CANDIDATES = [
  process.env.GK_SEARCH_CSV,
  path.resolve(ROOT, '../search-benchmark/search-database.csv'),
  path.resolve(ROOT, 'search-benchmark/search-database.csv'),
].filter(Boolean)
const CSV = CSV_CANDIDATES.find((p) => fs.existsSync(p))
if (!CSV) {
  console.error('Could not find search-database.csv. Looked in:')
  for (const p of CSV_CANDIDATES) console.error('  ' + p)
  console.error('Set GK_SEARCH_CSV=/path/to/search-database.csv and re-run.')
  process.exit(1)
}

fs.mkdirSync(OUT, { recursive: true })

/** Minimal RFC-4180 parser - the CSV has quoted fields containing commas (song titles do). */
function parseCsv(text) {
  const rows = []
  let row = [], field = '', quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else quoted = false
      } else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (c !== '\r') field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  const header = rows.shift()
  return rows.filter((r) => r.length === header.length).map((r) =>
    Object.fromEntries(header.map((h, i) => [h, r[i]])))
}

/**
 * Loose key for matching a CSV title to a corpus title: letters+digits only, diacritics gone, and
 * v folded to b. That last fold is load-bearing, not cosmetic - the recorded titles use Sanskrit
 * spellings while the corpus is romanized from Bengali, which writes one letter for both
 * (Viṁśottara/biṁśottara, Varṇa/barṇa, virahe/birahe). Without it 43 of 295 attempts fail to
 * resolve against songs that are plainly present.
 */
function titleKey(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]/g, '').replace(/v/g, 'b')
}

// ---------------------------------------------------------------- corpus
const files = fs.readdirSync(SONGS).filter((f) => f.endsWith('.json')).sort()
const titles = []
const content = []
let flagged = 0

for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(SONGS, f), 'utf8'))
  const uid = d.uid ?? f.replace(/\.json$/, '')
  const scripts = (d.title_main ?? []).map((t) => ({
    script: t.script_code ?? '?',
    text: String(t.text ?? ''),
  })).filter((t) => t.text)
  const author = (d.author_display ?? []).find((a) => a.script_code === 'Latn')?.text
    ?? d.author_uid ?? ''
  titles.push({ uid, author, scripts })

  for (const [vi, v] of (d.verses ?? []).entries()) {
    const latn = (v.display_scripts ?? []).find((s) => s.script_code === 'Latn')
    for (const line of latn?.text ?? []) {
      const t = String(line).trim()
      if (!t) continue
      if (t.includes('FLAG_')) flagged++
      content.push({ uid, v: vi, kind: 'source', text: t })
    }
    for (const tr of v.translations ?? []) {
      for (const line of tr.text ?? []) {
        const t = String(line).trim()
        if (t) content.push({ uid, v: vi, kind: 'translation', text: t })
      }
    }
  }
}

// ---------------------------------------------------------------- ground truth
const byKey = new Map()
for (const t of titles) for (const s of t.scripts) {
  const k = titleKey(s.text)
  if (k && !byKey.has(k)) byKey.set(k, t.uid)
}

const rows = parseCsv(fs.readFileSync(CSV, 'utf8'))
const truth = []
const unresolved = []
for (const r of rows) {
  const attempt = (r.user_attempt ?? '').trim()
  const title = (r.original_title ?? '').trim()
  if (!attempt || !title) continue
  if (String(r.dont_know).toLowerCase() === 'true') continue
  const uid = byKey.get(titleKey(title))
  if (uid) truth.push({ query: attempt, uid, title, user: r.user_name ?? '' })
  else unresolved.push(title)
}

// ---------------------------------------------------------------- emit
const entitiesPath = path.join(PUBLIC, 'search-index.json')
const entities = JSON.parse(fs.readFileSync(entitiesPath, 'utf8'))
const w = (name, obj) => {
  const p = path.join(OUT, name)
  fs.writeFileSync(p, JSON.stringify(obj))
  return (fs.statSync(p).size / 1024).toFixed(0)
}

const sizes = {
  'entities.json': w('entities.json', entities),
  'titles.json': w('titles.json', titles),
  'content.json': w('content.json', content),
  'groundtruth.json': w('groundtruth.json', truth),
}

const uniqTitles = new Set(unresolved)
console.log(`songs            ${titles.length}`)
console.log(`title renderings ${titles.reduce((n, t) => n + t.scripts.length, 0)}`)
console.log(`content lines    ${content.length}  (FLAG sentinels leaked: ${flagged})`)
console.log(`entities         ${entities.length}`)
console.log(`\nground truth     ${truth.length}/${rows.length} attempts resolved to a uid`)
console.log(`unresolved       ${unresolved.length} rows across ${uniqTitles.size} distinct titles`)
if (uniqTitles.size) console.log('  e.g. ' + [...uniqTitles].slice(0, 6).join(' | '))
console.log('\nartifacts (KB):', sizes)
