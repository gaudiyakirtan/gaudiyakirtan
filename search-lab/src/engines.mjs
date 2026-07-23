// The candidates. Every engine implements the same tiny interface so the harness can swap them:
//
//   build(docs)            -> opaque state          (timed; sized via measure())
//   search(state, q, k)    -> [{ ref, score }]      (timed, ranked, truncated)
//
// A `doc` is { ref, texts[] } - ref is what we score against ground truth (a song uid), texts are
// every string that should match it (title in 10 scripts, author, verse lines...). Keeping the doc
// shape identical across engines is what makes the comparison honest: any difference in the
// results is the algorithm, not the input.
import { baseline, phonetic, tokenize, similarity, ngrams } from './normalize.mjs'

// ---------------------------------------------------------------------------
// 1. current - a faithful port of web/src/services/search.ts scoreText().
//    This is the shipping baseline; every other engine has to beat it to matter.
// ---------------------------------------------------------------------------
function tokenScore(queryToken, targetTokens) {
  let best = 0
  for (const tt of targetTokens) {
    let m
    if (tt === queryToken) m = 1
    else {
      const shorter = queryToken.length <= tt.length ? queryToken : tt
      const longer = shorter === queryToken ? tt : queryToken
      const lenScore = Math.min(0.92, 0.45 + 0.07 * shorter.length)
      m = similarity(queryToken, tt)
      if (longer.startsWith(shorter)) m = Math.max(m, lenScore)
      else if (shorter.length >= 3 && longer.includes(shorter)) m = Math.max(m, lenScore - 0.05)
    }
    if (m > best) { best = m; if (best === 1) break }
  }
  return best
}

function scoreTarget(qNorm, qTokens, tNorm, tTokens) {
  if (!qNorm || !tNorm) return 0
  let whole = 0
  if (tNorm === qNorm) whole = 100
  else if (tNorm.startsWith(qNorm)) whole = 80
  else if (qNorm.length >= 2 && tNorm.includes(qNorm)) whole = 60
  let sum = 0, matched = 0
  for (const qt of qTokens) {
    const s = tokenScore(qt, tTokens)
    sum += s
    if (s >= 0.7) matched += 1
  }
  const coverage = qTokens.length ? matched / qTokens.length : 0
  return Math.max(whole, sum * 12 + coverage * 20)
}

export const current = {
  id: 'current',
  name: 'current (linear scoreText)',
  blurb: 'What ships today. Scores every target with tiered whole-string + per-token Levenshtein.',
  build(docs) {
    return docs.map((d) => ({
      ref: d.ref,
      t: d.texts.map((x) => { const n = baseline(x); return { n, tk: tokenize(n) } }),
    }))
  },
  search(state, query, limit = 20) {
    const qn = baseline(query), qt = tokenize(qn)
    const out = []
    for (const d of state) {
      let best = 0
      for (const t of d.t) {
        const s = scoreTarget(qn, qt, t.n, t.tk)
        if (s > best) best = s
      }
      if (best >= 5) out.push({ ref: d.ref, score: best })
    }
    out.sort((a, b) => b.score - a.score)
    return out.slice(0, limit)
  },
}

// ---------------------------------------------------------------------------
// Shared inverted-index construction, used by bm25 / bm25-fuzzy / hybrid.
// ---------------------------------------------------------------------------
const K1 = 1.2, B = 0.75

function buildInverted(docs, normalizer) {
  const postings = new Map()   // token -> [docIdx, tf, docIdx, tf, ...]
  const refs = [], lens = []
  let total = 0
  docs.forEach((d, i) => {
    refs.push(d.ref)
    const tf = new Map()
    for (const text of d.texts) for (const w of tokenize(normalizer(text))) tf.set(w, (tf.get(w) ?? 0) + 1)
    let len = 0
    for (const [w, f] of tf) {
      let p = postings.get(w)
      if (!p) postings.set(w, p = [])
      p.push(i, f)
      len += f
    }
    lens.push(len)
    total += len
  })
  return { postings, refs, lens, avgdl: total / (docs.length || 1), n: docs.length,
           vocab: [...postings.keys()].sort() }
}

/** Vocabulary terms starting with `p`, capped so a one-letter query can't expand to everything. */
function prefixTerms(vocab, p, cap = 64) {
  let lo = 0, hi = vocab.length
  while (lo < hi) { const m = (lo + hi) >> 1; if (vocab[m] < p) lo = m + 1; else hi = m }
  const out = []
  for (let i = lo; i < vocab.length && vocab[i].startsWith(p); i++) {
    out.push(vocab[i])
    if (out.length >= cap) break
  }
  return out
}

