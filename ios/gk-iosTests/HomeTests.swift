import XCTest
import SwiftUI
@testable import gk_ios

@MainActor
final class HomeTests: XCTestCase {
    func testHomeKeepsEveryManifestEntryAndItsOrder() {
        let repository = SongRepository.shared
        let model = HomeViewModel(repository: repository)
        XCTAssertFalse(model.songs.isEmpty)
        XCTAssertEqual(model.filteredSongs, repository.manifest)
        XCTAssertEqual(model.filteredSongs.last?.uid, repository.manifest.last?.uid)
        XCTAssertEqual(model.previewSongs.map(\.uid), Array(repository.manifest.prefix(4)).map(\.uid))
        XCTAssertEqual(model.previewBooks.count, min(4, model.books.count))
        XCTAssertEqual(model.previewAuthors.count, min(4, model.authors.count))
        XCTAssertEqual(model.previewTopics.count, min(6, model.topics.count))
    }

    func testHomeListeningSuggestionUsesTheFirstRealRecording() throws {
        let model = HomeViewModel()
        let song = try XCTUnwrap(model.listeningSong)
        XCTAssertFalse(song.audioFiles.isEmpty)
        let expected = try XCTUnwrap(model.songs.first(where: { $0.audioAvailable }))
        XCTAssertEqual(song.uid, expected.uid)
    }

    func testFilteringByTitleAndAuthorRestoresTheEntireCatalog() throws {
        let repository = SongRepository.shared
        let model = HomeViewModel(repository: repository)
        let song = try XCTUnwrap(repository.song(uid: "N9"))

        model.searchText = song.title.uppercased()
        XCTAssertTrue(model.filteredSongs.contains { $0.uid == song.uid })
        model.searchText = repository.authorDisplayName(forUid: song.authorUid)
        XCTAssertTrue(model.filteredSongs.contains { $0.uid == song.uid })
        model.searchText = "NO-SUCH-HOME-CONTENT-7F958"
        XCTAssertTrue(model.filteredSongs.isEmpty)
        XCTAssertTrue(model.filteredTopics.isEmpty)
        XCTAssertTrue(model.filteredBooks.isEmpty)
        XCTAssertTrue(model.filteredAuthors.isEmpty)
        model.searchText = ""
        XCTAssertEqual(model.filteredSongs, repository.manifest)
    }

    func testAllBrowseItemsRetainRepositoryOrderAndMembership() {
        let repository = SongRepository.shared
        let model = HomeViewModel(repository: repository)
        XCTAssertEqual(model.filteredAuthors.map(\.uid), repository.authors().map(\.uid))
        XCTAssertEqual(model.filteredTopics.map(\.id), repository.songGroups(kind: .topic).map(\.uid))
        XCTAssertEqual(model.filteredBooks.map(\.uid), repository.songGroups(kind: .book).map(\.uid))
        for group in repository.songGroups(kind: .topic) + repository.songGroups(kind: .book) {
            XCTAssertEqual(repository.manifestEntries(forUids: group.songUids).map(\.uid), group.songUids)
        }
    }

    func testGroupResolutionOmitsMissingReferencesWithoutReordering() {
        let entries = SongRepository.shared.manifestEntries(forUids: ["N9", "MISSING-UID", "K65", "A1"])
        XCTAssertEqual(entries.map(\.uid), ["N9", "K65", "A1"])
        XCTAssertTrue(SongRepository.shared.manifestEntries(forUids: []).isEmpty)
    }

    func testFeaturedReadingIsTheCompleteBundledN9() throws {
        let model = HomeViewModel()
        let url = try XCTUnwrap(Bundle.main.url(forResource: "N9", withExtension: "json"))
        let source = try JSONDecoder().decode(Song.self, from: Data(contentsOf: url))
        let featured = try XCTUnwrap(model.featuredSong)
        XCTAssertEqual(featured, source)
        XCTAssertFalse(featured.verses.isEmpty)
        for script in ["Latn", "Beng", "Deva"] {
            XCTAssertFalse(featured.title(inScript: script).isEmpty)
            XCTAssertFalse(featured.author(inScript: script).isEmpty)
            for verse in featured.verses {
                XCTAssertNotNil(verse.displayScript(for: script, standard: "IAST"))
                XCTAssertNotNil(verse.translation(language: "eng"))
                XCTAssertNotNil(verse.wordToWord(language: "eng"))
            }
        }
    }

