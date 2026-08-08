//
//  MiniPlayerSlotTests.swift
//  gk-iosTests
//
//  Guards `resolveMiniPlayerSlot` + `LastVisitedSongStore` — the load-bearing logic behind
//  docs/screens/player.md **v15** ("The mini-player is never empty"):
//
//      | Playing (track state) | a take is loaded — playing, paused, loading or errored |
//      | Last visited (resting)| nothing loaded, but a song was opened                   |
//      | (absent)              | a fresh install where no song has been opened yet       |
//
//  "Precedence is simple: whatever is loaded in the player wins; the last-visited song only fills
//  the slot when the player is empty." That rule, and the one persisted uid behind it
//  (`player.lastVisitedSongUid`, "holding the uid only ... so nothing denormalized can go stale"),
//  are the parts of the bar that can be verified with no SwiftUI and no device — the same split
//  `TakeQueueTests` uses. Android's equivalent is `MiniPlayerSlotTest.kt`.
//
//  Fixtures are the real bundled corpus, read straight out of gk-ios/Resources/songs rather than
//  invented: A10 (`śrīgaura-ārati`, author `bt` = Śrīla Bhaktivinoda Ṭhākura, 9 takes, the first by
//  "Srila BV Svami Prabhupada") and A12 (`śrīrādhārāṇīra ārati`, author Manohara dāsa,
//  `audio_available = false`, no takes) — one song of each kind the spec's table distinguishes.

import XCTest
@testable import gk_ios

final class MiniPlayerSlotTests: XCTestCase {

    /// A song with audio: `audio_available = true`, 9 takes.
    private let audioSongUid = "A10"
    /// A song without audio: `audio_available = false`, no takes — the "still occupies the slot,
    /// but the play affordance becomes an open-song chevron" case.
    private let silentSongUid = "A12"

    private var repository: SongRepository { .shared }

    // MARK: - Precedence (player.md v15: "whatever is loaded in the player wins")

    /// The loaded song wins over the last visited one — the resting state must never displace what
    /// the reader is actually listening to.
    func testLoadedPlayerWinsOverLastVisited() throws {
        let loaded = try audioSong()
        let visited = try silentEntry()

        let slot = resolveMiniPlayerSlot(
            currentSong: loaded,
            state: .playing,
            lastVisited: visited
        )

        XCTAssertEqual(slot, .playing(song: loaded))
    }

    /// ...in every playback state, not just `.playing`. A paused or still-loading take is loaded.
    func testLoadedPlayerWinsInEveryPlaybackState() throws {
        let loaded = try audioSong()
        let visited = try silentEntry()

        for state in [AudioPlayerState.idle, .loading, .playing, .paused, .error("Audio unavailable")] {
            XCTAssertEqual(
                resolveMiniPlayerSlot(currentSong: loaded, state: state, lastVisited: visited),
                .playing(song: loaded),
                "state \(state) should still hold the slot with the loaded song"
            )
        }
    }

    /// The error state counts as loaded. Falling back to the resting state on a failed take would
    /// swap the bar's song out from under the reader and swallow the failure they just caused;
    /// player.md wants the loaded song shown beside a clear "audio unavailable" instead.
    func testErrorStateStillCountsAsLoaded() throws {
        let loaded = try audioSong()

        XCTAssertEqual(
            resolveMiniPlayerSlot(
                currentSong: loaded,
                state: .error("Audio unavailable"),
                lastVisited: try silentEntry()
            ),
            .playing(song: loaded)
        )
        // ...and with nothing visited either, so the fallback can't be what's holding it up.
        XCTAssertEqual(
            resolveMiniPlayerSlot(currentSong: loaded, state: .error("Audio unavailable"), lastVisited: nil),
            .playing(song: loaded)
        )
    }

    /// The resting state fills the gap when — and only when — the player is empty.
    func testLastVisitedFillsTheGapWhenNothingIsLoaded() throws {
        let visited = try audioEntry()

        let slot = resolveMiniPlayerSlot(currentSong: nil, state: .idle, lastVisited: visited)

        XCTAssertEqual(slot, .resting(song: visited, canPlay: true))
    }

    /// A fresh install where no song has ever been opened: "there is genuinely nothing to resume".
    func testAbsentWhenNeitherLoadedNorVisited() {
        XCTAssertEqual(
            resolveMiniPlayerSlot(currentSong: nil, state: .idle, lastVisited: nil),
            .absent
        )
    }