function bm25Accumulate(state, terms, acc, weight = 1) {
  const { postings, lens, avgdl, n } = state
  for (const { term, w } of terms) {
    const p = postings.get(term)
    if (!p) continue
    const df = p.length / 2
    const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5))
    for (let j = 0; j < p.length; j += 2) {
      const i = p[j], f = p[j + 1]
      const s = idf * (f * (K1 + 1)) / (f + K1 * (1 - B + B * lens[i] / avgdl))
      acc.set(i, (acc.get(i) ?? 0) + s * w * weight)
    }
  }
}

function topFrom(acc, refs, limit) {
  const arr = [...acc.entries()]
  arr.sort((a, b) => b[1] - a[1])
  return arr.slice(0, limit).map(([i, score]) => ({ ref: refs[i], score }))
}

export const bm25 = {
  id: 'bm25',
  name: 'BM25 + prefix',
  blurb: 'Inverted index, IDF-weighted, length-normalized. Prefix-expands the last token as you type.',
  build(docs) { return buildInverted(docs, baseline) },
  search(state, query, limit = 20) {
    const qt = tokenize(baseline(query))
    const acc = new Map()
    for (const w of qt) {
      const terms = state.postings.has(w) ? [{ term: w, w: 1 }] : []
      for (const p of prefixTerms(state.vocab, w)) if (p !== w) terms.push({ term: p, w: 0.6 })
      bm25Accumulate(state, terms, acc)
    }
    return topFrom(acc, state.refs, limit)
  },
}

export const bm25Fuzzy = {
  id: 'bm25-fuzzy',
  name: 'BM25 + prefix + fuzzy',
  blurb: 'Adds a vocabulary-level edit-distance fallback when a token matches nothing exactly.',
  build(docs) { return buildInverted(docs, baseline) },
  search(state, query, limit = 20) {
    const qt = tokenize(baseline(query))
    const acc = new Map()
    for (const w of qt) {
      const terms = state.postings.has(w) ? [{ term: w, w: 1 }] : []
      for (const p of prefixTerms(state.vocab, w)) if (p !== w) terms.push({ term: p, w: 0.6 })
      if (terms.length === 0) {
        const th = w.length <= 4 ? 0.72 : 0.78
        for (const v of state.vocab) {
          if (Math.abs(v.length - w.length) > 2) continue
          const s = similarity(w, v)
          if (s >= th) terms.push({ term: v, w: s * 0.9 })
        }
      }
      bm25Accumulate(state, terms, acc)
    }
    return topFrom(acc, state.refs, limit)
  },
}

// ---------------------------------------------------------------------------
// trigram - character n-grams. The one structure that survives *metathesis*
// (letters transposed inside a token: vimostottra / viṁśottara), which token
// edit-distance handles badly. docs/screens/search.md calls this out as the
// known tier-1 limitation.
// ---------------------------------------------------------------------------
export const trigram = {
  id: 'trigram',
  name: 'Trigram index',
  blurb: 'Character 3-grams with IDF weighting. Robust to transposed letters and run-together words.',
  build(docs) {
    const postings = new Map()
    const refs = [], sizes = []
    docs.forEach((d, i) => {
      refs.push(d.ref)
      const set = new Set()
      for (const text of d.texts) for (const g of ngrams(baseline(text).replace(/\s+/g, ' '))) set.add(g)
      for (const g of set) {
        let p = postings.get(g)
        if (!p) postings.set(g, p = [])
        p.push(i)
      }
      sizes.push(set.size || 1)
    })
    return { postings, refs, sizes, n: docs.length }
  },
  search(state, query, limit = 20) {
    const q = [...new Set(ngrams(baseline(query)))]
    const acc = new Map()
    for (const g of q) {
      const p = state.postings.get(g)
      if (!p) continue
      const idf = Math.log(1 + state.n / p.length)
      for (const i of p) acc.set(i, (acc.get(i) ?? 0) + idf)
    }
    // Normalize by doc size so a long song title cannot win on volume alone.
    const arr = [...acc.entries()].map(([i, s]) => [i, s / Math.sqrt(state.sizes[i])])
    arr.sort((a, b) => b[1] - a[1])
    return arr.slice(0, limit).map(([i, score]) => ({ ref: state.refs[i], score }))
  },
}

