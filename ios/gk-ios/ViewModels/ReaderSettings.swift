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
    /// ISO 15924 script to show as the primary/native line; `"Latn"` = the roman line only.
    var scriptCode: String
    /// Latin transliteration standard to use for the roman line when `scriptCode == "Latn"`
    /// (settings.md `romanStandard`). Ignored for native scripts, whose companion roman line stays
    /// IAST.
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
    /// Reading scripts offered by the switcher. Every song in the canonical corpus ships all of
    /// these renderings (verified across the 703-song set), so the list is fixed rather than
    /// per-song. `"Latn"` maps to the IAST romanization.
    static let availableScripts: [ScriptOption] = [
        ScriptOption(code: "Beng", label: "Bengali"),
        ScriptOption(code: "Deva", label: "Devanāgarī"),
        ScriptOption(code: "Latn", label: "Roman (IAST)"),
        ScriptOption(code: "Gujr", label: "Gujarati"),
        ScriptOption(code: "Knda", label: "Kannada"),
        ScriptOption(code: "Mlym", label: "Malayalam"),
        ScriptOption(code: "Orya", label: "Odia"),
        ScriptOption(code: "Taml", label: "Tamil"),
        ScriptOption(code: "Telu", label: "Telugu"),
        ScriptOption(code: "Cyrl", label: "Cyrillic"),
    ]

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

    /// Latin transliteration standards the corpus ships for verse `display_scripts`
    /// (settings.md `romanStandard`).
    static let availableRomanStandards: [RomanStandardOption] = [
        RomanStandardOption(code: "IAST", label: "IAST"),
        RomanStandardOption(code: "ISO15919", label: "ISO 15919"),
        RomanStandardOption(code: "BBT_Roman", label: "BBT"),
        RomanStandardOption(code: "GVP_Roman", label: "GVP"),
    ]

    /// The script that list/browse titles render in (settings.md `listLanguage`). Same value space as
    /// `availableScripts`; the reader picks it via the "List Language" setting the hint song points to.
    static var availableListLanguages: [ScriptOption] { availableScripts }

    @Published var scriptCode: String { didSet { defaults.set(scriptCode, forKey: Keys.scriptCode) } }
    @Published var romanStandard: String { didSet { defaults.set(romanStandard, forKey: Keys.romanStandard) } }
    @Published var showWordToWord: Bool { didSet { defaults.set(showWordToWord, forKey: Keys.showWordToWord) } }
    @Published var wordToWordLanguage: String { didSet { defaults.set(wordToWordLanguage, forKey: Keys.wordToWordLanguage) } }
    @Published var showTranslation: Bool { didSet { defaults.set(showTranslation, forKey: Keys.showTranslation) } }
    @Published var translationLanguage: String { didSet { defaults.set(translationLanguage, forKey: Keys.translationLanguage) } }
    @Published var listLanguage: String { didSet { defaults.set(listLanguage, forKey: Keys.listLanguage) } }
    @Published var theme: AppTheme { didSet { defaults.set(theme.rawValue, forKey: Keys.theme) } }

    private let defaults: UserDefaults

    private enum Keys {
        static let scriptCode = "reader.scriptCode"
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
        // Defaults per settings.md: romanized/IAST display script (Latn — matches the mock and the
        // Latin list titles), IAST roman standard, English word-to-word + English translation (all
        // shown), Latin list titles, and system theme.
        self.scriptCode = defaults.string(forKey: Keys.scriptCode) ?? "Latn"
        self.romanStandard = defaults.string(forKey: Keys.romanStandard) ?? "IAST"
        self.showWordToWord = defaults.object(forKey: Keys.showWordToWord) as? Bool ?? true
        self.wordToWordLanguage = defaults.string(forKey: Keys.wordToWordLanguage) ?? "eng"
        self.showTranslation = defaults.object(forKey: Keys.showTranslation) as? Bool ?? true
        self.translationLanguage = defaults.string(forKey: Keys.translationLanguage) ?? "eng"
        self.listLanguage = defaults.string(forKey: Keys.listLanguage) ?? "Latn"
        self.theme = (defaults.string(forKey: Keys.theme)).flatMap(AppTheme.init(rawValue:)) ?? .system
    }

    /// The current preferences as the value type `VerseView` consumes. `collapsed` is a per-screen
    /// display state, not a persisted preference, so callers layer it on.
    func verseOptions(collapsed: Bool = false) -> VerseDisplayOptions {
        VerseDisplayOptions(
            scriptCode: scriptCode,
            romanStandard: romanStandard,
            showWordToWord: showWordToWord,
            wordToWordLanguage: wordToWordLanguage,
            showTranslation: showTranslation,
            translationLanguage: translationLanguage,
            collapsed: collapsed
        )
    }

    var currentScriptLabel: String {
        Self.availableScripts.first(where: { $0.code == scriptCode })?.label ?? scriptCode
    }
}
