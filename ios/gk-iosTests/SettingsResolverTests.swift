//
//  SettingsResolverTests.swift
//  gk-iosTests
//
//  Guards the shared resolver contract in docs/screens/settings.md **v5** ("Per-platform notes" —
//  the same five functions exist on web/iOS/Android under matching names, and are the load-bearing
//  logic behind both the Settings live preview and the song-detail reader):
//
//      resolve a script's lines, nil if absent  ->  VerseTextResolver.scriptLines
//      resolve `auto` against a song            ->  ScriptOptions.effectiveDisplayScript
//      native script for a language             ->  ScriptOptions.nativeScript(for:)
//      picker label                             ->  ScriptOptions.optionLabel
//      dedupe key for the two lines             ->  ScriptOptions.renderKey
//
//  Plus `ReaderSettings` persistence (settings.md "device-local, persisted, offline").
//
//  Runs against the real bundled corpus — the sample verse is the N9 stanza all three platforms
//  preview, so the expected strings below were read straight out of gk-ios/Resources/songs/N9.json
//  rather than invented.

import XCTest
@testable import gk_ios

final class SettingsResolverTests: XCTestCase {

    // MARK: - `auto` resolution (settings.md v5 `displayScript` = "Default (source language)")

    func testNativeScriptPerLanguageOfOrigin() {
        XCTAssertEqual(ScriptOptions.nativeScript(for: "ben"), "Beng")
        XCTAssertEqual(ScriptOptions.nativeScript(for: "asa"), "Beng") // Bengali–Assamese script
        XCTAssertEqual(ScriptOptions.nativeScript(for: "san"), "Deva")
        XCTAssertEqual(ScriptOptions.nativeScript(for: "hin"), "Deva")
        XCTAssertEqual(ScriptOptions.nativeScript(for: "ori"), "Orya")
        XCTAssertEqual(ScriptOptions.nativeScript(for: "eng"), "Latn")
        // Anything unmapped falls back to Bengali, the corpus's dominant source script.
        XCTAssertEqual(ScriptOptions.nativeScript(for: "zzz"), "Beng")
    }

    func testAutoResolvesPerSongAndConcreteScriptsPassThrough() {
        XCTAssertEqual(ScriptOptions.effectiveDisplayScript(ScriptOptions.auto, languageOfOrigin: "ben"), "Beng")
        XCTAssertEqual(ScriptOptions.effectiveDisplayScript(ScriptOptions.auto, languageOfOrigin: "san"), "Deva")
        XCTAssertEqual(ScriptOptions.effectiveDisplayScript(ScriptOptions.auto, languageOfOrigin: "eng"), "Latn")
        // A concrete choice is *not* re-derived from the song — the reader asked for that script.
        XCTAssertEqual(ScriptOptions.effectiveDisplayScript("Telu", languageOfOrigin: "ben"), "Telu")
        XCTAssertEqual(ScriptOptions.effectiveDisplayScript("Latn", languageOfOrigin: "san"), "Latn")
    }

    func testAutoResolvesAgainstTheRealSampleSong() throws {
        let sample = try XCTUnwrap(SettingsSample.load(), "N9 + a qualifying verse must be bundled")
        XCTAssertEqual(sample.song.languageOfOrigin, "ben")
        let settings = ReaderSettings(defaults: try scratchDefaults())
        XCTAssertEqual(settings.displayScript, ScriptOptions.auto)
        XCTAssertEqual(settings.effectiveDisplayScript(for: sample.song), "Beng")
    }

    // MARK: - Option labels (settings.md v5 "Shared option labels" — identical on all 3 platforms)

    func testOptionLabels() {
        XCTAssertEqual(ScriptOptions.optionLabel(ScriptOptions.auto), "Default (source language)")
        XCTAssertEqual(ScriptOptions.optionLabel("Latn"), "English (Roman / Latin)")
        XCTAssertEqual(ScriptOptions.optionLabel("Beng"), "Bengali")
        XCTAssertEqual(ScriptOptions.optionLabel("Deva"), "Devanagari")
        XCTAssertEqual(ScriptOptions.optionLabel("Telu"), "Telugu")
        XCTAssertEqual(ScriptOptions.optionLabel("Knda"), "Kannada")
        XCTAssertEqual(ScriptOptions.optionLabel("Taml"), "Tamil")
        XCTAssertEqual(ScriptOptions.optionLabel("Mlym"), "Malayalam")
        XCTAssertEqual(ScriptOptions.optionLabel("Gujr"), "Gujarati")
        XCTAssertEqual(ScriptOptions.optionLabel("Orya"), "Odia")
        XCTAssertEqual(ScriptOptions.optionLabel("Cyrl"), "Cyrillic")
        // Unknown codes degrade to the code itself rather than rendering blank.
        XCTAssertEqual(ScriptOptions.optionLabel("Xxxx"), "Xxxx")
    }

