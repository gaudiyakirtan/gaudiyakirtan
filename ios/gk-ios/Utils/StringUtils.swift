import Foundation

struct StringUtils {
    
    /// Normalizes text by removing diacritical marks
    /// For example, "Śrīla" becomes "Srila"
    static func removeDiacritics(_ text: String) -> String {
        return text.folding(options: .diacriticInsensitive, locale: .current)
    }
    
    /// Returns the first letter of a string after removing diacritical marks
    /// Useful for alphabetical sorting and indexing
    static func firstNormalizedLetter(_ text: String) -> String {
        guard let firstChar = text.first else { return "" }
        let normalized = String(firstChar).folding(options: .diacriticInsensitive, locale: .current)
        return normalized.isEmpty ? "" : String(normalized.first!).uppercased()
    }
    
    /// Normalizes text for **diacritic-insensitive search** (docs/screens/search.md "Matching
    /// rules"): case-folds, strips diacritics (ā→a, ṁ→m, ś→s, ṛ→r …), folds the
    /// transliteration-equivalent letters **v→b** and **j→y** (Gauḍīya/Bengali romanization treats
    /// each pair as one — `madhava`↔`madhaba`, `viṁśottara`↔`biṁśottara`), and reduces every run of
    /// non-alphanumeric characters (whitespace, punctuation, hyphens) to a single space, trimmed.
    /// The result is the token-joined form both queries and index targets are compared on, so accents
    /// and transliteration variants are forgiven. Native scripts (Bengali/Devanāgarī) fold within
    /// their own script, so a native-script query still matches the native title form.
    static func normalizeForSearch(_ text: String) -> String {
        let folded = text.folding(
            options: [.diacriticInsensitive, .caseInsensitive, .widthInsensitive],
            locale: nil
        )
        var out = ""
        out.reserveCapacity(folded.count)
        var lastWasSpace = true // trims leading space
        for scalar in folded.unicodeScalars {
            if CharacterSet.alphanumerics.contains(scalar) {
                switch scalar {
                case "v", "V": out.append("b") // v↔b transliteration fold
                case "j", "J": out.append("y") // j↔y transliteration fold
                default: out.unicodeScalars.append(scalar)
                }
                lastWasSpace = false
            } else if !lastWasSpace {
                out.append(" ")
                lastWasSpace = true
            }
        }
        if out.hasSuffix(" ") { out.removeLast() }
        return out
    }

    /// The normalized whitespace-separated tokens of `text` (see `normalizeForSearch`).
    static func searchTokens(_ text: String) -> [String] {
        normalizeForSearch(text).split(separator: " ").map(String.init)
    }

    /// Optimal-string-alignment (Damerau) edit distance — the fuzzy fallback for typo-tolerant search
    /// (docs/screens/search.md tier-1 "fuzzy (edit-distance / token overlap)"). Like Levenshtein but
    /// counts a swap of two **adjacent** characters as a single edit, so common transliteration typos
    /// ("askt"↔"asta" for aṣṭa, "grael"↔"grale") stay close.
    static func levenshtein(_ a: String, _ b: String) -> Int {
        if a == b { return 0 }
        let s = Array(a), t = Array(b)
        if s.isEmpty { return t.count }
        if t.isEmpty { return s.count }
        var prevPrev = [Int](repeating: 0, count: t.count + 1)
        var prev = Array(0...t.count)
        var curr = [Int](repeating: 0, count: t.count + 1)
        for i in 1...s.count {
            curr[0] = i
            for j in 1...t.count {
                let cost = s[i - 1] == t[j - 1] ? 0 : 1
                var best = min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
                if i > 1, j > 1, s[i - 1] == t[j - 2], s[i - 2] == t[j - 1] {
                    best = min(best, prevPrev[j - 2] + 1) // adjacent transposition
                }
                curr[j] = best
            }
            let tmp = prevPrev; prevPrev = prev; prev = curr; curr = tmp
        }
        return prev[t.count]
    }

    /// Gets the section letter for alphabetical grouping
    /// For text starting with a non-letter character, returns "#"
    static func sectionLetter(for text: String) -> String {
        let normalizedFirstLetter = firstNormalizedLetter(text)
        if normalizedFirstLetter.isEmpty || !normalizedFirstLetter.first!.isLetter {
            return "#"  // Use "#" for non-alphabetical starts
        }
        return normalizedFirstLetter
    }

    /// Resolves inline master-text flags (docs/data/README.md "Master-text flags") for safe
    /// display. The pipeline only flag-resolves text it generates into `Verse.displayScripts`;
    /// fields authored directly as `ScriptText` (`Song.titleMain`, `Song.authorDisplay`,
    /// `SongGroup.titles`) may still carry raw flags and must be run through this before display.
    ///
    /// Only `[FLAG_HYPHEN_ALPHA]` (an alphabet-only hyphen joining a compound, not a spoken pause)
    /// actually occurs in the current corpus generation, so it is resolved to a literal hyphen. Any
    /// other `[FLAG_*]` token is stripped as a defensive fallback in case future data introduces one
    /// here without a script-specific rendering rule.
    static func resolveMasterTextFlags(_ text: String) -> String {
        var resolved = text.replacingOccurrences(of: "[FLAG_HYPHEN_ALPHA]", with: "-")
        if resolved.contains("[FLAG_") {
            resolved = resolved.replacingOccurrences(
                of: #"\[FLAG_[A-Z_]+\]"#,
                with: "",
                options: .regularExpression
            )
        }
        return resolved
    }
}