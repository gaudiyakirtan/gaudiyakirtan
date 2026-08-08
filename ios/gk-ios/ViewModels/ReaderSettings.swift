import Foundation
import SwiftUI

/// A selectable reading script for the Song Detail screen's script switcher
/// (docs/screens/song-detail.md — "the reader's chosen script"). `code` is the ISO 15924
/// `script_code` used to match `Verse.displayScripts`; `"Latn"` means the IAST romanization.
struct ScriptOption: Identifiable, Hashable {
    let code: String
    let label: String
    var id: String { code }
}

/// A selectable word-to-word gloss language. `code` is the ISO 639-3 `language_code` used to match
/// `Verse.wordToWords` (the gloss script is implied by the language in the canonical corpus:
/// eng→Latn/IAST, hin→Deva, ben→Beng, guj→Gujr).
struct GlossLanguageOption: Identifiable, Hashable {
    let code: String
    let label: String
    var id: String { code }
}

/// A selectable Latin transliteration standard (docs/screens/settings.md `romanStandard`). Only
/// takes effect when the chosen `displayScript` is `Latn`; `code` matches `DisplayScript.standard`
/// in the corpus (`IAST`, `ISO15919`, `BBT_Roman`, `GVP_Roman`).
struct RomanStandardOption: Identifiable, Hashable {
    let code: String
    let label: String
    var id: String { code }
}

/// The app-wide theme (docs/screens/settings.md `theme` / docs/screens/theme.md). The full
/// Gaura/Shyam two-palette repaint is a later dedicated slice; for now each theme maps to a concrete
/// `ColorScheme` so the selector is functional and persists: `gaura` (Gaurāṅga, the fair/golden
/// avatāra) → light, `shyam` (Śyāma, the dark-complexioned Kṛṣṇa) → dark, `system` → follow device.
enum AppTheme: String, CaseIterable, Identifiable {
    case gaura
    case shyam
    case system

    var id: String { rawValue }

    var label: String {
        switch self {
        case .gaura: return "Gaura (Light)"
        case .shyam: return "Shyam (Dark)"
        case .system: return "System"
        }
    }

    /// One-word label for the Settings segmented control, where the parenthetical wouldn't fit
    /// (settings.md v5 "theme as a segmented control, Gaura / Shyam / System in that order"). The
    /// light/dark mapping is spelled out in a hint line beside the control instead.
    var shortLabel: String {
        switch self {
        case .gaura: return "Gaura"
        case .shyam: return "Shyam"
        case .system: return "System"
        }
    }

    /// The `preferredColorScheme` to apply; `nil` means follow the device (placeholder mapping until
    /// the two-palette theme slice replaces this with real Gaura/Shyam colors).
    var colorScheme: ColorScheme? {
        switch self {
        case .gaura: return .light
        case .shyam: return .dark
        case .system: return nil
        }
    }
}

/// The resolved rendering choices a `VerseView` needs. Kept as a plain value type so `VerseView` is
/// a pure function of its inputs (no environment coupling) and easy to verify/reuse.
struct VerseDisplayOptions: Equatable {
    /// ISO 15924 script of the **source** line (line 1, muted). Already resolved through `auto`
    /// against the song's `language_of_origin` — `VerseView` never sees the `auto` sentinel, since
    /// resolving it needs the song, which the verse alone doesn't know
    /// (`ScriptOptions.effectiveDisplayScript`).
    var displayScript: String
    /// ISO 15924 script of the **reading** line (line 2, highlighted). It is a transliteration, so
    /// it can be any script, not only Latin (settings.md v5 / song-detail.md v4). Deduped against
    /// `displayScript` by `ScriptOptions.renderKey`.
    var transliterationScript: String = "Latn"
    /// Latin transliteration standard applied to whichever of the two lines is `Latn`
    /// (settings.md `romanStandard`). Ignored by native scripts.
    var romanStandard: String = "IAST"
    var showWordToWord: Bool
    var wordToWordLanguage: String
    var showTranslation: Bool
    var translationLanguage: String
    /// Hidden-song display-only collapse (docs/screens/song-detail.md "Hidden song" state): when
    /// true, each verse renders only its first reading line, hiding gloss/translation.
    var collapsed: Bool = false
}