    // MARK: - The no-audio last visited song (player.md v15 "It is not a track")

    /// A song with `audio_available = false` still holds the slot — "the reader was there, it is
    /// still the way back to it" — but carries the flag that swaps its play affordance for an
    /// open-song chevron.
    func testSilentLastVisitedSongStillRestsButCannotPlay() throws {
        let visited = try silentEntry()
        XCTAssertFalse(visited.audioAvailable, "A12 is the corpus's no-audio fixture")

        let slot = resolveMiniPlayerSlot(currentSong: nil, state: .idle, lastVisited: visited)

        XCTAssertEqual(slot, .resting(song: visited, canPlay: false))
        guard case .resting(_, let canPlay) = slot else {
            return XCTFail("expected the resting state")
        }
        XCTAssertFalse(canPlay, "the chevron case must be distinguishable from the play case")
    }

    /// A takeless song that was *played* must stay in the playing state rather than falling through
    /// to the resting one. `AudioPlayerService.play(song:)` assigns `currentSong` before its
    /// "nothing to play" guard fires precisely so this holds — the reader tapped play on *that*
    /// song, so the bar must name it beside "Audio unavailable".
    func testFailedPlayOfATakelessSongStillHoldsTheSlot() throws {
        let silent = try song(silentSongUid)
        XCTAssertTrue(silent.audioFiles.isEmpty, "A12 is the corpus's takeless fixture")

        let player = AudioPlayerService.shared
        addTeardownBlock { player.close() }
        player.play(song: silent)

        XCTAssertEqual(player.currentSong?.uid, silentSongUid, "a failed play still loads its song")
        XCTAssertNil(player.currentTrack, "...but no take was chosen")
        XCTAssertEqual(player.state, .error("Audio unavailable"))
        XCTAssertTrue(player.hasActiveTrack)

        // ...and the slot follows, even with another song sitting in the last-visited record.
        XCTAssertEqual(
            resolveMiniPlayerSlot(
                currentSong: player.currentSong,
                state: player.state,
                lastVisited: try audioEntry()
            ),
            .playing(song: silent)
        )
    }

    // MARK: - Reciter vs author (tracks.md), the one credit the two states don't share

    /// The resting state credits the **author**; the playing state credits the **reciter**. The
    /// fixture proves they really are different people for the same song, so a bar that showed the
    /// wrong one would be visibly wrong.
    func testRestingCreditIsTheAuthorNotTheReciter() throws {
        let entry = try audioEntry()
        let loaded = try audioSong()

        let author = repository.authorDisplayName(forUid: entry.authorUid)
        let reciter = try XCTUnwrap(loaded.audioFiles.first?.artist)

        XCTAssertEqual(author, "Śrīla Bhaktivinoda Ṭhākura")
        XCTAssertEqual(reciter, "Srila BV Svami Prabhupada")
        XCTAssertNotEqual(author, reciter)
    }

    // MARK: - Titles follow the reader's list language (settings.md v5 `listLanguage`)

    /// The resting bar renders its title through `ManifestEntry.title(inScript:)`, like every other
    /// list surface — never a hardcoded Latin title.
    func testRestingTitleFollowsTheListLanguage() throws {
        let entry = try audioEntry()
        XCTAssertEqual(entry.title(inScript: "Latn"), "śrīgaura-ārati")
        XCTAssertEqual(entry.title(inScript: "Beng"), "শ্রীগৌর-আরতি")
        // An unavailable script falls back rather than blanking the bar.
        XCTAssertEqual(entry.title(inScript: "Zzzz"), "śrīgaura-ārati")
    }

    // MARK: - Persistence (player.md v15 "Persistence": the uid only, under `player.lastVisitedSongUid`)

    func testFreshInstallHasNoLastVisitedSong() throws {
        let store = LastVisitedSongStore(defaults: try scratchDefaults())
        XCTAssertNil(store.songUid)
        XCTAssertEqual(
            resolveMiniPlayerSlot(currentSong: nil, state: .idle, lastVisited: entry(store)),
            .absent
        )
    }

    /// The round trip: recording a visit writes the uid under the documented key, and a store built
    /// fresh over the same domain reads it back — the bar survives a relaunch.
    func testRecordedUidRoundTripsThroughUserDefaults() throws {
        let defaults = try scratchDefaults()
        let store = LastVisitedSongStore(defaults: defaults)

        store.record(uid: audioSongUid)

        XCTAssertEqual(store.songUid, audioSongUid)
        XCTAssertEqual(
            defaults.string(forKey: "player.lastVisitedSongUid"),
            audioSongUid,
            "player.md v15 names this exact key"
        )
        XCTAssertEqual(LastVisitedSongStore(defaults: defaults).songUid, audioSongUid)
    }

