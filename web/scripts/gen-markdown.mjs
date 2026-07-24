#!/usr/bin/env node
// Generates a Markdown twin of every content page into `public/`, so appending `.md` to any
// route URL returns a clean Markdown rendering of that page (e.g. /songs/N9 -> /songs/N9.md).
// Runs at build time (package.json `prebuild`). Static files under public/ are served verbatim by
// both `next dev`/`next start` and Vercel, so this needs no server route.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const SONGS_DIR = path.join(ROOT, 'src/data/songs')
const GROUPS_FILE = path.join(ROOT, 'src/data/song_groups.json')
const OUT = path.join(ROOT, 'public')

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))
const write = (rel, body) => {
  const full = path.join(OUT, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, body)
}

const pick = (entries, prefs) => {
  if (!Array.isArray(entries) || !entries.length) return ''
  for (const sc of prefs) {
    const m = entries.find((e) => e.script_code === sc)
    if (m) return m.text
  }
  return entries[0].text
}

// The romanized reading lines (IAST) for a verse.
const romanLines = (verse) => {
  const latns = (verse.display_scripts || []).filter((d) => d.script_code === 'Latn')
  const m = latns.find((d) => d.standard === 'IAST') || latns[0]
  return (m && m.text) || []
}
const nativeLines = (verse) => {
  const d = (verse.display_scripts || []).find((x) => x.script_code === 'Beng')
  return (d && d.text) || []
}
const w2wEng = (verse) => (verse.word_to_words || []).find((w) => w.language_code === 'eng')
const trEng = (verse) => (verse.translations || []).find((t) => t.language_code === 'eng')

// ---- load corpus ----
const songFiles = fs
  .readdirSync(SONGS_DIR)
  .filter((f) => f.endsWith('.json') && !f.includes('_list'))
const songs = songFiles.map((f) => readJson(path.join(SONGS_DIR, f)))
const byUid = new Map(songs.map((s) => [s.uid, s]))
const groups = fs.existsSync(GROUPS_FILE) ? readJson(GROUPS_FILE) : []

const romanTitle = (s) => pick(s.title_main, ['Latn', 'Beng']) || s.uid
const romanAuthor = (s) => pick(s.author_display, ['Latn', 'Beng']) || s.author_uid || ''

// ---- per-song markdown ----
let songCount = 0
for (const s of songs) {
  const title = romanTitle(s)
  const nativeTitle = pick(s.title_main, ['Beng'])
  const author = romanAuthor(s)
  const lines = [`# ${title}`, '']
  if (nativeTitle && nativeTitle !== title) lines.push(`**${nativeTitle}**  `)
  lines.push(`*${author}* · \`${s.uid}\`${s.audio_available ? ' · 🎵 audio' : ''}`, '')

  const verses = s.verses || []
  verses.forEach((v, i) => {
    lines.push(`## Verse ${i + 1}`, '')
    for (const l of romanLines(v)) lines.push(`> ${l}  `)
    lines.push('')
    const nat = nativeLines(v)
    if (nat.length) {
      lines.push(nat.map((l) => `_${l}_`).join('  \n'), '')
    }
    const g = w2wEng(v)
    if (g && g.words && g.words.length) {
      lines.push('**Word-for-word:** ' + g.words.map(([h, m]) => `*${h}* — ${m}`).join('; '), '')
    }
    const t = trEng(v)
    if (t && t.text && t.text.length) {
      lines.push(t.text.join(' '), '')
    }
  })
  write(`songs/${s.uid}.md`, lines.join('\n') + '\n')
  songCount++
}

// ---- per-group (book/topic) markdown + list ----
const groupSongs = (g) => (g.song_uids || []).map((u) => byUid.get(u)).filter(Boolean)
const groupTitle = (g) => pick(g.titles, ['Latn', 'Beng']) || g.uid

for (const g of groups) {
  const kind = g.kind === 'book' ? 'books' : g.kind === 'topic' ? 'topics' : 'collections'
  const gs = groupSongs(g)
  const lines = [`# ${groupTitle(g)}`, '', `_${gs.length} songs_`, '']
  for (const s of gs) lines.push(`- [${romanTitle(s)}](/songs/${s.uid}.md) — ${romanAuthor(s)}`)
  write(`${kind}/${g.uid}.md`, lines.join('\n') + '\n')
}

