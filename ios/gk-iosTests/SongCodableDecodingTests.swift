//
//  SongCodableDecodingTests.swift
//  gk-iosTests
//
//  `Codable` conformance of the canonical models (docs/data/song.md, verse.md) decoded directly
//  against real bundled corpus JSON — not synthetic fixtures. This is a *hosted* unit test target
//  (BUNDLE_LOADER/TEST_HOST in the .pbxproj), so `Bundle.main` at test-run time is the host app's
//  bundle, which carries the same flattened `Resources/songs/*.json` the app ships (see
//  `SongRepository`'s bundling note). Assertions are checked by hand against the raw JSON on disk
//  (pipeline/converted/K65.json, A1.json, A0.json) so a decode/shape regression is caught even
//  if it happens to still produce *a* value.

import XCTest
@testable import gk_ios

final class SongCodableDecodingTests: XCTestCase {

    /// Decodes `uid.json` straight from the app bundle the way `SongRepository.song(uid:)` does,
    /// so a failure here points at the `Song`/`Verse` `Codable` implementation, not the repository.
    private func decodeSong(_ uid: String) throws -> Song {
        let url = try XCTUnwrap(
            Bundle.main.url(forResource: uid, withExtension: "json"),
            "\(uid).json not found in the app bundle — was Resources/songs/ copied and added to the gk-ios target?"
        )
        let data = try Data(contentsOf: url)
        return try JSONDecoder().decode(Song.self, from: data)
    }

    // MARK: - K65: multi-take audio_files (the primary case this test file exists for)

    func testMultiTakeAudioFilesDecodeInOrderWithArtists() throws {
        let song = try decodeSong("K65")

        XCTAssertEqual(song.uid, "K65")
        XCTAssertEqual(song.languageOfOrigin, "ben")
        XCTAssertEqual(song.authorUid, "ndt")
        XCTAssertTrue(song.audioAvailable)

        // Three takes, order preserved exactly as authored in the JSON array.
        XCTAssertEqual(song.audioFiles.map(\.uid), ["srrb-1", "tama-1", "tama-2"])
        XCTAssertEqual(song.audioFiles.map(\.filename),
                       ["K65-srrb-1.mp3", "K65-tama-1.mp3", "K65-tama-2.mp3"])
        XCTAssertEqual(song.audioFiles[0].artist, "Sudarsan das (Radha-ramana Babaji Maharaja)")
        // Two takes by the same artist decode as distinct AudioTrack values (different uid/filename).
        XCTAssertEqual(song.audioFiles[1].artist, "Tamal Krsna das")
        XCTAssertEqual(song.audioFiles[2].artist, "Tamal Krsna das")
        XCTAssertNotEqual(song.audioFiles[1], song.audioFiles[2])

        // song.md invariant: audio_available == (audio_files is non-empty).
        XCTAssertEqual(song.audioAvailable, !song.audioFiles.isEmpty)
    }

    func testMultiScriptTitleAndAuthorDisplayResolveByScript() throws {
        let song = try decodeSong("K65")

        XCTAssertEqual(song.title(inScript: "Latn"), "kabe kṛṣṇadhana pāba")
        XCTAssertEqual(song.title(inScript: "Beng"), "কবে কৃষ্ণধন পাব")
        // Requesting a script this song never shipped falls back through Latn/first (never crashes).
        // "Deva" used to be that unshipped script; the corpus now transliterates into it, so this
        // asks for a script code that is not a real transliteration target at all.
        XCTAssertEqual(song.title(inScript: "NoSuchScript"), "kabe kṛṣṇadhana pāba")

        XCTAssertEqual(song.author(inScript: "Beng"), "শ্রীল নরোত্তম দাস ঠাকুর")
        // `author` (the flat convenience accessor) matches `author(inScript: "Latn")`'s own Latn-first
        // fallback chain when no Latn author_display was shipped.
        XCTAssertEqual(song.author, song.author(inScript: "Latn"))
    }

