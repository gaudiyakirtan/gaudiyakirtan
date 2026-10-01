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

    func testResponsiveGeometryUsesAvailableWidthBeforeGutters() {
        let cases: [(CGFloat, CGFloat, Int, CGFloat)] = [
            (390.0, 16.0, 1, 358.0), (599, 16, 1, 567), (600, 24, 2, 552),
            (720, 24, 2, 672), (839, 24, 2, 791), (840, 32, 3, 776),
            (1024, 32, 3, 960), (1600, 32, 3, 1120)
        ]
        for (width, gutter, columns, content) in cases {
            let layout = HomeLayout(availableWidth: width, accessibilitySize: false)
            XCTAssertEqual(layout.gutter, gutter)
            XCTAssertEqual(layout.columnCount, columns)
            XCTAssertEqual(layout.contentWidth, content)
        }
    }

    func testAccessibilityAndNarrowWidthsReflowShelves() {
        let widths: [CGFloat] = [390, 720, 1024]
        for width in widths {
            let layout = HomeLayout(availableWidth: width, accessibilitySize: true)
            XCTAssertEqual(layout.columnCount, 1)
            XCTAssertTrue(layout.verticalShelves)
        }
        XCTAssertTrue(HomeLayout(availableWidth: 320, accessibilitySize: false).verticalShelves)
        XCTAssertFalse(HomeLayout(availableWidth: 390, accessibilitySize: false).verticalShelves)
        XCTAssertEqual(HomeLayout(availableWidth: 0, accessibilitySize: true).contentWidth, 0)
    }

    func testReduceMotionMakesEveryCustomUtilityInstant() {
        for token in HomeMotion.Token.allCases {
            XCTAssertNil(HomeMotion.animation(token, reduceMotion: true))
        }
        XCTAssertNil(HomeMotion.animation(.instant, reduceMotion: false))
        XCTAssertNotNil(HomeMotion.animation(.press, reduceMotion: false))
    }

    func testListeningProjectionPrefersTheSharedPlayerAndClampsProgress() throws {
        let fallback = try XCTUnwrap(SongRepository.shared.song(uid: "N9"))
        let current = try XCTUnwrap(HomeViewModel.firstRecording(
            in: SongRepository.shared.manifest,
            loadSong: { SongRepository.shared.song(uid: $0) }
        ))
        let track = try XCTUnwrap(current.audioFiles.first)
        let state = HomeListeningState(
            fallbackSong: fallback,
            currentSong: current,
            currentTrack: track,
            state: .playing,
            currentTime: 500,
            duration: 120
        )
        XCTAssertEqual(state.song?.uid, current.uid)
        XCTAssertEqual(state.track?.uid, track.uid)
        XCTAssertEqual(state.elapsed, 120)
        XCTAssertEqual(state.progress, 1)
        XCTAssertEqual(state.actionName, "Pause")
    }
}
