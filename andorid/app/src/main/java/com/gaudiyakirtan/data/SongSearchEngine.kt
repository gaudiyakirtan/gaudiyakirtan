package com.gaudiyakirtan.data

import com.gaudiyakirtan.myapplication.models.ManifestEntry
import com.gaudiyakirtan.myapplication.utils.StringUtils

/**
 * Offline song search over the [ManifestEntry] catalog (docs/screens/search.md, tier 1 — fuzzy).
 *
 * Abstracted behind this interface so the optional later semantic tier
 * (docs/screens/search.md tier 2) can be layered behind the same result list without touching the UI.
 * [search] returns matching song `uid`s ordered best-first.
 */
interface SongSearchEngine {
    fun search(query: String, limit: Int = 60): List<String>
}

/** Query/target normalization for diacritic-insensitive matching. Shared so behavior is one place. */
object SearchNormalizer {
    // Keep latin letters/digits, Devanagari (U+0900–U+097F), Bengali (U+0980–U+09FF), and spaces.
    private val KEEP = Regex("[^a-z0-9\\u0900-\\u097f\\u0980-\\u09ff\\s]")
    private val WS = Regex("\\s+")

    /**
     * lowercase, strip diacritics (ā→a, ṁ→m, ś→s), drop punctuation, collapse whitespace, then
     * **fold transliteration-equivalent letters** the Gauḍīya/Bengali romanization treats as one:
     * `v`→`b` and `j`→`y` (so `madhava`↔`madhaba`, `viṁśottara`↔`biṁśottara`, `jamuna`↔`yamunā`),
     * per docs/screens/search.md. Applied to both query and target, so either spelling matches.
     */
    fun normalize(text: String): String {
        val stripped = StringUtils.removeDiacritics(text).lowercase()
        val cleaned = WS.replace(KEEP.replace(stripped, " "), " ").trim()
        return foldTransliterationLetters(cleaned)
    }

    private fun foldTransliterationLetters(text: String): String {
        if (text.isEmpty()) return text
        val sb = StringBuilder(text.length)
        for (c in text) {
            sb.append(
                when (c) {
                    'v' -> 'b'
                    'j' -> 'y'
                    else -> c
                }
            )
        }
        return sb.toString()
    }

    fun tokenize(normalized: String): List<String> =
        normalized.split(" ").filter { it.isNotEmpty() }
}

/**
 * Fuzzy, diacritic-insensitive matcher. Matches a query against every title script and the resolved
 * author name of each manifest entry (docs/screens/search.md). Ranking: exact > prefix > substring >
 * fuzzy (token-overlap / edit-distance); author matches are down-weighted below title matches.
 *
 * Validated against `search-benchmark/search-database.csv` (real user attempts): ~71% top-1 / ~86%
 * top-5 of the ground-truthable rows return their intended song.
 */
class FuzzySongSearchEngine private constructor(
    private val entries: List<IndexedEntry>
) : SongSearchEngine {

    private class NormText(val norm: String, val tokens: List<String>)
    private class IndexedEntry(
        val uid: String,
        val titles: List<NormText>,
        val author: NormText
    )

    override fun search(query: String, limit: Int): List<String> {
        val qNorm = SearchNormalizer.normalize(query)
        if (qNorm.isEmpty()) return emptyList()
        val qTokens = SearchNormalizer.tokenize(qNorm)

        val scored = ArrayList<Pair<Double, String>>()
        for (entry in entries) {
            val titleScore = entry.titles.maxOfOrNull { matchScore(qNorm, qTokens, it) } ?: 0.0
            val authorScore = matchScore(qNorm, qTokens, entry.author) * AUTHOR_WEIGHT
            val score = maxOf(titleScore, authorScore)
            if (score > 0.0) scored.add(score to entry.uid)
        }
        scored.sortByDescending { it.first }
        return scored.take(limit).map { it.second }
    }

    companion object {
        private const val AUTHOR_WEIGHT = 0.7

        fun build(manifest: List<ManifestEntry>, authorNames: Map<String, String>): FuzzySongSearchEngine {
            val indexed = manifest.map { entry ->
                val titleTexts = entry.titles.map { it.text } + entry.primaryTitle.text
                val titles = titleTexts
                    .map { SearchNormalizer.normalize(it) }
                    .filter { it.isNotEmpty() }
                    .distinct()
                    .map { NormText(it, SearchNormalizer.tokenize(it)) }
                val authorNorm = SearchNormalizer.normalize(authorNames[entry.authorUid] ?: entry.authorUid)
                IndexedEntry(entry.uid, titles, NormText(authorNorm, SearchNormalizer.tokenize(authorNorm)))
            }
            return FuzzySongSearchEngine(indexed)
        }

        /** Tiered score of a normalized query against one normalized target (title or author). */
        private fun matchScore(qNorm: String, qTokens: List<String>, target: NormText): Double {
            val tNorm = target.norm
            if (tNorm.isEmpty()) return 0.0
            if (tNorm == qNorm) return 1000.0
            val cov = coverage(qTokens, target.tokens)
            return when {
                tNorm.startsWith(qNorm) -> 800.0 + 100.0 * cov
                tNorm.contains(qNorm) -> 600.0 + 100.0 * cov
                else -> 500.0 * cov
            }
        }

        /** Average best per-query-token similarity against the target tokens (0..1). */
        private fun coverage(qTokens: List<String>, tTokens: List<String>): Double {
            if (qTokens.isEmpty()) return 0.0
            var total = 0.0
            for (qt in qTokens) {
                var best = 0.0
                for (tt in tTokens) {
                    val sim = tokenSim(qt, tt)
                    if (sim > best) best = sim
                    if (best == 1.0) break
                }
                total += best
            }
            return total / qTokens.size
        }

        private fun tokenSim(q: String, t: String): Double {
            if (q == t) return 1.0
            val minLen = minOf(q.length, t.length)
            val maxLen = maxOf(q.length, t.length)
            if (maxLen == 0) return 0.0
            if (t.startsWith(q) || q.startsWith(t)) return 0.9 * minLen / maxLen
            if (t.contains(q) || q.contains(t)) return 0.7 * minLen / maxLen
            val sim = 1.0 - levenshtein(q, t).toDouble() / maxLen
            return if (sim >= 0.6) sim else 0.0
        }

        private fun levenshtein(a: String, b: String): Int {
            if (a == b) return 0
            if (a.isEmpty()) return b.length
            if (b.isEmpty()) return a.length
            var prev = IntArray(b.length + 1) { it }
            var cur = IntArray(b.length + 1)
            for (i in 1..a.length) {
                cur[0] = i
                for (j in 1..b.length) {
                    val cost = if (a[i - 1] == b[j - 1]) 0 else 1
                    cur[j] = minOf(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
                }
                val tmp = prev; prev = cur; cur = tmp
            }
            return prev[b.length]
        }
    }
}