    func testRomanStandardLabelsMatchTheSharedStrings() {
        XCTAssertEqual(ScriptOptions.romanStandardName("IAST"), "IAST")
        XCTAssertEqual(ScriptOptions.romanStandardName("ISO15919"), "ISO 15919")
        XCTAssertEqual(ScriptOptions.romanStandardName("BBT_Roman"), "BBT Roman")
        XCTAssertEqual(ScriptOptions.romanStandardName("GVP_Roman"), "GVP Roman")
    }

    func testOptionListsAreOrderedAndOnlyDisplayOffersAuto() {
        XCTAssertEqual(
            ScriptOptions.transliterationScriptOptions,
            ["Beng", "Latn", "Deva", "Telu", "Knda", "Taml", "Mlym", "Gujr", "Orya", "Cyrl"]
        )
        XCTAssertEqual(ScriptOptions.displayScriptOptions.first, ScriptOptions.auto)
        XCTAssertEqual(Array(ScriptOptions.displayScriptOptions.dropFirst()), ScriptOptions.transliterationScriptOptions)
        XCTAssertFalse(ScriptOptions.transliterationScriptOptions.contains(ScriptOptions.auto))
    }

    // MARK: - Dedupe key (settings.md v5 "The two lines dedupe")

    func testRenderKeyCollapsesIdenticalRenderingsAndSeparatesRomanStandards() {
        // The shipped default — source `auto`→Beng on a Bengali song vs. a Latn reading — is *not*
        // a duplicate, so both lines show.
        XCTAssertNotEqual(
            ScriptOptions.renderKey("Beng", romanStandard: "IAST"),
            ScriptOptions.renderKey("Latn", romanStandard: "IAST")
        )
        // Same script, same standard -> one line.
        XCTAssertEqual(
            ScriptOptions.renderKey("Latn", romanStandard: "IAST"),
            ScriptOptions.renderKey("Latn", romanStandard: "IAST")
        )
        // Same script, *different* roman standard -> genuinely two different renderings.
        XCTAssertNotEqual(
            ScriptOptions.renderKey("Latn", romanStandard: "IAST"),
            ScriptOptions.renderKey("Latn", romanStandard: "BBT_Roman")
        )
        // Only Latin varies by standard; a native script's key ignores it entirely.
        XCTAssertEqual(
            ScriptOptions.renderKey("Beng", romanStandard: "IAST"),
            ScriptOptions.renderKey("Beng", romanStandard: "GVP_Roman")
        )
        XCTAssertEqual(ScriptOptions.renderKey("Latn", romanStandard: "IAST"), "Latn:IAST")
        XCTAssertEqual(ScriptOptions.renderKey("Beng", romanStandard: "IAST"), "Beng")
    }

    // MARK: - VerseTextResolver (settings.md v5: "A missing script is a visible state, not a silent
    // fallback")

    func testAbsentScriptResolvesToNilRatherThanFallingBackToIAST() throws {
        let verse = try sampleVerse()
        // The corpus ships no Gurmukhi rendering anywhere. The old
        // `Verse.displayScript(for:)` would hand back IAST here; the resolver must not.
        XCTAssertNil(VerseTextResolver.scriptLines(verse, script: "Guru", romanStandard: "IAST"))
        XCTAssertNil(VerseTextResolver.scriptLines(verse, script: "Hebr", romanStandard: "IAST"))
        // ...and the fallback it must *not* be silently returning:
        XCTAssertNotNil(verse.displayScript(for: "Guru"))
    }

    func testPresentScriptResolvesExactly() throws {
        let verse = try sampleVerse()
        let bengali = try XCTUnwrap(VerseTextResolver.scriptLines(verse, script: "Beng", romanStandard: "IAST"))
        XCTAssertEqual(bengali.first, "অক্রোধ পরমানন্দ নিত্যানন্দরায়")
        let cyrillic = try XCTUnwrap(VerseTextResolver.scriptLines(verse, script: "Cyrl", romanStandard: "IAST"))
        XCTAssertEqual(cyrillic.count, bengali.count, "line counts are equal across scripts per verse.md")
    }

    func testSampleVerseIASTFirstLine() throws {
        let verse = try sampleVerse()
        let iast = try XCTUnwrap(VerseTextResolver.scriptLines(verse, script: "Latn", romanStandard: "IAST"))
        XCTAssertEqual(iast.first, "akrodha paramānanda nityānanda-rāya")
        XCTAssertEqual(iast.count, 2)
    }