/// App-wide reading preferences shared by the Song Detail screen and Settings
/// (docs/screens/song-detail.md "Interactions": toggles "reflect settings … may also be
/// quick-toggled here"). Injected as an `@EnvironmentObject` at the app root and persisted to
/// `UserDefaults` so a chosen script/toggle survives relaunch (offline-first; no network).
final class ReaderSettings: ObservableObject {
    /// Options for the **Display script** picker — the verse's source line. Includes `auto`
    /// ("Default (source language)") at the top, which resolves per song from `language_of_origin`.
    /// Derived from `ScriptOptions` so the option set, order and labels can't drift from the other
    /// two platforms (settings.md v5 "Shared option labels").
    static let availableDisplayScripts: [ScriptOption] =
        ScriptOptions.displayScriptOptions.map { ScriptOption(code: $0, label: ScriptOptions.optionLabel($0)) }

    /// Options for the **Transliteration** picker — the verse's reading line. Same set without
    /// `auto`: a transliteration is always a concrete script.
    static let availableTransliterationScripts: [ScriptOption] =
        ScriptOptions.transliterationScriptOptions.map { ScriptOption(code: $0, label: ScriptOptions.optionLabel($0)) }

    /// Word-to-word gloss languages present in the canonical corpus.
    static let availableGlossLanguages: [GlossLanguageOption] = [
        GlossLanguageOption(code: "eng", label: "English"),
        GlossLanguageOption(code: "hin", label: "Hindi"),
        GlossLanguageOption(code: "ben", label: "Bengali"),
        GlossLanguageOption(code: "guj", label: "Gujarati"),
    ]

    /// Full translation languages present in the canonical corpus (English-only today).
    static let availableTranslationLanguages: [GlossLanguageOption] = [
        GlossLanguageOption(code: "eng", label: "English"),
    ]

    /// Latin transliteration standards (settings.md `romanStandard`). Labels come from
    /// `ScriptOptions` — "IAST" / "ISO 15919" / "BBT Roman" / "GVP Roman", the strings all three
    /// platforms show.
    static let availableRomanStandards: [RomanStandardOption] =
        ScriptOptions.romanStandardOptions.map { RomanStandardOption(code: $0, label: ScriptOptions.romanStandardName($0)) }

    /// The script that list/browse titles, song headers and player credits render in
    /// (settings.md `listLanguage` — "the default language the whole app is shown in"). A concrete
    /// script, so the same option set as the Transliteration picker (no `auto`).
    static var availableListLanguages: [ScriptOption] { availableTransliterationScripts }

    /// Script of the verse's **source** line (settings.md `displayScript`). May be the `auto`
    /// sentinel — resolve it against a song via `effectiveDisplayScript(for:)` before use.
    @Published var displayScript: String { didSet { defaults.set(displayScript, forKey: Keys.displayScript) } }
    /// Script of the verse's **reading** line (settings.md `transliterationScript`). Always concrete.
    @Published var transliterationScript: String { didSet { defaults.set(transliterationScript, forKey: Keys.transliterationScript) } }
    @Published var romanStandard: String { didSet { defaults.set(romanStandard, forKey: Keys.romanStandard) } }
    @Published var showWordToWord: Bool { didSet { defaults.set(showWordToWord, forKey: Keys.showWordToWord) } }
    @Published var wordToWordLanguage: String { didSet { defaults.set(wordToWordLanguage, forKey: Keys.wordToWordLanguage) } }
    @Published var showTranslation: Bool { didSet { defaults.set(showTranslation, forKey: Keys.showTranslation) } }
    @Published var translationLanguage: String { didSet { defaults.set(translationLanguage, forKey: Keys.translationLanguage) } }
    @Published var listLanguage: String { didSet { defaults.set(listLanguage, forKey: Keys.listLanguage) } }
    @Published var theme: AppTheme { didSet { defaults.set(theme.rawValue, forKey: Keys.theme) } }