    func testReaderPreferencesReachFeaturedReadingWithoutCollapsingIt() throws {
        let suite = "HomeTests.\(UUID().uuidString)"
        let defaults = try XCTUnwrap(UserDefaults(suiteName: suite))
        defer { defaults.removePersistentDomain(forName: suite) }
        let settings = ReaderSettings(defaults: defaults)
        settings.scriptCode = "Beng"
        settings.showTranslation = false
        settings.showWordToWord = false
        let options = settings.verseOptions()
        XCTAssertEqual(options.scriptCode, "Beng")
        XCTAssertFalse(options.showTranslation)
        XCTAssertFalse(options.showWordToWord)
        XCTAssertFalse(options.collapsed)
        settings.showTranslation = true
        settings.showWordToWord = true
        XCTAssertTrue(settings.verseOptions().showTranslation)
        XCTAssertTrue(settings.verseOptions().showWordToWord)
    }

    func testAuthorScriptSelectionFallsBackToLatinAndThenUid() throws {
        let repository = SongRepository.shared
        let author = try XCTUnwrap(repository.authors().first { $0.uid == "ldt" })
        for script in ["Beng", "Deva", "Latn"] {
            let expected = try XCTUnwrap(author.names.first { $0.scriptCode == script })
            XCTAssertEqual(repository.authorDisplayName(forUid: author.uid, inScript: script), expected.displayText)
        }
        XCTAssertEqual(author.name(inScript: "unsupported"), author.name)
        XCTAssertEqual(Author(uid: "unknown-author", names: []).name(inScript: "Beng"), "unknown-author")
    }

    func testResponsiveGeometryKeepsTwentyPointInsetsAndReadableWidth() {
        let cases: [(CGFloat, CGFloat)] = [
            (320, 280), (390, 350), (599, 559), (600, 560),
            (720, 680), (840, 800), (1024, 840), (1600, 840)
        ]
        for (width, content) in cases {
            let layout = HomeLayout(availableWidth: width, accessibilitySize: false)
            XCTAssertEqual(layout.gutter, 20)
            XCTAssertEqual(layout.contentWidth, content)
        }
        XCTAssertEqual(HomeLayout(availableWidth: 0, accessibilitySize: true).contentWidth, 0)
    }

    func testPhoneRailFitsTwoCompleteCoversAndAContinuation() {
        let widths: [CGFloat] = [320, 390, 430]
        for width in widths {
            let layout = HomeLayout(availableWidth: width, accessibilitySize: false)
            XCTAssertGreaterThan(layout.bookWidth, 100)
            XCTAssertLessThan(2 * layout.bookWidth + 2 * HomeSpacing.md, layout.contentWidth)
            XCTAssertGreaterThan(3 * layout.bookWidth + 2 * HomeSpacing.md, layout.contentWidth)
        }
    }

    func testLargeTypeKeepsBookRailBoundedAndAllowsWiderTitles() {
        let widths: [CGFloat] = [320, 390, 720, 1024]
        for width in widths {
            let normal = HomeLayout(availableWidth: width, accessibilitySize: false)
            let accessible = HomeLayout(availableWidth: width, accessibilitySize: true)
            XCTAssertGreaterThan(accessible.bookWidth, normal.bookWidth)
            XCTAssertLessThan(accessible.bookWidth, accessible.contentWidth)
        }
    }

    func testReduceMotionMakesEveryCustomUtilityInstant() {
        for token in HomeMotion.Token.allCases {
            XCTAssertNil(HomeMotion.animation(token, reduceMotion: true))
        }
        XCTAssertNil(HomeMotion.animation(.instant, reduceMotion: false))
        XCTAssertNotNil(HomeMotion.animation(.press, reduceMotion: false))
        XCTAssertEqual(HomeMotion.Token.press.duration, 0.08)
        XCTAssertEqual(HomeMotion.Token.release.duration, 0.12)
        XCTAssertEqual(HomeMotion.Token.icon.duration, 0.14)
    }

