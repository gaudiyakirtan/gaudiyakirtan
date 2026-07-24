// Duet — the offline matcher chosen by the search-lab benchmark (search-lab/README.md). One engine
// for BOTH jobs a search box does: fuzzy title lookup and verse-content search, fused so a song
// wins by whichever field actually matched. It is the joint-objective winner —
// min(R@1 titles, R@1 content) = 86.6% — where the shipping tiered ranker was 65.8%, held back by
// title recall on misspellings it structurally cannot reach ("krishna vimostottra" for
// "śrīkṛṣṇera biṁśottara-śatanāma").
//
// Two retrieval paths, each with the matcher its field needs, fused by max:
//   title path    fielded character-trigram index + a phonetic trigram index + a Levenshtein
//                 rerank of the leaders (misspelled queries: grams + edit distance win)
//   content path  every verse LINE is its own document; trigram retrieval over lines, a Levenshtein
//                 rerank of the leading lines, aggregated line -> song by MAX (never pooled —
//                 pooling a song's lines into one bag is the documented 79.7% -> 23.4% collapse)
//
// Ported verbatim from search-lab/src/engines.mjs `duet` (validated top-5-identical to the lab on
// 20 queries spanning titles, content, and semantic phrases). The constants in DUET_PARAMS were
// tuned against 731 real+synthetic queries; treat them as a unit, not as knobs to nudge.
import { normalizeSearchText } from './search'
import { romanizeQuery } from './translit'

/** A searchable entity. `title` holds its label texts; `content` holds Latin verse lines (songs only). */
export interface IDuetDoc {
  ref: number
  title: string[]
  content: string[]
}

export interface IDuetResult {
  ref: number
  score: number
  /** The verse line that won this result, present only when the CONTENT path beat the title path —
   *  i.e. the doc matched on its text, not its title. Lets a caller show why it surfaced. */
  line?: string
}

// ----------------------------------------------------------------------------- normalizers
/** Same fold the tiered ranker uses (NFD, strip diacritics, v->b). Shared so both agree. */
const baseline = normalizeSearchText

/**
 * Phonetic key for Gauḍīya romanization: collapse aspiration, voicing, sibilants, nasals and vowel
 * quality, so "chatinya" and "caitanya" land on the same key. The sound-alike safety net behind the
 * literal trigrams.
 */
function phonetic(input: string): string {
  let s = baseline(input)
  s = s.replace(/w/g, 'b')
  s = s.replace(/y/g, 'j')
  s = s.replace(/kh|gh/g, 'k')
  s = s.replace(/ch|jh/g, 'c')
  s = s.replace(/th|dh/g, 't')
  s = s.replace(/ph|bh/g, 'p')
  s = s.replace(/g/g, 'k')
  s = s.replace(/j/g, 'c')
  s = s.replace(/d/g, 't')
  s = s.replace(/b/g, 'p')
  s = s.replace(/[sz]/g, 's')
  s = s.replace(/[nm]/g, 'n')
  s = s.replace(/[aeiou]/g, 'a')
  s = s.replace(/(.)\1+/g, '$1')
  return s.replace(/\s+/g, ' ').trim()
}

const tokenize = (n: string): string[] => (n ? n.split(' ').filter(Boolean) : [])
const sortChars = (s: string): string => [...s].sort().join('')

/** Character n-grams, space-padded so word boundaries participate. */
function ngrams(s: string, n = 3): string[] {
  const padded = ` ${s} `
  const out: string[] = []
  for (let i = 0; i + n <= padded.length; i++) out.push(padded.slice(i, i + n))
  return out
}

