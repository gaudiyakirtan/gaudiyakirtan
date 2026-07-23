// The three document sets under test. All are keyed to a song uid, because that is what the
// recorded ground truth resolves to - so accuracy is always "did the right *song* come back",
// regardless of which field matched.
//
// The interesting comparison is not just algorithm-vs-algorithm but corpus-vs-corpus: adding the
// full verse text gives content search, but it also gives every song ~24 more lines of tokens to
// be a false positive with. Whether that helps or hurts title lookup is measurable, not obvious.
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const GEN = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '../data/gen')
const read = (f) => JSON.parse(fs.readFileSync(path.join(GEN, f), 'utf8'))

export function loadCorpora() {
  const titles = read('titles.json')
  const content = read('content.json')

  const byUid = new Map(titles.map((t) => [t.uid, t]))
  const lines = new Map()
  for (const c of content) {
    if (!lines.has(c.uid)) lines.set(c.uid, [])
    lines.get(c.uid).push(c.text)
  }

  const latn = (t) => t.scripts.filter((s) => s.script === 'Latn').map((s) => s.text)

  return {
    'titles-latn': {
      label: 'Titles (Latin only)',
      note: 'What the shipping index effectively holds today: one romanized title per song.',
      docs: titles.map((t) => ({ ref: t.uid, texts: latn(t) })),
    },
    'titles-all': {
      label: 'Titles (all 10 scripts + author)',
      note: 'Every script rendering indexed directly - the brute-force route to script-agnostic search.',
      docs: titles.map((t) => ({ ref: t.uid, texts: [...t.scripts.map((s) => s.text), t.author] })),
    },
    'titles+content': {
      label: 'Titles + full verse text + translations',
      note: 'Adds 16,620 verse lines. Enables content search; costs precision on title lookup.',
      docs: titles.map((t) => ({
        ref: t.uid,
        texts: [...t.scripts.map((s) => s.text), t.author, ...(lines.get(t.uid) ?? [])],
      })),
    },
  }
}

export function loadGroundTruth() { return read('groundtruth.json') }
export function loadEntities() { return read('entities.json') }
export { byUidTitle }

function byUidTitle() {
  const titles = read('titles.json')
  return new Map(titles.map((t) => [
    t.uid,
    t.scripts.find((s) => s.script === 'Latn')?.text ?? t.scripts[0]?.text ?? t.uid,
  ]))
}