    func testRomanStandardSelectsTheMatchingLatinRendering() throws {
        let verse = try sampleVerse()
        let bbt = try XCTUnwrap(VerseTextResolver.scriptLines(verse, script: "Latn", romanStandard: "BBT_Roman"))
        // BBT normalizes the Bengali ḓ that IAST/GVP keep — the second line is where they diverge.
        XCTAssertEqual(bbt.last, "abhimāna-śūnya nitāi nagare beḍāya 1")
        let iast = try XCTUnwrap(VerseTextResolver.scriptLines(verse, script: "Latn", romanStandard: "IAST"))
        XCTAssertNotEqual(bbt.last, iast.last)
        // An unshipped Latin standard falls back to IAST rather than vanishing — Latin is always
        // available, which is why only *non*-Latin absence is a visible state.
        let unknown = try XCTUnwrap(VerseTextResolver.scriptLines(verse, script: "Latn", romanStandard: "Xx_Roman"))
        XCTAssertEqual(unknown, iast)
    }

    func testISO15919IsRenderedFromTheMasterTextWithFlagsResolved() throws {
        let verse = try sampleVerse()
        // ISO15919 has no `display_scripts` entry anywhere in the corpus — it is the master text.
        XCTAssertFalse(verse.displayScripts.contains { $0.standard == "ISO15919" })
        XCTAssertTrue(verse.sourceTextMaster.contains { $0.contains("[FLAG_") },
                      "the raw master text is expected to carry inline flags")

        let lines = try XCTUnwrap(VerseTextResolver.scriptLines(verse, script: "Latn", romanStandard: "ISO15919"))
        XCTAssertEqual(lines.count, verse.sourceTextMaster.count)
        XCTAssertFalse(lines.contains { $0.contains("[FLAG_") }, "flags must be resolved before display")
        // `[FLAG_HYPHEN_ALPHA]` is an alphabet-joining hyphen, so it resolves to "-", not to nothing.
        XCTAssertEqual(lines.first, "akrodha paramānanda nityānanda-rāya")
    }

    // MARK: - ReaderSettings persistence (settings.md: device-local, persisted, offline)

    func testDefaultsMatchTheSpecTable() throws {
        let settings = ReaderSettings(defaults: try scratchDefaults())
        XCTAssertEqual(settings.displayScript, "auto")
        XCTAssertEqual(settings.transliterationScript, "Latn")
        XCTAssertEqual(settings.romanStandard, "IAST")
        XCTAssertEqual(settings.wordToWordLanguage, "eng")
        XCTAssertEqual(settings.translationLanguage, "eng")
        XCTAssertEqual(settings.listLanguage, "Latn")
        XCTAssertEqual(settings.theme, .system)
        XCTAssertTrue(settings.showWordToWord)
        XCTAssertTrue(settings.showTranslation)
    }

    func testEverySettingSurvivesARelaunch() throws {
        let defaults = try scratchDefaults()

        let first = ReaderSettings(defaults: defaults)
        first.displayScript = "Deva"
        first.transliterationScript = "Cyrl"
        first.romanStandard = "GVP_Roman"
        first.showWordToWord = false
        first.wordToWordLanguage = "hin"
        first.showTranslation = false
        first.translationLanguage = "eng"
        first.listLanguage = "Beng"
        first.theme = .shyam

        // A fresh instance over the same store is exactly what a relaunch looks like.
        let reloaded = ReaderSettings(defaults: defaults)
        XCTAssertEqual(reloaded.displayScript, "Deva")
        XCTAssertEqual(reloaded.transliterationScript, "Cyrl")
        XCTAssertEqual(reloaded.romanStandard, "GVP_Roman")
        XCTAssertFalse(reloaded.showWordToWord)
        XCTAssertEqual(reloaded.wordToWordLanguage, "hin")
        XCTAssertFalse(reloaded.showTranslation)
        XCTAssertEqual(reloaded.listLanguage, "Beng")
        XCTAssertEqual(reloaded.theme, .shyam)
    }

    func testVerseOptionsCarryBothScriptsWithAutoAlreadyResolved() throws {
        let settings = ReaderSettings(defaults: try scratchDefaults())
        let options = settings.verseOptions(languageOfOrigin: "san")
        // VerseView must never see the `auto` sentinel — it has no song to resolve it against.
        XCTAssertEqual(options.displayScript, "Deva")
        XCTAssertEqual(options.transliterationScript, "Latn")
        XCTAssertEqual(options.romanStandard, "IAST")
        XCTAssertFalse(options.collapsed)
    }

    // MARK: - Helpers

    /// The N9 stanza all three platforms preview (settings.md v5 "Sample song").
    private func sampleVerse() throws -> Verse {
        try XCTUnwrap(SettingsSample.load(), "N9 + a qualifying verse must be bundled").verse
    }

    /// A throwaway `UserDefaults` domain so persistence assertions never touch the shared store.
    private func scratchDefaults() throws -> UserDefaults {
        let suite = "gk-ios.tests.\(UUID().uuidString)"
        let defaults = try XCTUnwrap(UserDefaults(suiteName: suite))
        addTeardownBlock { defaults.removePersistentDomain(forName: suite) }
        return defaults
    }
}
