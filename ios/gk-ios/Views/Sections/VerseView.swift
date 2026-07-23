import SwiftUI

/// One verse block on the Song Detail screen (docs/screens/song-detail.md).
///
/// Renders, top to bottom, matching the `song view` Figma frame:
///   1. the reader's chosen native script (centered, muted) — omitted when the chosen script *is*
///      the roman line (to avoid duplication),
///   2. the IAST romanization (centered, highlighted) — the "singing" line, always shown,
///   3. the word-to-word glossary (left-aligned flowing text) when its toggle is on and a matching
///      gloss language exists,
///   4. the full translation (left-aligned) when its toggle is on and a matching language exists.
///
/// A pure function of `verse` + `options` (no environment coupling), so script switching and toggles
/// re-render every verse just by re-supplying options. Missing pieces are omitted, never rendered
/// empty (song-detail.md "Missing translation/script").
struct VerseView: View {
    let verse: Verse
    var options: VerseDisplayOptions

    /// The chosen native/primary script (with IAST fallback baked in by `Verse.displayScript`). When
    /// the chosen script is `Latn`, this is the roman line in the reader's `romanStandard`.
    private var primaryScript: DisplayScript? {
        verse.displayScript(for: options.scriptCode, standard: options.romanStandard)
    }
    /// True when the chosen script already *is* the roman line, so we don't print it twice.
    private var primaryIsRoman: Bool { primaryScript?.scriptCode == "Latn" }
    /// The romanization/singing line shown beneath a native script. When the reader has chosen Latn
    /// as their display script, this *is* the primary line (honoring `romanStandard`); for a native
    /// script the companion line stays IAST (settings.md ties `romanStandard` to `displayScript = Latn`).
    private var romanScript: DisplayScript? { primaryIsRoman ? primaryScript : verse.iastScript }

    private func combinedWTWText(_ wtw: WordToWord) -> Text {
        wtw.words.reduce(Text("")) { partial, pair in
            guard pair.count == 2 else { return partial }
            return partial
                + Text(pair[0]).foregroundColor(Color.highlight)
                + Text(" — \(pair[1]); ")
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // 1. Chosen native script (skipped when it's the roman line itself)
            if !primaryIsRoman, let primaryScript, !primaryScript.text.isEmpty {
                VStack(spacing: 4) {
                    ForEach(displayedLines(of: primaryScript.text), id: \.self) { line in
                        Text(line)
                            .font(.system(size: 15))
                            .foregroundColor(Color.neutral)
                            .multilineTextAlignment(.center)
                            .frame(maxWidth: .infinity, alignment: .center)
                    }
                }
            }

            // 2. IAST romanization — the reading/singing line
            if let romanScript, !romanScript.text.isEmpty {
                VStack(spacing: 4) {
                    ForEach(displayedLines(of: romanScript.text), id: \.self) { line in
                        Text(line)
                            .font(.system(size: 15))
                            .foregroundColor(Color.highlight)
                            .multilineTextAlignment(.center)
                            .frame(maxWidth: .infinity, alignment: .center)
                    }
                }
            }

            // Collapsed (hidden-song) state stops here: first line only, no gloss/translation.
            if !options.collapsed {
                // 3. Word-to-word glossary
                if options.showWordToWord,
                   let wtw = verse.wordToWord(language: options.wordToWordLanguage),
                   !wtw.words.isEmpty {
                    combinedWTWText(wtw)
                        .font(.system(size: 14))
                        .frame(maxWidth: .infinity, alignment: .leading)
                }

                // 4. Full translation
                if options.showTranslation,
                   let translation = verse.translation(language: options.translationLanguage),
                   !translation.text.isEmpty {
                    Text(translation.joinedText)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(Color("primaryText"))
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
        }
    }

    /// When collapsed (hidden-song state), show only the first line of a script block; otherwise all
    /// lines. Line counts across scripts are equal by the verse.md invariant, so the master↔script
    /// correspondence is preserved either way.
    private func displayedLines(of lines: [String]) -> [String] {
        options.collapsed ? Array(lines.prefix(1)) : lines
    }
}
