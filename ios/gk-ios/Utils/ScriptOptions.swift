import Foundation

/// Script/roman-standard option metadata shared by Settings and the Song Detail reader
/// (docs/screens/settings.md v5 — "the resolvers are the shared contract").
///
/// Deliberately a pure-Foundation namespace with **no SwiftUI import**: these are the load-bearing
/// pickers behind both the live Settings preview and the reader itself, so they are unit-tested
/// directly (see `gk-iosTests/SettingsResolverTests.swift`).
///
/// The same three functions exist on every platform under the same names, so the apps read the same:
/// web `nativeScriptFor` / `effectiveDisplayScript` / `scriptOptionLabel` / `scriptRenderKey`
/// (`web/src/services/scripts.ts`, plus `scriptRenderKey` in `web/src/services/textDisplay.ts`),
/// Android `ScriptOptions.*`.
enum ScriptOptions {

    // MARK: - Option lists

    /// Sentinel for the Display-script picker meaning "use each song's own source-language script",
    /// resolved per song via `nativeScript(for:)`. Labelled "Default (source language)".
    static let auto = "auto"

    /// Scripts offered wherever a concrete script must be chosen — the Transliteration picker and
    /// the list/display-language picker. Ordered exactly like web's `DISPLAY_SCRIPT_OPTIONS`
    /// (`web/src/services/settingsOptions.ts`) so the three settings screens list the same options in
    /// the same order. Every verse in the shipped corpus carries all ten, so the list is fixed rather
    /// than per-song.
    static let transliterationScriptOptions: [String] = [
        "Beng",
        "Latn",
        "Deva",
        "Telu",
        "Knda",
        "Taml",
        "Mlym",
        "Gujr",
        "Orya",
        "Cyrl",
    ]

    /// The Display-script picker additionally offers `auto` ("Default (source language)") at the top.
    static let displayScriptOptions: [String] = [auto] + transliterationScriptOptions

    /// Latin transliteration standards the corpus ships for verse `display_scripts` — plus
    /// `ISO15919`, which has no `display_scripts` entry anywhere and is rendered from
    /// `source_text_master` instead (see `VerseTextResolver`).
    static let romanStandardOptions: [String] = ["IAST", "ISO15919", "BBT_Roman", "GVP_Roman"]

    // MARK: - Labels

    /// Human-readable name per ISO 15924 script code (docs/screens/settings.md v5 "Shared option
    /// labels"). `Guru` is listed for parity with web even though the corpus ships no Gurmukhi.
    static let scriptNames: [String: String] = [
        "Latn": "Roman (IAST)",
        "Beng": "Bengali",
        "Deva": "Devanagari",
        "Telu": "Telugu",
        "Knda": "Kannada",
        "Taml": "Tamil",
        "Mlym": "Malayalam",
        "Gujr": "Gujarati",
        "Guru": "Gurmukhi",
        "Orya": "Odia",
        "Cyrl": "Cyrillic",
    ]

    /// The script's own name, falling back to the raw code so an unknown script never renders blank.
    static func scriptName(_ scriptCode: String) -> String {
        scriptNames[scriptCode] ?? scriptCode
    }

    /// Option label for a script picker. `auto` reads as "Default (source language)"; Latin is a
    /// romanization with a further standard beside it, so it reads "English (Roman / Latin)" rather
    /// than "Roman (IAST)". These exact strings are shared by all three platforms.
    static func optionLabel(_ scriptCode: String) -> String {
        if scriptCode == auto { return "Default (source language)" }
        return scriptCode == "Latn" ? "English (Roman / Latin)" : scriptName(scriptCode)
    }

    /// Label for a `romanStandard` code (settings.md v5: `IAST` / `ISO 15919` / `BBT Roman` /
    /// `GVP Roman`).
    static func romanStandardName(_ standard: String) -> String {
        switch standard {
        case "IAST": return "IAST"
        case "ISO15919": return "ISO 15919"
        case "BBT_Roman": return "BBT Roman"
        case "GVP_Roman": return "GVP Roman"
        default: return standard
        }
    }

    // MARK: - Resolution

    /// The script a reader treats as a song's "native" rendering, derived from its
    /// `language_of_origin` (settings.md v5: `ben`/`asa` → `Beng`, `san`/`hin` → `Deva`, `ori` →
    /// `Orya`, `eng` → `Latn`, else `Beng`).
    static func nativeScript(for languageOfOrigin: String) -> String {
        switch languageOfOrigin {
        case "ben", "asa": return "Beng" // Bengali; Assamese uses the Bengali–Assamese script
        case "san", "hin": return "Deva"
        case "ori": return "Orya"
        case "eng": return "Latn"
        default: return "Beng"
        }
    }

    /// Resolves a possibly-`auto` display script to a concrete script for one song's origin
    /// language. Non-`auto` values pass through unchanged.
    static func effectiveDisplayScript(_ script: String, languageOfOrigin: String) -> String {
        script == auto ? nativeScript(for: languageOfOrigin) : script
    }

    /// A stable key for a (script, romanStandard) pairing, so the source and transliteration lines
    /// can be de-duplicated when they resolve to the exact same rendering (settings.md v5 "The two
    /// lines dedupe"). Only Latin varies by standard.
    static func renderKey(_ scriptCode: String, romanStandard: String) -> String {
        scriptCode == "Latn" ? "Latn:\(romanStandard)" : scriptCode
    }
}
