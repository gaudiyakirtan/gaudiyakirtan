// The corpus definitions, pure and loader-agnostic. Node reads the artifacts off disk and the
// browser fetches them, but both call this - so the CLI and the live UI can never drift into
// benchmarking different document sets, which they briefly did.
//
// A doc is { ref, texts[] } plus optional { title[], content[] }. Every engine sees the same
// pooled `texts`; only a fielded engine looks at the split, so the comparison stays honest.

/** @param titles rows from titles.json  @param content rows from content.json */
export function buildCorpora(titles, content) {
  const lines = new Map()
  for (const c of content) {
    if (!lines.has(c.uid)) lines.set(c.uid, [])
    lines.get(c.uid).push(c.text)
  }
  const latn = (t) => t.scripts.filter((s) => s.script === 'Latn').map((s) => s.text)
  const body = (uid) => lines.get(uid) ?? []

  return {
    'titles-latn': {
      label: 'Titles (Latin only)',
      note: 'What the shipping index effectively holds today: one romanized title per song.',
      docs: titles.map((t) => ({ ref: t.uid, texts: latn(t), title: latn(t), content: [] })),
    },
    'titles-all': {
      label: 'Titles (all 10 scripts + author)',
      note: 'Every script rendering indexed directly - the brute-force route to script-agnostic search.',
      docs: titles.map((t) => {
        const all = [...t.scripts.map((s) => s.text), t.author]
        return { ref: t.uid, texts: all, title: all, content: [] }
      }),
    },
    'titles-latn+content': {
      label: 'Latin titles + verse text + translations',
      note: 'The clean test of what CONTENT costs: same Latin-only titles, plus 16,620 verse lines.',
      docs: titles.map((t) => ({
        ref: t.uid,
        texts: [...latn(t), ...body(t.uid)],
        title: latn(t),
        content: body(t.uid),
      })),
    },
    'titles+content': {
      label: 'All 10 scripts + author + verse text + translations',
      note: 'Everything at once. Isolates nothing - kept to show the compounded cost.',
      docs: titles.map((t) => {
        const all = [...t.scripts.map((s) => s.text), t.author]
        return { ref: t.uid, texts: [...all, ...body(t.uid)], title: all, content: body(t.uid) }
      }),
    },
  }
}

/** uid -> romanized title, for readable output. */
export function titleIndex(titles) {
  return new Map(titles.map((t) => [
    t.uid,
    t.scripts.find((s) => s.script === 'Latn')?.text ?? t.scripts[0]?.text ?? t.uid,
  ]))
}