// ---------------------------------------------------------------------------
// phonetic - index the sound, not the spelling. Readers type what they hear;
// this collapses aspiration, voicing, sibilants, nasals and vowel quality so
// "padha"/"pada" and "charna"/"caraṇa" become the same key.
// ---------------------------------------------------------------------------
export const phoneticEngine = {
  id: 'phonetic',
  name: 'Phonetic key',
  blurb: 'BM25 over a Gauḍīya-romanization phonetic key (aspiration, voicing, sibilants, vowels folded).',
  build(docs) { return buildInverted(docs, phonetic) },
  search(state, query, limit = 20) {
    const qt = tokenize(phonetic(query))
    const acc = new Map()
    for (const w of qt) {
      const terms = state.postings.has(w) ? [{ term: w, w: 1 }] : []
      for (const p of prefixTerms(state.vocab, w)) if (p !== w) terms.push({ term: p, w: 0.6 })
      if (terms.length === 0) {
        for (const v of state.vocab) {
          if (Math.abs(v.length - w.length) > 2) continue
          const s = similarity(w, v)
          if (s >= 0.75) terms.push({ term: v, w: s * 0.9 })
        }
      }
      bm25Accumulate(state, terms, acc)
    }
    return topFrom(acc, state.refs, limit)
  },
}

// ---------------------------------------------------------------------------
// hybrid - fuse the three. They fail differently: BM25 needs a real token
// match, trigram survives transposition, phonetic survives mis-hearing. Summing
// normalized scores lets any one of them rescue a query the others miss.
// ---------------------------------------------------------------------------
export const hybrid = {
  id: 'hybrid',
  name: 'Hybrid (BM25 + trigram + phonetic)',
  blurb: 'Rank fusion of the three. Each covers a different failure mode; the sum covers more than any alone.',
  build(docs) {
    return { b: bm25Fuzzy.build(docs), t: trigram.build(docs), p: phoneticEngine.build(docs) }
  },
  search(state, query, limit = 20) {
    const WEIGHTS = { b: 1.0, t: 0.7, p: 0.8 }
    const fused = new Map()
    for (const [key, engine, st] of [['b', bm25Fuzzy, state.b], ['t', trigram, state.t], ['p', phoneticEngine, state.p]]) {
      const res = engine.search(st, query, 50)
      const top = res[0]?.score || 1
      for (const [rank, r] of res.entries()) {
        // Normalized score plus a reciprocal-rank term, so a confident #1 from any engine carries.
        const v = (r.score / top) * WEIGHTS[key] + WEIGHTS[key] / (10 + rank)
        fused.set(r.ref, (fused.get(r.ref) ?? 0) + v)
      }
    }
    return [...fused.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([ref, score]) => ({ ref, score }))
  },
}

// ---------------------------------------------------------------------------
// trigram-fielded - the same trigram matcher, but title and content are kept in
// SEPARATE indexes and combined per song, instead of being poured into one bag
// of n-grams.
//
// This exists because of a result the lab produced: adding verse text collapses
// plain trigram from 79.7% to 23.4% R@1, while the linear ranker barely moves
// (77.1% -> 65.8%). The difference is not the algorithm, it is the document
// model. The linear ranker scores every text separately and keeps the best;
// pooling instead lets ~24 lines of verse drown the one line that is the title.
// A doc may supply {title:[], content:[]}; it falls back to `texts` if not.
// ---------------------------------------------------------------------------
export const trigramFielded = {
  id: 'trigram-fielded',
  name: 'Trigram, fielded (title | content)',
  blurb: 'Separate trigram indexes for title and body, combined per song. Title dominates; content only adds.',
  build(docs) {
    const titleDocs = docs.map((d) => ({ ref: d.ref, texts: d.title ?? d.texts }))
    const bodyDocs = docs.map((d) => ({ ref: d.ref, texts: d.content ?? [] }))
    return { t: trigram.build(titleDocs), c: trigram.build(bodyDocs) }
  },
  search(state, query, limit = 20) {
    // Title is the authority; a body hit can promote a song but never outrank a good title match.
    const CONTENT_WEIGHT = 0.25
    const fused = new Map()
    const tr = trigram.search(state.t, query, limit * 3)
    const top = tr[0]?.score || 1
    for (const r of tr) fused.set(r.ref, r.score / top)
    const cr = trigram.search(state.c, query, limit * 3)
    const ctop = cr[0]?.score || 1
    for (const r of cr) fused.set(r.ref, (fused.get(r.ref) ?? 0) + (r.score / ctop) * CONTENT_WEIGHT)
    return [...fused.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit)
      .map(([ref, score]) => ({ ref, score }))
  },
}