    /// Only the uid is stored — never a denormalized title/author/audio flag, which would go stale
    /// against a pipeline resync. Everything the bar draws is rehydrated from the corpus.
    func testOnlyTheUidIsPersisted() throws {
        let suite = "gk-ios.tests.\(UUID().uuidString)"
        let defaults = try XCTUnwrap(UserDefaults(suiteName: suite))
        addTeardownBlock { defaults.removePersistentDomain(forName: suite) }

        LastVisitedSongStore(defaults: defaults).record(uid: audioSongUid)

        let written = defaults.persistentDomain(forName: suite) ?? [:]
        XCTAssertEqual(
            written.keys.filter { $0.hasPrefix("player.") },
            ["player.lastVisitedSongUid"],
            "the store must write one key — no denormalized title/author/audio alongside it"
        )
        XCTAssertEqual(written["player.lastVisitedSongUid"] as? String, audioSongUid)
    }

    /// The last record wins — one song, not a history (mobile keeps one uid where web's
    /// `gk.recents` keeps ten).
    func testRecordingAnotherSongReplacesThePreviousOne() throws {
        let store = LastVisitedSongStore(defaults: try scratchDefaults())
        store.record(uid: audioSongUid)
        store.record(uid: silentSongUid)
        XCTAssertEqual(store.songUid, silentSongUid)
    }

    func testClearingRemovesTheStoredKey() throws {
        let defaults = try scratchDefaults()
        let store = LastVisitedSongStore(defaults: defaults)
        store.record(uid: audioSongUid)

        store.songUid = nil

        XCTAssertNil(defaults.object(forKey: "player.lastVisitedSongUid"))
        XCTAssertNil(LastVisitedSongStore(defaults: defaults).songUid)
    }

    /// A persisted uid that has since left the corpus resolves to nothing and the slot goes absent
    /// — "a missing or unparsable record means the slot is absent, never a crash".
    func testStaleUidResolvesToAnAbsentSlot() throws {
        let store = LastVisitedSongStore(defaults: try scratchDefaults())
        store.record(uid: "NOT-A-SONG")

        XCTAssertNil(repository.manifestEntry(uid: "NOT-A-SONG"))
        XCTAssertEqual(
            resolveMiniPlayerSlot(currentSong: nil, state: .idle, lastVisited: entry(store)),
            .absent
        )
    }

    /// A recorded uid that *is* in the corpus rehydrates into the resting state — the whole
    /// persist → rehydrate → render path, minus SwiftUI.
    func testRecordedUidRehydratesIntoTheRestingState() throws {
        let store = LastVisitedSongStore(defaults: try scratchDefaults())
        store.record(uid: silentSongUid)

        XCTAssertEqual(
            resolveMiniPlayerSlot(currentSong: nil, state: .idle, lastVisited: entry(store)),
            .resting(song: try silentEntry(), canPlay: false)
        )
    }

    // MARK: - Helpers

    /// The manifest-side rehydration `MiniPlayerView` performs on every redraw.
    private func entry(_ store: LastVisitedSongStore) -> ManifestEntry? {
        store.songUid.flatMap { repository.manifestEntry(uid: $0) }
    }

    private func audioEntry() throws -> ManifestEntry {
        try XCTUnwrap(repository.manifestEntry(uid: audioSongUid), "\(audioSongUid) must be bundled")
    }

    private func silentEntry() throws -> ManifestEntry {
        try XCTUnwrap(repository.manifestEntry(uid: silentSongUid), "\(silentSongUid) must be bundled")
    }

    private func audioSong() throws -> Song {
        try song(audioSongUid)
    }

    private func song(_ uid: String) throws -> Song {
        try XCTUnwrap(repository.song(uid: uid), "\(uid).json must be bundled")
    }

    /// A throwaway `UserDefaults` domain so persistence assertions never touch the shared store
    /// (the same helper `SettingsResolverTests` uses).
    private func scratchDefaults() throws -> UserDefaults {
        let suite = "gk-ios.tests.\(UUID().uuidString)"
        let defaults = try XCTUnwrap(UserDefaults(suiteName: suite))
        addTeardownBlock { defaults.removePersistentDomain(forName: suite) }
        return defaults
    }
}