const listSection = (heading, kind) => {
  const gs = groups.filter((g) => g.kind === kind)
  if (!gs.length) return ''
  const dir = kind === 'book' ? 'books' : kind === 'topic' ? 'topics' : 'collections'
  return (
    `# ${heading}\n\n` +
    gs
      .map((g) => `- [${groupTitle(g)}](/${dir}/${g.uid}.md) — ${(g.song_uids || []).length} songs`)
      .join('\n') +
    '\n'
  )
}
write('books.md', listSection('Books', 'book'))
write('topics.md', listSection('Topics', 'topic'))

// ---- all-songs index ----
const sortedSongs = [...songs].sort((a, b) => romanTitle(a).localeCompare(romanTitle(b)))
write(
  'songs.md',
  `# Songs (${songs.length})\n\n` +
    sortedSongs.map((s) => `- [${romanTitle(s)}](/songs/${s.uid}.md) — ${romanAuthor(s)}`).join('\n') +
    '\n'
)

// ---- authors index ----
const authorMap = new Map()
for (const s of songs) {
  const uid = s.author_uid || '?'
  const cur = authorMap.get(uid) || { name: romanAuthor(s), count: 0 }
  cur.count++
  authorMap.set(uid, cur)
}
const authors = [...authorMap.values()].sort((a, b) => b.count - a.count)
write(
  'authors.md',
  `# Authors (${authors.length})\n\n` +
    authors.map((a) => `- ${a.name} — ${a.count} songs`).join('\n') +
    '\n'
)

// ---- site index ----
write(
  'index.md',
  [
    '# Gaudiya Kirtan',
    '',
    'A static, offline-first repository of Gauḍīya Vaiṣṇava songs.',
    '',
    `- [Songs](/songs.md) (${songs.length})`,
    `- [Authors](/authors.md) (${authors.length})`,
    `- [Books](/books.md)`,
    `- [Topics](/topics.md)`,
    '',
    'Append `.md` to any song, book, or topic URL for its Markdown source.',
    '',
  ].join('\n')
)

// ---- client-side search index (for the command-palette modal) ----
// The runtime search service (services/search.ts) is fully client-safe but needs ISongListing[]
// with a romanized authorName, which is derived server-side. Emit a compact client-fetchable copy
// so the modal can search offline without pulling the fs-backed repositories into the bundle.
const searchListings = songs.map((s) => ({
  uid: s.uid,
  title: romanTitle(s),
  titles: (s.title_main || []).map((t) => ({ scriptCode: t.script_code, text: t.text })),
  authorUid: s.author_uid || '?',
  authorName: romanAuthor(s),
  languageOfOrigin: s.language_of_origin || '',
  audioAvailable: !!s.audio_available,
}))
fs.writeFileSync(path.join(OUT, 'search-listings.json'), JSON.stringify(searchListings))

// ---- unified command-palette index (songs + books + topics + authors + tags) ----
// Every entity the palette can find, in one flat {type,label,subtitle,href} list. Pages/nav are
// hardcoded in the modal (they carry icons); everything data-derived is emitted here.
const entries = []
for (const s of songs) {
  // `code` lets a user jump to a song by typing its uid (e.g. "A10").
  entries.push({ type: 'song', label: romanTitle(s), subtitle: romanAuthor(s), href: `/songs/${s.uid}`, code: s.uid })
}
for (const g of groups.filter((x) => x.kind === 'book')) {
  entries.push({ type: 'book', label: groupTitle(g), subtitle: `Book · ${(g.song_uids || []).length} songs`, href: `/books/${g.uid}` })
}
for (const g of groups.filter((x) => x.kind === 'topic')) {
  entries.push({ type: 'topic', label: groupTitle(g), subtitle: `Topic · ${(g.song_uids || []).length} songs`, href: `/topics/${g.uid}` })
}
// authors (with their uid, for the author-filtered list)
const authorByUid = new Map()
for (const s of songs) {
  const uid = s.author_uid || '?'
  const cur = authorByUid.get(uid) || { name: romanAuthor(s), count: 0 }
  cur.count++
  authorByUid.set(uid, cur)
}
for (const [uid, a] of authorByUid) {
  entries.push({ type: 'author', label: a.name, subtitle: `Author · ${a.count} songs`, href: `/songs?author=${encodeURIComponent(uid)}` })
}
// tags -> song uids (for the ?tag filter on the songs list)
const tagSongs = {}
for (const s of songs) for (const t of s.tags || []) (tagSongs[t] ||= []).push(s.uid)
for (const [tag, uids] of Object.entries(tagSongs)) {
  entries.push({ type: 'tag', label: tag, subtitle: `Tag · ${uids.length} songs`, href: `/songs?tag=${encodeURIComponent(tag)}` })
}
// reciters (track artists) -> song uids (for the ?artist filter). A reciter is who *recorded* a
// take, distinct from the song's composer/author.
const reciterSongs = {}
// ...and how many individual takes each has, which is what /tracks actually lists (one row per
// recording, so a reciter's take count is higher than their song count).
const reciterTakes = {}
for (const s of songs) {
  const takes = (s.audio_files || []).map((a) => a.artist).filter(Boolean)
  for (const a of takes) reciterTakes[a] = (reciterTakes[a] || 0) + 1
  for (const a of new Set(takes)) (reciterSongs[a] ||= []).push(s.uid)
}
for (const [artist, uids] of Object.entries(reciterSongs)) {
  // Points at /tracks, not /songs: a reciter is a performer, so the useful destination is their
  // recordings (docs/screens/tracks.md), not the songs those takes happen to belong to.
  entries.push({
    type: 'reciter',
    label: artist,
    subtitle: `Reciter · ${reciterTakes[artist]} recordings · ${uids.length} songs`,
    href: `/tracks?artist=${encodeURIComponent(artist)}`,
  })
}
fs.writeFileSync(path.join(OUT, 'search-index.json'), JSON.stringify(entries))
fs.writeFileSync(path.join(OUT, 'tag-index.json'), JSON.stringify(tagSongs))
fs.writeFileSync(path.join(OUT, 'artist-index.json'), JSON.stringify(reciterSongs))