// ---------------------------------------------------------------------------
// cascade - purpose-built for the title+content corpus. Three signals, spent
// in order of cost, each consulted only when the previous one has not already
// decided the query:
//
//   1. fielded trigram over titles, accumulated into a typed array (fast path)
//   2. phonetic trigram over titles - rescues sound-alike misspellings that
//      share almost no literal trigrams ("chatinya" / "caitanya")
//   3. content trigrams + a whole-string / per-token rerank of the leaders -
//      restores word ORDER, which bag-of-trigrams cannot see ("kabe habe hena
//      dasa mora" vs "kabe hena dasa habe mora")
//
// Most real queries are decided by stage 1 alone, so the median query pays
// only for the title index; the expensive precision machinery runs exactly on
// the queries that need it.
// ---------------------------------------------------------------------------
export const CASCADE_PARAMS = {
  gateMargin: 1.2,   // top1/top2 score ratio that counts as "decided"
  gateCover: 0.5,    // share of the query's gram idf the winner must hold
  wPhon: 0.35,       // stage-2 fusion weights (title signal is 1.0)
  wPhonRescue: 0.6,  // phonetic weight when literal trigrams barely matched at all
  rescueCover: 0.3,  // literal coverage below which the query counts as "sound-alike only"
  wContent: 0.1,
  wRerank: 3.0,
  rerankK: 16,       // leaders re-scored with Levenshtein in stage 2
}

const sortChars = (s) => [...s].sort().join('')

/**
 * Semi-global alignment: edit distance of `needle` against the best-matching SUBSTRING of `hay`
 * (deletions at both ends of hay are free). Titles glue śrī + name + aṣṭakam into one long token
 * ("sricaitanyastakam") while people type the parts ("chatinya"); plain Levenshtein early-outs on
 * the length gap, but the infix alignment finds the "caitanya" inside.
 */
const DP_A = new Float64Array(96), DP_B = new Float64Array(96) // scratch rows; titles are short
function infixSimilarity(needle, hay) {
  const n = needle.length, m = hay.length
  if (!n || !m || m >= DP_A.length) return 0
  let prev = DP_A, curr = DP_B
  for (let j = 0; j <= m; j++) prev[j] = 0 // free start anywhere in hay
  for (let i = 1; i <= n; i++) {
    curr[0] = i
    for (let j = 1; j <= m; j++) {
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + (needle[i - 1] === hay[j - 1] ? 0 : 1))
    }
    ;[prev, curr] = [curr, prev]
  }
  let best = prev[0]
  for (let j = 1; j <= m; j++) if (prev[j] < best) best = prev[j]
  return 1 - best / n
}

/**
 * tokenScore plus two fallbacks it cannot see: sorted-character similarity for transpositions
 * ("asktam" / "astakam" share almost no trigrams and sit 3 edits apart, but their sorted
 * characters nearly coincide), and infix alignment for part-of-glued-token matches.
 */
function fuzzyTokenScore(qt, qtSorted, targetTokens, targetSorted) {
  let m = tokenScore(qt, targetTokens)
  if (m >= 0.9) return m
  for (let i = 0; i < targetTokens.length; i++) {
    const tt = targetTokens[i]
    if (Math.abs(tt.length - qt.length) <= 2) {
      const s = 0.85 * similarity(qtSorted, targetSorted[i])
      if (s > m) m = s
    } else if (qt.length >= 4 && tt.length > qt.length + 2) {
      const s = 0.9 * infixSimilarity(qt, tt)
      if (s > m) m = s
    }
  }
  return m
}

function gramField(docs, pick, normalizer) {
  const n = docs.length
  const postings = new Map()
  const norm = new Float64Array(n)
  docs.forEach((d, i) => {
    const set = new Set()
    for (const text of pick(d)) for (const g of ngrams(normalizer(text))) set.add(g)
    for (const g of set) {
      let p = postings.get(g)
      if (!p) postings.set(g, p = [])
      p.push(i)
    }
    norm[i] = 1 / Math.sqrt(set.size || 1)
  })
  return { postings, norm, n }
}

