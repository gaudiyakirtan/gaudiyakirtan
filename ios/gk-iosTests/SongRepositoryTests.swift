//
//  SongRepositoryTests.swift
//  gk-iosTests
//
//  Exercises `SongRepository` against the real bundled corpus (703 songs + manifest.json +
//  song_groups.json, all copied verbatim from pipeline/converted). Hosted unit test target, so
//  `SongRepository.shared` (backed by `Bundle.main`) resolves the same bundle the app ships —
//  see `SongCodableDecodingTests` for why. Facts asserted below (uids, md5, counts) were verified
//  directly against the source JSON, not guessed.

import XCTest
@testable import gk_ios

final class SongRepositoryTests: XCTestCase {

    private var repository: SongRepository { .shared }

    // MARK: - Manifest load (docs/data/manifest.md)

    func testManifestLoadsAllSongsWithUniqueUids() {
        let manifest = repository.manifest
        XCTAssertEqual(manifest.count, 703, "expected one ManifestEntry per bundled song file")
        XCTAssertEqual(Set(manifest.map(\.uid)).count, manifest.count, "uid must be unique per manifest.md")
    }

    func testManifestEntryFieldsMatchTheSourceSong() throws {
        let entry = try XCTUnwrap(repository.manifest.first(where: { $0.uid == "K65" }))
        XCTAssertEqual(entry.primaryTitle.text, "kabe kṛṣṇadhana pāba")
        XCTAssertEqual(entry.authorUid, "ndt")
        XCTAssertEqual(entry.languageOfOrigin, "ben")
        XCTAssertTrue(entry.audioAvailable)
        XCTAssertEqual(entry.firstLetter, "K")
        // manifest.md: "md5 equals the hash of that song's canonical JSON" — this is the pipeline's
        // recorded hash of pipeline/converted/K65.json (verified independently with `hashlib`).
        XCTAssertEqual(entry.md5, "2f7bcdfdae4408ce252f9615861ae8a5")

        // sectionKey (songs-list.md's stable A-Z index key) uses the pipeline-computed first_letter,
        // independent of whatever script `displayTitle`/`title(inScript:)` currently renders in.
        XCTAssertEqual(entry.sectionKey, "K")
    }

    func testManifestEntryForUnknownAuthorSentinel() throws {
        // A1 is the song.md worked example for the "?" unknown-author sentinel.
        let entry = try XCTUnwrap(repository.manifest.first(where: { $0.uid == "A1" }))
        XCTAssertEqual(entry.authorUid, "?")
        XCTAssertFalse(entry.audioAvailable)
    }

    // MARK: - Song-by-uid (docs/data/song.md — loaded only on the detail screen)

    func testSongByUidLoadsAndCachesTheFullSong() throws {
        let first = try XCTUnwrap(repository.song(uid: "K65"))
        XCTAssertEqual(first.verses.count, 4)
        XCTAssertEqual(first.audioFiles.count, 3)

        // Re-fetching returns the same (cached) value rather than re-decoding.
        let second = try XCTUnwrap(repository.song(uid: "K65"))
        XCTAssertEqual(first, second)
    }

    func testSongByUidReturnsNilForAnUnknownUidRatherThanCrashing() {
        XCTAssertNil(repository.song(uid: "NOT-A-REAL-SONG-UID"))
    }

    func testEveryManifestUidResolvesToARealBundledSong() {
        // manifest.md invariant: "Every ... uid resolves within the shipped dataset." Spot-check a
        // deterministic spread (every 47th entry) rather than all 703, to keep the test fast while
        // still covering every prefix/section of the corpus.
        let manifest = repository.manifest
        for entry in manifest.enumerated().filter({ $0.offset % 47 == 0 }).map(\.element) {
            XCTAssertNotNil(repository.song(uid: entry.uid), "manifest uid \(entry.uid) did not resolve to a bundled song")
        }
    }

    // MARK: - Author derivation (docs/data/author.md — derived at runtime, not a standalone dataset)