    func testUnrelatedPlayerCannotReplaceOrControlRecommendationInAnyState() throws {
        let featured = try XCTUnwrap(SongRepository.shared.song(uid: "K65"))
        let unrelated = try XCTUnwrap(SongRepository.shared.song(uid: "A10"))
        let states: [AudioPlayerState] = [.idle, .loading, .playing, .paused, .error("Offline")]
        for playerState in states {
            // Even identical take UIDs cannot confer selection across different songs.
            let projection = HomeListeningState(fallbackSong: featured, currentSong: unrelated,
                                                currentTrack: featured.audioFiles.last, state: playerState)
            XCTAssertEqual(projection.song, featured)
            XCTAssertEqual(projection.track, featured.audioFiles.first)
            XCTAssertEqual(projection.state, .idle)
            XCTAssertFalse(projection.matchesFeaturedSong)
            XCTAssertEqual(projection.actionName, "Play recording")
        }
    }

    func testMatchingSongPreservesSelectedTakeAndAllPlayerStates() throws {
        let featured = try XCTUnwrap(SongRepository.shared.song(uid: "K65"))
        let selected = try XCTUnwrap(featured.audioFiles.last)
        XCTAssertNotEqual(selected, featured.audioFiles.first)
        let cases: [(AudioPlayerState, String, String)] = [
            (.idle, "Play recording", "play.fill"), (.loading, "Loading audio", "hourglass"),
            (.playing, "Pause", "pause.fill"), (.paused, "Resume", "play.fill"),
            (.error("Offline"), "Retry", "arrow.clockwise")
        ]
        for (playerState, label, symbol) in cases {
            let projection = HomeListeningState(fallbackSong: featured, currentSong: featured,
                                                currentTrack: selected, state: playerState)
            XCTAssertEqual(projection.song, featured)
            XCTAssertEqual(projection.track, selected)
            XCTAssertEqual(projection.state, playerState)
            XCTAssertTrue(projection.matchesFeaturedSong)
            XCTAssertEqual(projection.actionName, label)
            XCTAssertEqual(projection.controlSymbol, symbol)
        }
    }

    func testAbsentFeaturedSongDoesNotPromoteCurrentPlayerIntoHome() throws {
        let current = try XCTUnwrap(SongRepository.shared.song(uid: "K65"))
        let projection = HomeListeningState(fallbackSong: nil, currentSong: current,
                                            currentTrack: current.audioFiles.first, state: .playing)
        XCTAssertNil(projection.song)
        XCTAssertNil(projection.track)
        XCTAssertEqual(projection.state, .idle)
        XCTAssertFalse(projection.matchesFeaturedSong)
    }

    func testMissingPlayerSongOrTrackKeepsTheSuggestedRecordingIdle() throws {
        let featured = try XCTUnwrap(SongRepository.shared.song(uid: "K65"))
        let cases: [(Song?, AudioTrack?)] = [(nil, nil), (featured, nil), (nil, featured.audioFiles.first)]
        for (song, track) in cases {
            let projection = HomeListeningState(fallbackSong: featured, currentSong: song,
                                                currentTrack: track, state: .playing)
            XCTAssertEqual(projection.song, featured)
            XCTAssertEqual(projection.track, featured.audioFiles.first)
            XCTAssertEqual(projection.state, .idle)
            XCTAssertFalse(projection.matchesFeaturedSong)
        }
    }

    func testReadingRemainsAvailableForASongWithoutRecordings() throws {
        let featured = try XCTUnwrap(SongRepository.shared.song(uid: "A1"))
        let projection = HomeListeningState(fallbackSong: featured, currentSong: nil,
                                            currentTrack: nil, state: .idle)
        XCTAssertEqual(projection.song, featured)
        XCTAssertNil(projection.track)
    }

    func testFirstRecordingSkipsMissingFilesAndUnrecordedSongsWithoutReordering() throws {
        let manifest = SongRepository.shared.manifest
        let recorded = manifest.filter(\.audioAvailable)
        XCTAssertGreaterThan(recorded.count, 2)
        let unrecorded = try XCTUnwrap(SongRepository.shared.song(uid: "A1"))
        var attempted: [String] = []
        let result = HomeViewModel.firstRecording(in: recorded) { uid in
            attempted.append(uid)
            if uid == recorded[0].uid { return nil }
            if uid == recorded[1].uid { return unrecorded }
            return SongRepository.shared.song(uid: uid)
        }
        XCTAssertEqual(result?.uid, recorded[2].uid)
        XCTAssertEqual(attempted, Array(recorded.prefix(3)).map(\.uid))
        XCTAssertNil(HomeViewModel.firstRecording(in: []) { _ in XCTFail("Unexpected load"); return nil })
    }
}
