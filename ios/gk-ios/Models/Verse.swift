import Foundation

/// Canonical `Verse` entity — see docs/data/verse.md (spec v1).
///
/// One ordered stanza of a `Song`. Holds the master text (`sourceTextMaster`, ISO 15919 Latin with
/// inline `[FLAG_*]` markers — never rendered directly, see docs/data/README.md), every generated
/// script rendering (`displayScripts`), the optional word-to-word glossary, and optional full
/// translations.
///
/// `wordToWords` and `translations` are spec-optional; decoded here as non-optional empty arrays
/// (absence and emptiness mean the same thing). Only ~22% of verses in the shipped corpus carry
/// either, so callers must always handle the empty case.
struct Verse: Codable, Identifiable, Hashable {
    let verseNumber: Int
    let sourceTextMaster: [String]
    let displayScripts: [DisplayScript]
    let wordToWords: [WordToWord]
    let translations: [Translation]

    enum CodingKeys: String, CodingKey {
        case verseNumber = "verse_number"
        case sourceTextMaster = "source_text_master"
        case displayScripts = "display_scripts"
        case wordToWords = "word_to_words"
        case translations
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        verseNumber = try c.decode(Int.self, forKey: .verseNumber)
        sourceTextMaster = try c.decode([String].self, forKey: .sourceTextMaster)
        displayScripts = try c.decode([DisplayScript].self, forKey: .displayScripts)
        wordToWords = try c.decodeIfPresent([WordToWord].self, forKey: .wordToWords) ?? []
        translations = try c.decodeIfPresent([Translation].self, forKey: .translations) ?? []
    }

    /// `verse_number` is unique within a single song's `verses` array in the shipped corpus (never
    /// repeats), so it is a stable `Identifiable` id for `ForEach` within one song's verse list.
    /// The spec itself only guarantees identity-by-position across the *whole* corpus (verse_number
    /// may repeat/skip across different songs) — do not use this id across songs.
    var id: Int { verseNumber }

    // MARK: - Script resolution (docs/screens/song-detail.md data bindings)

    /// The IAST romanization — the reader's "singing" line, always shown on the detail screen.
    /// Falls back to any Latin rendering if IAST isn't present.
    var iastScript: DisplayScript? {
        displayScripts.first(where: { $0.scriptCode == "Latn" && $0.standard == "IAST" })
            ?? displayScripts.first(where: { $0.scriptCode == "Latn" })
    }

    /// The Latin rendering in a specific transliteration `standard` (settings.md `romanStandard`;
    /// the corpus ships `IAST`, `ISO15919`, `BBT_Roman`, `GVP_Roman` per verse). Falls back to IAST /
    /// any Latin when the requested standard is absent.
    func romanScript(standard: String) -> DisplayScript? {
        displayScripts.first(where: { $0.scriptCode == "Latn" && $0.standard == standard })
            ?? iastScript
    }

    /// The rendering for the reader's chosen `scriptCode`, with the spec's fallback: if the chosen
    /// script isn't available for this verse, fall back to IAST (song-detail.md: "fallback: Latn/IAST
    /// if the chosen script is unavailable"). `"Latn"` resolves to the roman line in the requested
    /// `standard` (settings.md `romanStandard`); native scripts ignore `standard`.
    func displayScript(for code: String, standard: String = "IAST") -> DisplayScript? {
        if code == "Latn" { return romanScript(standard: standard) }
        return displayScripts.first(where: { $0.scriptCode == code }) ?? iastScript
    }

    /// The word-to-word glossary for a gloss language, or `nil` if this verse has none in that
    /// language (song-detail.md: "matched by language + script"; in the canonical corpus the script
    /// is implied by the language). Omit gracefully when `nil` — never render an empty block.
    func wordToWord(language: String) -> WordToWord? {
        wordToWords.first(where: { $0.languageCode == language })
    }

    /// The full translation for a language, or `nil` if absent (song-detail.md: omit the toggle
    /// target gracefully; never show `NULL`/empty per translation.md).
    func translation(language: String) -> Translation? {
        translations.first(where: { $0.languageCode == language })
    }
}

/// The verse's lines rendered in one script (verse.md "Value objects owned by Verse").
/// Already flag-resolved by the pipeline — safe to render directly, unlike `sourceTextMaster`.
struct DisplayScript: Codable, Hashable {
    let scriptCode: String
    /// Only present when `scriptCode == "Latn"`. See `ScriptText.standard` for why this is a plain
    /// `String?` rather than a closed enum (the corpus emits `IAST`, `ISO15919`, `BBT_Roman`,
    /// `GVP_Roman`).
    let standard: String?
    let text: [String]

    enum CodingKeys: String, CodingKey {
        case scriptCode = "script_code"
        case standard
        case text
    }
}

/// The ordered per-word glossary for one language rendered in one script (verse.md).
struct WordToWord: Codable, Hashable {
    let languageCode: String
    let scriptCode: String
    let standard: String?
    /// Ordered `[headword, gloss]` pairs; order is meaningful and must not be sorted (verse.md
    /// invariants).
    let words: [[String]]

    enum CodingKeys: String, CodingKey {
        case languageCode = "language_code"
        case scriptCode = "script_code"
        case standard
        case words
    }
}

/// The full-meaning rendering of a verse into one human language (docs/data/translation.md, spec
/// v1).
struct Translation: Codable, Hashable {
    let languageCode: String
    let text: [String]
    /// `enum(human, generated)`. Absent means "human" per the spec's default.
    let source: String?

    enum CodingKeys: String, CodingKey {
        case languageCode = "language_code"
        case text
        case source
    }

    var isGenerated: Bool { source == "generated" }

    /// `text` joined into a single display string (the lines are display paragraphs, not
    /// alignment-significant like verse/word-to-word lines).
    var joinedText: String { text.joined(separator: "\n") }
}