/** Accumulate idf per doc into `out`; returns the total idf the query could have earned. */
function gramAccumulate(idx, grams, out) {
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

/** Precision score for one candidate: best whole-string + token agreement over its title texts. */
function rerankScore(qn, qTokens, qSorted, entries) {
  let best = 0
  for (const t of entries) {
    let s = similarity(qn, t.n)
    // People type the *front* of a title and stop. Compare against a same-length
    // prefix window too, so a long title is not punished for its untyped tail.
    if (t.n.length > qn.length + 2) {
      s = Math.max(s, 0.95 * similarity(qn, t.n.slice(0, qn.length + 2)))
    }
    if (t.n === qn) s = 1
    else if (t.n.startsWith(qn) || qn.startsWith(t.n)) s = Math.max(s, 0.85)
    else if (qn.length >= 4 && t.n.includes(qn)) s = Math.max(s, 0.75)
    let cov = 0
    for (let qi = 0; qi < qTokens.length; qi++) cov += fuzzyTokenScore(qTokens[qi], qSorted[qi], t.tk, t.tkSorted)
    cov = qTokens.length ? cov / qTokens.length : 0
    const combined = 0.6 * s + 0.4 * cov
    if (combined > best) best = combined
  }
  return best
}

export const cascade = {
  id: 'cascade',
  name: 'Cascade (gated trigram + rerank)',
  blurb: 'Fielded trigram fast path; phonetic + content + Levenshtein rerank only when the title index is undecided.',
  build(docs) {
    const P = CASCADE_PARAMS
    const title = gramField(docs, (d) => d.title ?? d.texts, baseline)
    const phon = gramField(docs, (d) => d.title ?? d.texts, phonetic)
    const content = gramField(docs, (d) => d.content ?? [], baseline)
    const titles = docs.map((d) =>
      (d.title ?? d.texts).map((x) => {
        const n = baseline(x), tk = tokenize(n)
        return { n, tk, tkSorted: tk.map(sortChars) }
      }))
    return {
      P, title, phon, content, titles,
      refs: docs.map((d) => d.ref),
      bufT: new Float64Array(docs.length),
      bufP: new Float64Array(docs.length),
      bufC: new Float64Array(docs.length),
    }
  },
  search(state, query, limit = 20) {
    const { P, title, phon, content, titles, refs, bufT, bufP, bufC } = state
    const qn = baseline(query)
    const grams = [...new Set(ngrams(qn))]
    if (!grams.length) return []

    // Stage 1: fielded title trigrams.
    const totalIdf = gramAccumulate(title, grams, bufT)
    const cand = []
    for (let i = 0; i < title.n; i++) {
      if (bufT[i] > 0) cand.push({ i, raw: bufT[i], score: bufT[i] * title.norm[i] })
    }
    cand.sort((a, b) => b.score - a.score)
    const top1 = cand[0], top2 = cand[1]
    if (top1 && totalIdf > 0 &&
        top1.raw / totalIdf >= P.gateCover &&
        (!top2 || top1.score >= top2.score * P.gateMargin)) {
      return cand.slice(0, limit).map((c) => ({ ref: refs[c.i], score: c.score }))
    }

    // Stage 2: the title index is undecided - bring in the other signals.
    gramAccumulate(phon, [...new Set(ngrams(phonetic(query)))], bufP)
    gramAccumulate(content, grams, bufC)
    // When the literal trigrams matched almost nothing, the query is a sound-alike
    // ("chatinya" / "caitanya") and the phonetic signal is the only one worth trusting.
    const literalCover = totalIdf > 0 && top1 ? top1.raw / totalIdf : 0
    const wPhon = literalCover < P.rescueCover ? P.wPhonRescue : P.wPhon
    let maxT = top1?.score || 1, maxP = 0, maxC = 0
    for (let i = 0; i < title.n; i++) {
      const p = bufP[i] * phon.norm[i]
      if (p > maxP) maxP = p
      const c = bufC[i] * content.norm[i]
      if (c > maxC) maxC = c
    }
    const fused = []
    for (let i = 0; i < title.n; i++) {
      const t = bufT[i] * title.norm[i]
      const p = bufP[i] * phon.norm[i]
      const c = bufC[i] * content.norm[i]
      if (t === 0 && p === 0 && c === 0) continue
      fused.push({
        i,
        score: t / maxT + (maxP ? (p / maxP) * wPhon : 0) + (maxC ? (c / maxC) * P.wContent : 0),
      })
    }
    fused.sort((a, b) => b.score - a.score)

    // Rerank the leaders with the precision scorer; order and near-exactness win here.
    const qTokens = tokenize(qn)
    const qSorted = qTokens.map(sortChars)
    const k = Math.min(P.rerankK, fused.length)
    for (let r = 0; r < k; r++) {
      const f = fused[r]
      f.score += P.wRerank * rerankScore(qn, qTokens, qSorted, titles[f.i])
    }
    fused.sort((a, b) => b.score - a.score)
    return fused.slice(0, limit).map((f) => ({ ref: refs[f.i], score: f.score }))
  },
}

export const ENGINES = [current, bm25, bm25Fuzzy, trigram, phoneticEngine, hybrid, trigramFielded, cascade]
