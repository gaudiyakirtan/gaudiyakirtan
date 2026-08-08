import SwiftUI

/// One verse block on the Song Detail screen (docs/screens/song-detail.md v4 / settings.md v5).
///
/// Renders, top to bottom, matching the `song view` Figma frame:
///   1. the **source** line in `options.displayScript` (centered, muted) — omitted when it renders
///      identically to the reading line below (the dedupe rule), or when this verse simply has no
///      such script,
///   2. the **reading** line in `options.transliterationScript` (centered, highlighted) — the
///      "singing" line; also a transliteration, so it can be any script, not only Latin,
///   3. the word-to-word glossary (left-aligned flowing text) when its toggle is on and a matching
///      gloss language exists,
///   4. the full translation (left-aligned) when its toggle is on and a matching language exists.
///
/// Both script lines resolve through `VerseTextResolver.scriptLines`, which returns `nil` — not an
/// IAST substitute — when the chosen script is absent for the verse (settings.md v5: "A missing
/// script is a visible state, not a silent fallback"). Here that means the line is simply omitted;
/// the Settings preview names the absence explicitly instead.
///
/// A pure function of `verse` + `options` (no environment coupling), so a script switch or toggle
/// re-renders every verse just by re-supplying options.
struct VerseView: View {
    let verse: Verse
    var options: VerseDisplayOptions

    /// The reading line (line 2, highlighted), in the reader's transliteration script.
    private var readingLines: [String]? {
        VerseTextResolver.scriptLines(
            verse,
            script: options.transliterationScript,
            romanStandard: options.romanStandard
        )
    }

    /// True when both lines would render the exact same text — same script *and*, for Latin, the
    /// same roman standard (settings.md v5 "The two lines dedupe"; the default is both English/IAST).
    private var sourceMatchesReading: Bool {
        ScriptOptions.renderKey(options.displayScript, romanStandard: options.romanStandard)
            == ScriptOptions.renderKey(options.transliterationScript, romanStandard: options.romanStandard)
    }

    /// The muted source line (line 1). Dropped when it duplicates the reading line — the highlighted
    /// reading is the one that survives, matching web's `VerseListItem`.
    private var sourceLines: [String]? {
        guard !sourceMatchesReading else { return nil }
        return VerseTextResolver.scriptLines(
            verse,
            script: options.displayScript,
            romanStandard: options.romanStandard
        )
    }

    /// The flowing `headword — gloss;` glossary as a single concatenated `Text`, headwords accented.
    /// Static so the Settings live preview renders the glossary through the exact same code path as
    /// the reader (settings.md v5: "The preview reuses `VerseView`'s type ramp so it can't drift").
    static func wordToWordText(_ wtw: WordToWord) -> Text {
        wtw.words.reduce(Text("")) { partial, pair in
            guard pair.count == 2 else { return partial }
            return partial
                + Text(pair[0]).foregroundColor(Color.highlight)
                + Text(" — \(pair[1]); ")
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // 1. Source line — the song's own script, as reference
            if let sourceLines, !sourceLines.isEmpty {
                VStack(spacing: 4) {
                    ForEach(displayedLines(of: sourceLines), id: \.self) { line in
                        Text(line)
                            .font(.system(size: 15))
                            .foregroundColor(Color.neutral)
                            .multilineTextAlignment(.center)
                            .frame(maxWidth: .infinity, alignment: .center)
                    }
                }
            }

            // 2. Reading line — the singing line
            if let readingLines, !readingLines.isEmpty {
                VStack(spacing: 4) {
                    ForEach(displayedLines(of: readingLines), id: \.self) { line in
                        Text(line)
                            // Medium, so the singing line reads as the primary one against the
                            // muted source above it (settings.md v5 Reading table). Android's
                            // `VerseLines` weights it identically.
                            .font(.system(size: 15, weight: .medium))
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
                    Self.wordToWordText(wtw)
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