// ----------------------------------------------------------------------------- string similarity
let SIM_PREV = new Float64Array(64)
let SIM_CURR = new Float64Array(64)
/** Levenshtein similarity in [0,1]. `minSim` bands the DP so a hopeless pair pays O(band) not O(nm). */
function similarity(a: string, b: string, minSim = 0): number {
  if (a === b) return 1
  const max = Math.max(a.length, b.length)
  if (max === 0) return 1
  if (Math.abs(a.length - b.length) / max > 0.5) return 0
  const band = minSim > 0 ? Math.floor((1 - minSim) * max) : max
  if (Math.abs(a.length - b.length) > band) return 0
  if (b.length + 1 > SIM_PREV.length) {
    SIM_PREV = new Float64Array(b.length + 1)
    SIM_CURR = new Float64Array(b.length + 1)
  }
  let prev = SIM_PREV
  let curr = SIM_CURR
  for (let j = 0; j <= b.length; j++) prev[j] = j
  for (let i = 1; i <= a.length; i++) {
    const lo = Math.max(1, i - band)
    const hi = Math.min(b.length, i + band)
    curr[0] = i
    if (lo > 1) curr[lo - 1] = i + band
    for (let j = lo; j <= hi; j++) {
      const up = j > i + band - 1 ? prev[j] + 999 : prev[j]
      curr[j] = Math.min(up + 1, curr[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    if (hi < b.length) curr[hi + 1] = i + band
    const tmp = prev
    prev = curr
    curr = tmp
  }
  return 1 - prev[b.length] / max
}

const DP_A = new Float64Array(640)
const DP_B = new Float64Array(640)
/** Edit distance of `needle` against its best-matching SUBSTRING of `hay` (free deletions at hay's ends). */
function infixSimilarity(needle: string, hay: string): number {
  const n = needle.length
  const m = hay.length
  if (!n || !m || m >= DP_A.length) return 0
  let prev = DP_A
  let curr = DP_B
  for (let j = 0; j <= m; j++) prev[j] = 0
  for (let i = 1; i <= n; i++) {
    curr[0] = i
    for (let j = 1; j <= m; j++) {
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + (needle[i - 1] === hay[j - 1] ? 0 : 1))
    }
    const tmp = prev
    prev = curr
    curr = tmp
  }
  let best = prev[0]
  for (let j = 1; j <= m; j++) if (prev[j] < best) best = prev[j]
  return 1 - best / n
}

/** Multiset character overlap of two sorted strings — an upper bound on any edit similarity. */
function commonChars(a: string, b: string): number {
  let i = 0
  let j = 0
  let c = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { c++; i++; j++ }
    else if (a[i] < b[j]) i++
    else j++
  }
  return c
}

/** One query-token vs one target-token, all signals fused; `cheap` skips the DP for stop-words. */
function pairScore(qt: string, qtSorted: string, tt: string, ttSorted: string, cheap = false): number {
  if (tt === qt) return 1
  const shorter = qt.length <= tt.length ? qt : tt
  const longer = shorter === qt ? tt : qt
  const lenScore = Math.min(0.92, 0.45 + 0.07 * shorter.length)
  let m = 0
  if (longer.startsWith(shorter)) m = lenScore
  else if (shorter.length >= 3 && longer.includes(shorter)) m = lenScore - 0.05
  if (cheap) return m
  const bound = commonChars(qtSorted, ttSorted) / longer.length
  if (bound > m) m = Math.max(m, similarity(qt, tt, m))
  if (m >= 0.9) return m
  if (Math.abs(tt.length - qt.length) <= 2) {
    if (0.85 * bound > m) m = Math.max(m, 0.85 * similarity(qtSorted, ttSorted, m / 0.85))
  } else if (qt.length >= 4 && tt.length > qt.length + 2) {
    const infixBound = commonChars(qtSorted, ttSorted) / qt.length
    if (0.9 * infixBound > m) m = Math.max(m, 0.9 * infixSimilarity(qt, tt))
  }
  return m
}

interface ITextEntry {
  n: string
  tk: string[]
  tkSorted: string[]
  tkSet: Set<string>
}
type Memo = Map<string, number>

/** Best score of one query token over a target's tokens, memoized per query token across candidates. */
function memoTokenScore(
  qt: string, qtSorted: string, tk: string[], tkSorted: string[], memo: Memo, cheap = false, tkSet: Set<string> | null = null,
): number {
  if (tkSet && tkSet.has(qt)) return 1
  let best = 0
  for (let i = 0; i < tk.length; i++) {
    const tt = tk[i]
    let s = memo.get(tt)
    if (s === undefined) { s = pairScore(qt, qtSorted, tt, tkSorted[i], cheap); memo.set(tt, s) }
    if (s > best) { best = s; if (best === 1) break }
  }
  return best
}

/** Precision score for one candidate: best whole-string + idf-weighted token agreement over its titles. */
function rerankScore(
  qn: string, qTokens: string[], qSorted: string[], entries: ITextEntry[], qIdf: number[], memos: Memo[],
): number {
  let best = 0
  for (const t of entries) {
    let s = similarity(qn, t.n)
    if (t.n.length > qn.length + 2) s = Math.max(s, 0.95 * similarity(qn, t.n.slice(0, qn.length + 2), s / 0.95))
    if (t.n === qn) s = 1
    else if (t.n.startsWith(qn) || qn.startsWith(t.n)) s = Math.max(s, 0.85)
    else if (qn.length >= 4 && t.n.includes(qn)) s = Math.max(s, 0.75)
    let cov = 0
    let denom = 0
    for (let qi = 0; qi < qTokens.length; qi++) {
      const w = qIdf[qi]
      cov += w * memoTokenScore(qTokens[qi], qSorted[qi], t.tk, t.tkSorted, memos[qi], false, t.tkSet)
      denom += w
    }
    cov = denom ? cov / denom : 0
    const combined = 0.6 * s + 0.4 * cov
    if (combined > best) best = combined
  }
  return best
}

interface IGramField {
  postings: Map<string, number[]>
  norm: Float64Array
  n: number
}

function gramField(docs: IDuetDoc[], pick: (d: IDuetDoc) => string[], normalizer: (s: string) => string): IGramField {
  const n = docs.length
  const postings = new Map<string, number[]>()
  const norm = new Float64Array(n)
  docs.forEach((d, i) => {
    const set = new Set<string>()
    for (const text of pick(d)) for (const g of ngrams(normalizer(text))) set.add(g)
    for (const g of set) {
      let p = postings.get(g)
      if (!p) { p = []; postings.set(g, p) }
      p.push(i)
    }
    norm[i] = 1 / Math.sqrt(set.size || 1)
  })
  return { postings, norm, n }
}

/** Accumulate idf per doc into `out`; returns the total idf the query could have earned. */
function gramAccumulate(idx: IGramField, grams: string[], out: Float64Array): number {
  out.fill(0)
  let total = 0
  for (const g of grams) {
    const p = idx.postings.get(g)
    if (!p) continue
    const idf = Math.log(1 + idx.n / p.length)
    total += idf
    for (const i of p) out[i] += idf
  }
  return total
}

/** Tuned as a unit against the lab's 731-query benchmark — see the module header. */
export const DUET_PARAMS = {
  dfCapFrac: 0.1,
  candTitles: 8,
  candLines: 16,
  strLines: 4,
  gateCover: 0.75,
  gateMargin: 1.5,
  skipLiteral: 0.15,
  skipPhon: 0.3,
  stopIdf: 2.5,
  walkBudget: 4500,
  wPhon: 0.35,
  wPhonRescue: 0.6,
  rescueCover: 0.3,
  wTitleGram: 1.0,
  wLineGram: 1.0,
  wTitleRerank: 3.0,
  wLineRerank: 2.5,
  wContent: 1.05,
}

/** idf-weighted token coverage of one line (cheap half of the content rerank). */
function lineCovScore(qTokens: string[], qSorted: string[], qIdf: number[], qCheap: boolean[], line: ITextEntry, memos: Memo[]): number {
  let cov = 0
  let denom = 0
  for (let qi = 0; qi < qTokens.length; qi++) {
    cov += qIdf[qi] * memoTokenScore(qTokens[qi], qSorted[qi], line.tk, line.tkSorted, memos[qi], qCheap[qi], line.tkSet)
    denom += qIdf[qi]
  }
  return denom ? cov / denom : 0
}

/** Whole-string half of the content rerank: the query is a fragment from anywhere in the line. */
function lineStrScore(qn: string, line: ITextEntry): number {
  let s = similarity(qn, line.n)
  if (line.n.length > qn.length + 2) s = Math.max(s, 0.95 * infixSimilarity(qn, line.n))
  return s
}

interface ILineIndex {
  postings: Map<string, number[]>
  n: number
  norm: Float64Array
  lines: ITextEntry[]
  /** Original (un-normalized) line text, parallel to `lines` — for showing a content match. */
  raw: string[]
  song: Int32Array
}

export interface IDuetState {
  tokenDf: Map<string, number>
  P: typeof DUET_PARAMS
  title: IGramField
  phon: IGramField
  titles: ITextEntry[][]
  refs: number[]
  line: ILineIndex
  bufT: Float64Array
  bufP: Float64Array
  bufL: Float64Array
  touched: Int32Array
}

/** Build the two-field index. ~150 ms over the full corpus; do it once and reuse across keystrokes. */
export function buildDuet(docs: IDuetDoc[]): IDuetState {
  const P = DUET_PARAMS
  const title = gramField(docs, (d) => d.title, baseline)
  const phon = gramField(docs, (d) => d.title, phonetic)
  const titles: ITextEntry[][] = docs.map((d) =>
    d.title.map((x) => {
      const n = baseline(x)
      const tk = tokenize(n)
      return { n, tk, tkSorted: tk.map(sortChars), tkSet: new Set(tk) }
    }))

  // Content: one document per LINE. `song` maps a line back to its owning doc; `rawLines` keeps the
  // original text so a content match can be shown as the line the reader actually matched.
  const lines: ITextEntry[] = []
  const rawLines: string[] = []
  const lineSong: number[] = []
  docs.forEach((d, si) => {
    for (const text of d.content) {
      const n = baseline(text)
      if (!n) continue
      const tk = tokenize(n)
      lines.push({ n, tk, tkSorted: tk.map(sortChars), tkSet: new Set(tk) })
      rawLines.push(text)
      lineSong.push(si)
    }
  })
  const nLines = lines.length
  const postings = new Map<string, number[]>()
  const lineNorm = new Float64Array(nLines)
  lines.forEach((l, i) => {
    const set = new Set(ngrams(l.n))
    for (const g of set) {
      let p = postings.get(g)
      if (!p) { p = []; postings.set(g, p) }
      p.push(i)
    }
    lineNorm[i] = 1 / Math.sqrt(set.size || 1)
  })
  // Drop postings covering most lines: idf ~ 0 but the walk cost is the whole corpus.
  const dfCap = Math.max(2, Math.floor(nLines * P.dfCapFrac))
  for (const [g, p] of postings) if (p.length > dfCap) postings.delete(g)

  const tokenDf = new Map<string, number>()
  for (const l of lines) for (const t of new Set(l.tk)) tokenDf.set(t, (tokenDf.get(t) || 0) + 1)

  return {
    tokenDf, P, title, phon, titles, refs: docs.map((d) => d.ref),
    line: { postings, n: nLines, norm: lineNorm, lines, raw: rawLines, song: Int32Array.from(lineSong) },
    bufT: new Float64Array(docs.length),
    bufP: new Float64Array(docs.length),
    bufL: new Float64Array(nLines),
    touched: new Int32Array(nLines),
  }
}

/** Ranked refs for a query. Sub-millisecond after build. */
export function searchDuet(state: IDuetState, query: string, limit = 20): IDuetResult[] {
  const { P, title, phon, titles, refs, line, bufT, bufP, bufL, tokenDf } = state
  // Romanize a native-script query to IAST so it matches the Latin index; a no-op for Latin input.
  query = romanizeQuery(query)
  const qn = baseline(query)
  const grams = [...new Set(ngrams(qn))]
  if (!grams.length) return []
  const qTokens = tokenize(qn)
  const qSorted = qTokens.map(sortChars)
  const qIdf = qTokens.map((t) => Math.log(1 + line.n / (tokenDf.get(t) || 1)))
  const qCheap = qIdf.map((w) => w < P.stopIdf)
  const memos: Memo[] = qTokens.map(() => new Map())

  // --- title path: literal trigrams first; the other signals wait behind the gate.
  const totalIdf = gramAccumulate(title, grams, bufT)

  // Early exit only when one title essentially explains the whole query AND clears the runner-up.
  if (totalIdf > 0 && P.gateCover > 0) {
    let b1 = 0
    let b1i = -1
    let b2 = 0
    let rawBest = 0
    for (let i = 0; i < title.n; i++) {
      if (bufT[i] === 0) continue
      const s = bufT[i] * title.norm[i]
      if (s > b1) { b2 = b1; b1 = s; b1i = i; rawBest = bufT[i] }
      else if (s > b2) b2 = s
    }
    if (b1i >= 0 && rawBest / totalIdf >= P.gateCover && (b2 === 0 || b1 >= b2 * P.gateMargin)) {
      const out: IDuetResult[] = []
      for (let i = 0; i < title.n; i++) if (bufT[i] > 0) out.push({ ref: refs[i], score: bufT[i] * title.norm[i] })
      out.sort((a, b) => b.score - a.score)
      return out.slice(0, limit)
    }
  }

  const totalPhonIdf = gramAccumulate(phon, [...new Set(ngrams(phonetic(query)))], bufP)
  interface TCand { i: number; t: number; p: number; score: number }
  const tCand: TCand[] = []
  for (let i = 0; i < title.n; i++) {
    const t = bufT[i] * title.norm[i]
    const p = bufP[i] * phon.norm[i]
    if (t > 0 || p > 0) tCand.push({ i, t, p, score: 0 })
  }
  let maxT = 0
  let maxP = 0
  for (const c of tCand) { if (c.t > maxT) maxT = c.t; if (c.p > maxP) maxP = c.p }
  let top1: TCand | null = null
  for (const c of tCand) if (!top1 || c.t > top1.t) top1 = c
  const literalCover = totalIdf > 0 && top1 ? bufT[top1.i] / totalIdf : 0
  const wPhon = literalCover < P.rescueCover ? P.wPhonRescue : P.wPhon
  for (const c of tCand) c.score = (maxT ? (c.t / maxT) * P.wTitleGram : 0) + (maxP ? (c.p / maxP) * wPhon : 0)
  tCand.sort((a, b) => b.score - a.score)

  let maxPRaw = 0
  for (const c of tCand) if (bufP[c.i] > maxPRaw) maxPRaw = bufP[c.i]
  const phonCover = totalPhonIdf > 0 ? maxPRaw / totalPhonIdf : 0
  const titleHopeless = literalCover < P.skipLiteral && phonCover < P.skipPhon
  const kT = titleHopeless ? 0 : Math.min(P.candTitles, tCand.length)
  for (let r = 0; r < kT; r++) {
    const c = tCand[r]
    c.score += P.wTitleRerank * rerankScore(qn, qTokens, qSorted, titles[c.i], qIdf, memos)
  }

  // --- content path: per-line trigram retrieval, rerank the leaders. Walk only touched lines.
  const touched = state.touched
  let nTouched = 0
  const lps: number[][] = []
  for (const g of grams) { const p = line.postings.get(g); if (p) lps.push(p) }
  lps.sort((a, b) => a.length - b.length)
  let budget = P.walkBudget
  for (const p of lps) {
    if (budget <= 0) break
    budget -= p.length
    const idf = Math.log(1 + line.n / p.length)
    for (const i of p) { if (bufL[i] === 0) touched[nTouched++] = i; bufL[i] += idf }
  }
  const K = P.candLines
  const heapI = new Int32Array(K)
  const heapS = new Float64Array(K)
  let heapN = 0
  for (let ti = 0; ti < nTouched; ti++) {
    const i = touched[ti]
    const s = bufL[i] * line.norm[i]
    if (heapN < K) {
      let j = heapN++
      heapI[j] = i
      heapS[j] = s
      while (j > 0) {
        const par = (j - 1) >> 1
        if (heapS[par] <= heapS[j]) break
        const t1 = heapI[par]; heapI[par] = heapI[j]; heapI[j] = t1
        const t2 = heapS[par]; heapS[par] = heapS[j]; heapS[j] = t2
        j = par
      }
    } else if (s > heapS[0]) {
      heapI[0] = i
      heapS[0] = s
      let j = 0
      for (;;) {
        const l = 2 * j + 1
        const r = l + 1
        let m = j
        if (l < heapN && heapS[l] < heapS[m]) m = l
        if (r < heapN && heapS[r] < heapS[m]) m = r
        if (m === j) break
        const t1 = heapI[m]; heapI[m] = heapI[j]; heapI[j] = t1
        const t2 = heapS[m]; heapS[m] = heapS[j]; heapS[j] = t2
        j = m
      }
    }
  }
  for (let ti = 0; ti < nTouched; ti++) bufL[touched[ti]] = 0
  let maxL = 0
  for (let j = 0; j < heapN; j++) if (heapS[j] > maxL) maxL = heapS[j]

  interface LCand { i: number; cov: number; score: number }
  const lCand: LCand[] = []
  for (let j = 0; j < heapN; j++) {
    const i = heapI[j]
    const g = heapS[j]
    const cov = lineCovScore(qTokens, qSorted, qIdf, qCheap, line.lines[i], memos)
    lCand.push({ i, cov, score: (maxL ? (g / maxL) * P.wLineGram : 0) + P.wLineRerank * 0.4 * cov })
  }
  lCand.sort((a, b) => b.score - a.score)
  const kB = Math.min(P.strLines, lCand.length)
  for (let r = 0; r < kB; r++) {
    const c = lCand[r]
    c.score += P.wLineRerank * 0.6 * lineStrScore(qn, line.lines[c.i])
  }
  const kL = lCand.length

  // --- fuse: a doc scores by its best path. `line` is set only when the content path is that best,
  // so the caller can tell a text match from a title match.
  const fused = new Map<number, { score: number; line?: string }>()
  for (const c of tCand) {
    const prev = fused.get(c.i)
    if (prev === undefined || c.score > prev.score) fused.set(c.i, { score: c.score })
  }
  for (let r = 0; r < kL; r++) {
    const c = lCand[r]
    const si = line.song[c.i]
    const s = c.score * P.wContent
    const prev = fused.get(si)
    if (prev === undefined || s > prev.score) fused.set(si, { score: s, line: line.raw[c.i] })
  }
  return [...fused.entries()]
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, limit)
    .map(([i, v]) => ({ ref: refs[i], score: v.score, line: v.line }))
}
