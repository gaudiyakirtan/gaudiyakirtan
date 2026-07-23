import Foundation

/// Abstraction over the search matcher (docs/screens/search.md: "Keep the search interface
/// abstracted so a semantic tier can layer behind the same result list"). Tier 1 is the
/// diacritic-insensitive fuzzy matcher below; a future tier-2 on-device semantic searcher can adopt
/// this same protocol and be swapped into `SearchViewModel` with no UI change.
protocol SongSearcher {
    /// Ranked manifest entries for `query`, best first, capped at `limit`. Empty/whitespace query
    /// returns no results (the caller shows the idle state).
    func search(_ query: String, limit: Int) -> [ManifestEntry]
}

/// One pre-normalized index record per `ManifestEntry` — every title script plus the resolved author
/// name, folded once at build time so per-keystroke search only normalizes the query.
private struct SongSearchDocument {
    let entry: ManifestEntry
    /// Normalized full title strings, one per `titles[]` script (Roman + native), so a query in any
    /// script can match (search.md "Match against all title scripts").
    let titleForms: [String]
    let titleTokens: [[String]]
    let authorForm: String
    let authorTokens: [String]
}

/// Tier-1 offline fuzzy searcher (docs/screens/search.md "Matching rules"). Ranks, per entry:
/// exact → prefix → substring → fuzzy (token overlap / edit distance), and always ranks any title
/// match above any author match. Indexes the Manifest only; never loads full songs.
final class FuzzySongSearcher: SongSearcher {
    private let documents: [SongSearchDocument]

    /// Field weights guarantee ordering: any title hit (base 10 + tier) outranks any author hit
    /// (base 0 + tier), per search.md "Author matches rank below title matches."
    private static let titleBase = 10.0
    private static let authorBase = 0.0
    /// A query token counts as matching a target token at/above this similarity.
    private static let tokenMatchThreshold = 0.6
    /// Minimum evidence to admit a fuzzy (non-substring) match, keeping noise out.
    private static let fuzzyAvgThreshold = 0.5
    private static let fuzzyStrongTokenThreshold = 0.7

    init(entries: [ManifestEntry], authorName: (String) -> String) {
        documents = entries.map { entry in
            let forms = entry.titles.map { StringUtils.normalizeForSearch($0.displayText) }
                .filter { !$0.isEmpty }
            // Always include the primary title too (covers entries with an empty `titles[]`).
            var titleForms = forms
            let primary = StringUtils.normalizeForSearch(entry.primaryTitle.displayText)
            if !primary.isEmpty && !titleForms.contains(primary) { titleForms.append(primary) }
            let author = StringUtils.normalizeForSearch(authorName(entry.authorUid))
            return SongSearchDocument(
                entry: entry,
                titleForms: titleForms,
                titleTokens: titleForms.map { $0.split(separator: " ").map(String.init) },
                authorForm: author,
                authorTokens: author.split(separator: " ").map(String.init)
            )
        }
    }

    func search(_ query: String, limit: Int = 60) -> [ManifestEntry] {
        let qNorm = StringUtils.normalizeForSearch(query)
        guard !qNorm.isEmpty else { return [] }
        let qTokens = qNorm.split(separator: " ").map(String.init)

        let scored: [(entry: ManifestEntry, score: Double)] = documents.compactMap { doc in
            var best = 0.0
            for (form, tokens) in zip(doc.titleForms, doc.titleTokens) {
                best = max(best, tierScore(qNorm: qNorm, qTokens: qTokens,
                                           form: form, formTokens: tokens, base: Self.titleBase))
            }
            best = max(best, tierScore(qNorm: qNorm, qTokens: qTokens,
                                       form: doc.authorForm, formTokens: doc.authorTokens,
                                       base: Self.authorBase))
            return best > 0 ? (doc.entry, best) : nil
        }

        return scored
            .sorted { $0.score != $1.score ? $0.score > $1.score
                : $0.entry.displayTitle.localizedCaseInsensitiveCompare($1.entry.displayTitle) == .orderedAscending }
            .prefix(limit)
            .map { $0.entry }
    }

    /// Score of one query against one target form, within a field (title/author). 0 = no match.
    /// Higher tiers dominate: exact(+4) > prefix(+3) > substring(+2) > fuzzy(+1, scaled by
    /// similarity). Detail terms only break ties within a tier.
    private func tierScore(qNorm: String, qTokens: [String],
                           form: String, formTokens: [String], base: Double) -> Double {
        guard !form.isEmpty else { return 0 }
        if form == qNorm { return base + 4.0 }
        if form.hasPrefix(qNorm) {
            // Shorter targets (closer to the query) rank slightly higher within the prefix tier.
            return base + 3.0 + 1.0 / Double(form.count + 1)
        }
        if form.contains(qNorm) {
            return base + 2.0 + 1.0 / Double(form.count + 1)
        }
        // Fuzzy: average best per-query-token similarity against the target's tokens.
        guard !qTokens.isEmpty, !formTokens.isEmpty else { return 0 }
        var total = 0.0
        var strongest = 0.0
        var matched = 0
        for qt in qTokens {
            var bestSim = 0.0
            for ft in formTokens { bestSim = max(bestSim, Self.tokenSimilarity(qt, ft)) }
            total += bestSim
            strongest = max(strongest, bestSim)
            if bestSim >= Self.tokenMatchThreshold { matched += 1 }
        }
        let avg = total / Double(qTokens.count)
        let matchedFrac = Double(matched) / Double(qTokens.count)
        let qualifies = matchedFrac >= 0.6
            || (strongest >= Self.fuzzyStrongTokenThreshold && avg >= Self.fuzzyAvgThreshold)
        guard qualifies else { return 0 }
        return base + 1.0 + avg
    }

    /// Similarity of two tokens in [0, 1]: exact, containment (typed token is a fragment of the
    /// target word or vice-versa), else 1 − editDistance/maxLen.
    private static func tokenSimilarity(_ a: String, _ b: String) -> Double {
        if a == b { return 1.0 }
        if a.count >= 2 && b.contains(a) { return 0.9 }
        if b.count >= 2 && a.contains(b) { return 0.85 }
        let maxLen = max(a.count, b.count)
        guard maxLen > 0 else { return 0 }
        let d = StringUtils.levenshtein(a, b)
        return 1.0 - Double(d) / Double(maxLen)
    }
}
