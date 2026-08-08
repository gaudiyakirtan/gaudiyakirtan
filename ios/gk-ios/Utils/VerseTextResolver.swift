import Foundation

/// Resolves one verse's lines in an arbitrary script (docs/screens/settings.md v5 — the source and
/// transliteration lines can each be *any* script).
///
/// **A missing script is a visible state, not a silent fallback.** `scriptLines` returns `nil` when
/// the chosen script has no `display_scripts` entry for the verse, so the caller can say
/// "This script isn't available for this verse." rather than quietly printing IAST instead. That is
/// the difference between this and the older `Verse.displayScript(for:standard:)`, which folds
/// absence into an IAST fallback and therefore cannot express the unavailable state.
///
/// Pure Foundation (no SwiftUI) so it is unit-tested directly — see
/// `gk-iosTests/SettingsResolverTests.swift`. Mirrors web's `resolveScriptLines` / `resolveRomanLines`
/// (`web/src/services/textDisplay.ts`) and Android's `Verse.scriptLinesOrNull`.
enum VerseTextResolver {

    /// The verse's lines rendered in `script`, or `nil` when this verse carries no such rendering.
    ///
    /// - `Latn` resolves through `romanLines` (which honors `romanStandard`, including the
    ///   corpus-less `ISO15919`).
    /// - Every other script is an **exact** `display_scripts` match — no fallback.
    static func scriptLines(_ verse: Verse, script: String, romanStandard: String) -> [String]? {
        if script == "Latn" { return romanLines(verse, romanStandard: romanStandard) }
        guard let match = verse.displayScripts.first(where: { $0.scriptCode == script }),
              !match.text.isEmpty else { return nil }
        return match.text
    }

    /// The Latin lines in the reader's roman scheme.
    ///
    /// The corpus ships `IAST` / `BBT_Roman` / `GVP_Roman` as `Latn` `display_scripts`. `ISO15919`
    /// has **no** `display_scripts` entry anywhere in the corpus — it *is* the master text, so it is
    /// rendered from `source_text_master` with the inline `[FLAG_*]` markers resolved
    /// (`StringUtils.resolveMasterTextFlags`; docs/data/README.md "Master-text flags").
    ///
    /// For the shipped standards: exact match on `standard`, else IAST, else any `Latn`.
    static func romanLines(_ verse: Verse, romanStandard: String) -> [String]? {
        if romanStandard == "ISO15919" {
            guard !verse.sourceTextMaster.isEmpty else { return nil }
            return verse.sourceTextMaster.map(StringUtils.resolveMasterTextFlags)
        }

        let latin = verse.displayScripts.filter { $0.scriptCode == "Latn" }
        let match = latin.first(where: { $0.standard == romanStandard })
            ?? latin.first(where: { $0.standard == "IAST" })
            ?? latin.first
        guard let text = match?.text, !text.isEmpty else { return nil }
        return text
    }
}