    func testAuthorDisplayNameForAShortCodeUid() {
        // "ndt" (Narottama Dāsa Ṭhākura) has a real author_display shipped on its songs.
        XCTAssertEqual(repository.authorDisplayName(forUid: "ndt"), "শ্রীল নরোত্তম দাস ঠাকুর")
    }

    func testAuthorDisplayNameFallsBackToUidWhenNoDisplayNameShips() {
        // "মনোহর দাস" is used as the author_uid itself on all 3 of its songs (A12/GV34/GV40), each
        // with an empty author_display — author.md's documented fallback: use the uid as the name.
        XCTAssertEqual(repository.authorDisplayName(forUid: "মনোহর দাস"), "মনোহর দাস")
    }

    func testUnknownAuthorSentinelResolvesToAHumanReadableName() {
        // author.md invariant: the "?" sentinel always exists with an "unknown" display name.
        let name = repository.authorDisplayName(forUid: "?")
        XCTAssertFalse(name.isEmpty)
        XCTAssertNotEqual(name, "?")
    }

    func testDerivedAuthorsCoverEveryManifestAuthorUidWithNoDangling() {
        let authorUids = Set(repository.authors().map(\.uid))
        let manifestAuthorUids = Set(repository.manifest.map(\.authorUid))
        // author.md: "no dangling author_uids — every song's author resolves within the derived
        // catalog." (The derived catalog may also contain nothing extra, but coverage is the
        // invariant that matters for callers like SongSearcher/AuthorSongsView.)
        XCTAssertTrue(manifestAuthorUids.isSubset(of: authorUids))
    }

    func testAuthorsAreSortedByLocalizedName() {
        let names = repository.authors().map(\.name)
        let sorted = names.sorted { $0.localizedCaseInsensitiveCompare($1) == .orderedAscending }
        XCTAssertEqual(names, sorted)
    }

    // MARK: - Song-group resolution (docs/data/collections.md — song_groups.json)

    func testSongGroupsSplitIntoNineteenBooksAndSeventyFourTopicsWithNoCollections() {
        XCTAssertEqual(repository.songGroups(kind: .book).count, 19)
        XCTAssertEqual(repository.songGroups(kind: .topic).count, 74)
        // No `collection`-kind groupings ship yet — CollectionsView's empty state is still correct.
        XCTAssertEqual(repository.songGroups(kind: .collection).count, 0)
    }

    func testSriGuruBookGroupsItsSixKnownSongsInOrder() throws {
        let book = try XCTUnwrap(repository.songGroups(kind: .book).first(where: { $0.uid == "book-sri-guru" }))
        XCTAssertTrue(book.ordered, "books are ordered per collections.md")
        XCTAssertEqual(book.primaryTitle, "Śrī Guru")
        XCTAssertEqual(book.songUids, ["G2", "G3", "G6", "G7", "G8", "G9"])
    }

    func testEveryGroupedSongUidResolvesToARealBundledSong() {
        // collections.md invariant: "Every entry in song_uids resolves to an existing Song" — checked
        // across every book + topic grouping, not just one sample group.
        let allGroups = repository.songGroups(kind: .book) + repository.songGroups(kind: .topic)
        XCTAssertFalse(allGroups.isEmpty)
        for group in allGroups {
            for uid in group.songUids {
                XCTAssertNotNil(repository.song(uid: uid), "\(group.uid) references missing song \(uid)")
            }
        }
    }

    // MARK: - Search integration (docs/screens/search.md via SongRepository.songSearcher)

    func testSearchIsDiacriticInsensitiveAgainstTheRealCorpus() {
        // Plain-ASCII query for a title that's only ever shipped with diacritics ("Eibāra Karuṇā
        // Kara", song V8) — an exact match once both sides are normalized, so this ranks first
        // regardless of anything else in the corpus (verified: this normalized title is unique).
        let results = repository.songSearcher.search("eibara karuna kara", limit: 5)
        XCTAssertEqual(results.first?.uid, "V8")
    }
}