// ---- content index (romanized verse lines, for Duet content search) -------------------------
// Every song's IAST reading lines, keyed by uid: { "N9": ["akrodha paramānanda…", …] }. The command
// palette and the 404 URL rescuer lazy-load this so a song can be found by a line of its text, not
// only its title (docs/screens/search.md v5). Latn `display_scripts` only — the same field the .md
// twins use, which is already free of the pipeline's [FLAG_HYPHEN_ALPHA] sentinel that
// `source_text_master` carries. ~350 KB gzipped, so it is a SEPARATE file, fetched on demand rather
// than folded into the 22 KB search-index everyone pays for on first ⌘K.
const contentIndex = {}
for (const s of songs) {
  const lines = (s.verses || [])
    .flatMap(romanLines)
    .map((l) => String(l).trim())
    .filter(Boolean)
  if (lines.length) contentIndex[s.uid] = lines
}
fs.writeFileSync(path.join(OUT, 'search-content.json'), JSON.stringify(contentIndex))

// ---- sitemap.xml ----------------------------------------------------------------------------
// Every indexable route, so search engines can discover all 700+ song pages (they are only
// reachable by crawling otherwise). Mirrors config.SITE_URL: canonical is the PRODUCTION apex, not
// wherever this build is deployed, so a dev/preview deploy's sitemap still points at production and
// does not seed a duplicate index. Kept in this build step (not a getServerSideProps route) because
// the app is a static export with no server. `?tag=` / `?artist=` / `?author=` filter URLs are
// intentionally omitted — they are the same content re-sliced, and canonicalize to their base page.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gaudiyakirtan.com').replace(/\/$/, '')
const STATIC_ROUTES = [
  '/', '/songs', '/tracks', '/authors', '/topics', '/books', '/about', '/contact',
  '/resources/pronunciation', '/resources/diacritics', '/resources/meters',
]
const xmlEscape = (s) => s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]))
const urlEntry = (loc, priority) =>
  `  <url><loc>${xmlEscape(SITE_URL + loc)}</loc><changefreq>monthly</changefreq><priority>${priority}</priority></url>`
const sitemapUrls = [
  ...STATIC_ROUTES.map((r) => urlEntry(r, r === '/' ? '1.0' : '0.7')),
  ...songs.map((s) => urlEntry(`/songs/${s.uid}`, '0.6')),
  ...groups.filter((g) => g.kind === 'book').map((g) => urlEntry(`/books/${g.uid}`, '0.5')),
  ...groups.filter((g) => g.kind === 'topic').map((g) => urlEntry(`/topics/${g.uid}`, '0.5')),
]
fs.writeFileSync(
  path.join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join('\n')}\n</urlset>\n`
)

console.log(
  `gen-markdown: ${songCount} songs + ${groups.length} groups + ${entries.length}-entry search-index + tag-index + ${sitemapUrls.length}-url sitemap → public/`
)