    func testVersesDecodeOrderedWithDisplayScriptsAndMasterTextFlags() throws {
        let song = try decodeSong("K65")

        XCTAssertEqual(song.verses.count, 4)
        // song.md invariant: render order = list order (verse_number happens to be 1...4 here too).
        XCTAssertEqual(song.verses.map(\.verseNumber), [1, 2, 3, 4])

        let v1 = song.verses[0]
        XCTAssertEqual(v1.sourceTextMaster.count, 4)
        // 12 display_scripts on this verse: 10 native/roman scripts + 2 alternate Latn standards.
        XCTAssertEqual(v1.displayScripts.count, 12)

        let iast = try XCTUnwrap(v1.iastScript)
        XCTAssertEqual(iast.scriptCode, "Latn")
        XCTAssertEqual(iast.standard, "IAST")
        let iastFirstLine = try XCTUnwrap(iast.text.first)
        XCTAssertEqual(iastFirstLine, "kabe kṛṣṇadhana pāba,    hiyāra mājhāre thoba,")

        // BBT/GVP are alternate Latin transliteration standards this corpus ships alongside IAST.
        let bbt = try XCTUnwrap(v1.romanScript(standard: "BBT_Roman"))
        XCTAssertEqual(bbt.standard, "BBT_Roman")
        // Requesting a standard the verse doesn't have falls back to IAST rather than nil.
        let fallbackRoman = try XCTUnwrap(v1.romanScript(standard: "NoSuchStandard"))
        XCTAssertEqual(fallbackRoman.standard, iast.standard)

        // K65 ships no glosses/translations — decoded as empty arrays, not nil (song.md/verse.md:
        // absence and emptiness mean the same thing).
        XCTAssertEqual(v1.wordToWords.count, 0)
        XCTAssertEqual(v1.translations.count, 0)
        XCTAssertNil(v1.wordToWord(language: "eng"))
        XCTAssertNil(v1.translation(language: "eng"))

        // The raw master text still carries an unresolved [FLAG_HYPHEN_ALPHA] marker (only the
        // pipeline-generated display_scripts are pre-resolved) — resolving it must reproduce exactly
        // the IAST display line the pipeline generated for the same content.
        let rawSecondLine = v1.sourceTextMaster[1]
        XCTAssertTrue(rawSecondLine.contains("[FLAG_HYPHEN_ALPHA]"))
        XCTAssertEqual(StringUtils.resolveMasterTextFlags(rawSecondLine), iast.text[1])
    }

    // MARK: - A1: the song.md "unknown author" example (audio_available == false)

    func testUnknownAuthorSentinelAndNoAudioDecode() throws {
        let song = try decodeSong("A1")

        XCTAssertEqual(song.authorUid, "?")
        XCTAssertFalse(song.audioAvailable)
        XCTAssertEqual(song.audioFiles, [])
        // Sentinel author still resolves to a human-readable (if "unknown") display name.
        XCTAssertFalse(song.author.isEmpty)
        XCTAssertNotEqual(song.author, "?")
    }

    // MARK: - A10: word-to-word glossary + translation (śrī gaura-ārati)

    // Retargeted from A0, which no longer exists anywhere in the corpus — it is absent from
    // pipeline/converted, from the manifest, and from the web and Android bundles too, so this test
    // could only ever fail. A10 is one of 169 songs whose first verse ships both an `eng`
    // word-to-word glossary and an `eng` translation.
    func testWordToWordAndTranslationDecode() throws {
        let song = try decodeSong("A10")
        let v1 = try XCTUnwrap(song.verses.first)

        let eng = try XCTUnwrap(v1.wordToWord(language: "eng"))
        XCTAssertEqual(eng.scriptCode, "Latn")
        let firstWordPair = try XCTUnwrap(eng.words.first)
        XCTAssertEqual(firstWordPair, ["jaya jaya", "all glories, all glories"])

        let translation = try XCTUnwrap(v1.translation(language: "eng"))
        XCTAssertFalse(translation.isGenerated)
        XCTAssertTrue(translation.joinedText.contains("Śrī Gaura-candra"))
    }

    // MARK: - AudioConfig / ImageConfig URL construction (player.md / collections.md)

    func testAudioAndArtistImageURLsAreDerivedFromTrackUid() throws {
        let song = try decodeSong("K65")
        let track = try XCTUnwrap(song.audioFiles.first(where: { $0.uid == "tama-2" }))

        XCTAssertEqual(AudioConfig.playableURL(for: track)?.absoluteString,
                       "https://gaudiyakirtan.s3.amazonaws.com/audio/K65-tama-2.mp3")

        // "tama-2" -> artist code "tama" -> artists/tama.jpg (task 2: <code> = uid prefix before the
        // trailing take number).
        XCTAssertEqual(ImageConfig.artistCode(fromTrackUid: "tama-2"), "tama")
        XCTAssertEqual(ImageConfig.artistCode(fromTrackUid: "bvsm-1"), "bvsm")
        XCTAssertEqual(ImageConfig.artistPortraitURL(forTrackUid: "bvsm-1")?.absoluteString,
                       "https://gaudiyakirtan.s3.amazonaws.com/artists/bvsm.jpg")
    }
}