    private let defaults: UserDefaults

    private enum Keys {
        // `reader.displayScript` deliberately replaces the old `reader.scriptCode` key rather than
        // reusing it: the setting's meaning and default both changed in settings.md v5 (it is now the
        // *source* line and defaults to `auto`), so a value persisted under the old key would pin
        // returning readers to a pre-v5 concrete script and they'd never see the new default.
        static let displayScript = "reader.displayScript"
        static let transliterationScript = "reader.transliterationScript"
        static let romanStandard = "reader.romanStandard"
        static let showWordToWord = "reader.showWordToWord"
        static let wordToWordLanguage = "reader.wordToWordLanguage"
        static let showTranslation = "reader.showTranslation"
        static let translationLanguage = "reader.translationLanguage"
        static let listLanguage = "reader.listLanguage"
        static let theme = "reader.theme"
    }

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        // Defaults per settings.md v5: source line follows each song's own language (`auto`), the
        // reading line is English (Roman / Latin) in IAST, English word-to-word + English translation
        // (both shown), Latin list titles, and system theme.
        self.displayScript = defaults.string(forKey: Keys.displayScript) ?? ScriptOptions.auto
        self.transliterationScript = defaults.string(forKey: Keys.transliterationScript) ?? "Latn"
        self.romanStandard = defaults.string(forKey: Keys.romanStandard) ?? "IAST"
        self.showWordToWord = defaults.object(forKey: Keys.showWordToWord) as? Bool ?? true
        self.wordToWordLanguage = defaults.string(forKey: Keys.wordToWordLanguage) ?? "eng"
        self.showTranslation = defaults.object(forKey: Keys.showTranslation) as? Bool ?? true
        self.translationLanguage = defaults.string(forKey: Keys.translationLanguage) ?? "eng"
        self.listLanguage = defaults.string(forKey: Keys.listLanguage) ?? "Latn"
        self.theme = (defaults.string(forKey: Keys.theme)).flatMap(AppTheme.init(rawValue:)) ?? .system
    }

    /// The current preferences as the value type `VerseView` consumes, with `displayScript`'s `auto`
    /// already resolved against the song being read (`ScriptOptions.effectiveDisplayScript`) — a
    /// `Verse` alone can't do it, since `language_of_origin` lives on the `Song`.
    /// `collapsed` is a per-screen display state, not a persisted preference, so callers layer it on.
    func verseOptions(languageOfOrigin: String, collapsed: Bool = false) -> VerseDisplayOptions {
        VerseDisplayOptions(
            displayScript: ScriptOptions.effectiveDisplayScript(displayScript, languageOfOrigin: languageOfOrigin),
            transliterationScript: transliterationScript,
            romanStandard: romanStandard,
            showWordToWord: showWordToWord,
            wordToWordLanguage: wordToWordLanguage,
            showTranslation: showTranslation,
            translationLanguage: translationLanguage,
            collapsed: collapsed
        )
    }

    /// The concrete source-line script for one song — `displayScript` with `auto` resolved against
    /// that song's `language_of_origin`.
    func effectiveDisplayScript(for song: Song) -> String {
        ScriptOptions.effectiveDisplayScript(displayScript, languageOfOrigin: song.languageOfOrigin)
    }

    /// Picker label for the current source-line script (the "Aa" menu pill on Song Detail).
    var displayScriptLabel: String {
        ScriptOptions.optionLabel(displayScript)
    }

    /// Picker label for the current reading-line script.
    var transliterationScriptLabel: String {
        ScriptOptions.optionLabel(transliterationScript)
    }
}
