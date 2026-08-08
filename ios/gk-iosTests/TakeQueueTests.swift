//
//  TakeQueueTests.swift
//  gk-iosTests
//
//  Guards `TakeQueue` — the pure take-queue logic behind the Now Playing transport, specified in
//  docs/screens/player.md **v14** ("Shuffle and repeat operate over the song's takes, the only
//  queue mobile has" + the repeat table + "Precedence at end of track"). player.md asks for exactly
//  this: "Keep this decision in a pure, unit-tested function with no `AVPlayer`/`MediaPlayer` in
//  sight — web does the same and it is the only part of playback that can be tested without a
//  device." Web's equivalent is `services/playerQueue.test.ts`; Android's is `TakeQueueTest.kt`.
//
//  Nothing here touches `AudioPlayerService`, AVFoundation, or the bundled corpus — the uids below
//  are stand-ins shaped like real ones (`<artist-code>-<take>`, see ImageConfig).

import XCTest
@testable import gk_ios

final class TakeQueueTests: XCTestCase {

    private let takes = ["bvsm-1", "tama-2", "ndt-3", "gkg-4"]

    // MARK: - resolveTakeEndAction: the full priority table (player.md v14)

    /// Priority 1: repeat-one wins over everything — over the listed order, over shuffle, and even
    /// over a uid that isn't in the queue at all.
    func testRepeatOneBeatsEverything() {
        XCTAssertEqual(
            TakeQueue.resolveTakeEndAction(
                repeatMode: .one, shuffle: false, order: takes, currentTrackUid: "bvsm-1"
            ),
            .replay
        )
        // ...at the end of the queue, where `.off` would stop and `.all` would wrap:
        XCTAssertEqual(
            TakeQueue.resolveTakeEndAction(
                repeatMode: .one, shuffle: false, order: takes, currentTrackUid: "gkg-4"
            ),
            .replay
        )
        // ...with shuffle on:
        XCTAssertEqual(
            TakeQueue.resolveTakeEndAction(
                repeatMode: .one, shuffle: true, order: takes, currentTrackUid: "tama-2"
            ),
            .replay
        )
        // ...and even for a uid the queue never held, since "replay this take" needs no queue.
        XCTAssertEqual(
            TakeQueue.resolveTakeEndAction(
                repeatMode: .one, shuffle: false, order: takes, currentTrackUid: "nobody-9"
            ),
            .replay
        )
        // ...including an empty queue.
        XCTAssertEqual(
            TakeQueue.resolveTakeEndAction(
                repeatMode: .one, shuffle: false, order: [], currentTrackUid: "bvsm-1"
            ),
            .replay
        )
    }

    /// Priority 2, mid-queue: every mode that isn't `one` advances to the next uid in `order`.
    func testMidQueueAdvancesToTheNextTakeInEveryMode() {
        for mode in [RepeatMode.off, .all] {
            XCTAssertEqual(
                TakeQueue.resolveTakeEndAction(
                    repeatMode: mode, shuffle: false, order: takes, currentTrackUid: "bvsm-1"
                ),
                .play(trackUid: "tama-2"),
                "repeatMode \(mode.rawValue) should advance mid-queue"
            )
            XCTAssertEqual(
                TakeQueue.resolveTakeEndAction(
                    repeatMode: mode, shuffle: false, order: takes, currentTrackUid: "ndt-3"
                ),
                .play(trackUid: "gkg-4")
            )
        }
    }

    /// Priority 2, end of queue: `.all` wraps past the last take, `.off` stops after it.
    func testEndOfQueueWrapsUnderAllAndStopsUnderOff() {
        XCTAssertEqual(
            TakeQueue.resolveTakeEndAction(
                repeatMode: .all, shuffle: false, order: takes, currentTrackUid: "gkg-4"
            ),
            .play(trackUid: "bvsm-1")
        )
        XCTAssertEqual(
            TakeQueue.resolveTakeEndAction(
                repeatMode: .off, shuffle: false, order: takes, currentTrackUid: "gkg-4"
            ),
            .stop
        )
    }

    /// A single-take song: `.off` stops, `.all` wraps onto the take itself (which
    /// `AudioPlayerService` performs as a replay rather than a reload).
    func testSingleTakeSong() {
        XCTAssertEqual(
            TakeQueue.resolveTakeEndAction(
                repeatMode: .off, shuffle: false, order: ["bvsm-1"], currentTrackUid: "bvsm-1"
            ),
            .stop
        )
        XCTAssertEqual(
            TakeQueue.resolveTakeEndAction(
                repeatMode: .all, shuffle: false, order: ["bvsm-1"], currentTrackUid: "bvsm-1"
            ),
            .play(trackUid: "bvsm-1")
        )
    }

    /// Priority 3: a uid that isn't in the queue stops rather than guessing a take — the
    /// "switched out from under the player" case.
    func testUnknownCurrentUidStops() {
        for mode in [RepeatMode.off, .all] {
            XCTAssertEqual(
                TakeQueue.resolveTakeEndAction(
                    repeatMode: mode, shuffle: false, order: takes, currentTrackUid: "nobody-9"
                ),
                .stop
            )
            XCTAssertEqual(
                TakeQueue.resolveTakeEndAction(
                    repeatMode: mode, shuffle: true, order: [], currentTrackUid: "bvsm-1"
                ),
                .stop
            )
        }
    }

    /// Shuffle changes *which* order is passed in, never how the end of that order is resolved —
    /// the permutation is already baked into `order` by `playOrder`.
    func testShuffleOrderIsFollowedAsGiven() {
        let shuffled = ["ndt-3", "bvsm-1", "gkg-4", "tama-2"]
        XCTAssertEqual(
            TakeQueue.resolveTakeEndAction(
                repeatMode: .off, shuffle: true, order: shuffled, currentTrackUid: "ndt-3"
            ),
            .play(trackUid: "bvsm-1")
        )
        XCTAssertEqual(
            TakeQueue.resolveTakeEndAction(
                repeatMode: .off, shuffle: true, order: shuffled, currentTrackUid: "tama-2"
            ),
            .stop,
            "the last take of the shuffled order is still the last take"
        )
        XCTAssertEqual(
            TakeQueue.resolveTakeEndAction(
                repeatMode: .all, shuffle: true, order: shuffled, currentTrackUid: "tama-2"
            ),
            .play(trackUid: "ndt-3")
        )
    }

    // MARK: - playOrder

    func testPlayOrderIsListedOrderWhenShuffleIsOff() {
        XCTAssertEqual(TakeQueue.playOrder(takeUids: takes, shuffle: false, seed: 99), takes)
        // The seed is irrelevant while shuffle is off.
        XCTAssertEqual(TakeQueue.playOrder(takeUids: takes, shuffle: false, seed: 0), takes)
    }

    /// Determinism: the same seed must yield the same permutation, every call. The whole reason
    /// `TakeQueue` carries its own seeded generator instead of `SystemRandomNumberGenerator`.
    func testShuffleIsDeterministicForAFixedSeed() {
        let first = TakeQueue.playOrder(takeUids: takes, shuffle: true, seed: 42)
        for _ in 0..<25 {
            XCTAssertEqual(TakeQueue.playOrder(takeUids: takes, shuffle: true, seed: 42), first)
        }
    }

    /// A shuffle is a *permutation*: same multiset, same length, nothing invented or dropped.
    func testShuffleIsAPermutationOfTheInput() {
        let longer = takes + ["aaa-1", "bbb-2", "ccc-3", "ddd-4", "eee-5"]
        for seed in UInt64(0)..<UInt64(40) {
            let order = TakeQueue.playOrder(takeUids: longer, shuffle: true, seed: seed)
            XCTAssertEqual(order.count, longer.count)
            XCTAssertEqual(order.sorted(), longer.sorted(), "seed \(seed) dropped or duplicated a take")
        }
    }

    /// Different seeds must actually be able to produce different orders, or "shuffle" is a
    /// no-op dressed up as one.
    func testDifferentSeedsProduceDifferentOrders() {
        let orders = Set((UInt64(0)..<UInt64(40)).map {
            TakeQueue.playOrder(takeUids: takes, shuffle: true, seed: $0)
        })
        XCTAssertGreaterThan(orders.count, 1)
    }

    /// Degenerate inputs are returned untouched rather than trapping (0- and 1-element queues hit
    /// the bounded-random guard).
    func testShuffleHandlesEmptyAndSingleTakeQueues() {
        XCTAssertEqual(TakeQueue.playOrder(takeUids: [], shuffle: true, seed: 7), [])
        XCTAssertEqual(TakeQueue.playOrder(takeUids: ["bvsm-1"], shuffle: true, seed: 7), ["bvsm-1"])
    }

    // MARK: - neighbor

    func testNeighborStepsForwardAndBackMidQueue() throws {
        let next = try XCTUnwrap(
            TakeQueue.neighbor(order: takes, currentTrackUid: "tama-2", delta: 1, wrap: false)
        )
        XCTAssertEqual(next, "ndt-3")

        let previous = try XCTUnwrap(
            TakeQueue.neighbor(order: takes, currentTrackUid: "tama-2", delta: -1, wrap: false)
        )
        XCTAssertEqual(previous, "bvsm-1")
    }

    func testNeighborAtBothEndsWithoutWrap() {
        XCTAssertNil(
            TakeQueue.neighbor(order: takes, currentTrackUid: "gkg-4", delta: 1, wrap: false),
            "past the last take there is no next"
        )
        XCTAssertNil(
            TakeQueue.neighbor(order: takes, currentTrackUid: "bvsm-1", delta: -1, wrap: false),
            "before the first take there is no previous"
        )
    }

    func testNeighborAtBothEndsWithWrap() throws {
        XCTAssertEqual(
            try XCTUnwrap(
                TakeQueue.neighbor(order: takes, currentTrackUid: "gkg-4", delta: 1, wrap: true)
            ),
            "bvsm-1"
        )
        XCTAssertEqual(
            try XCTUnwrap(
                TakeQueue.neighbor(order: takes, currentTrackUid: "bvsm-1", delta: -1, wrap: true)
            ),
            "gkg-4"
        )
        // A single-take queue wraps onto itself in both directions.
        XCTAssertEqual(
            try XCTUnwrap(
                TakeQueue.neighbor(order: ["bvsm-1"], currentTrackUid: "bvsm-1", delta: -1, wrap: true)
            ),
            "bvsm-1"
        )
    }

    func testNeighborReturnsNilForUnknownUidOrEmptyQueue() {
        XCTAssertNil(TakeQueue.neighbor(order: takes, currentTrackUid: "nobody-9", delta: 1, wrap: true))
        XCTAssertNil(TakeQueue.neighbor(order: [], currentTrackUid: "bvsm-1", delta: 1, wrap: true))
    }

    // MARK: - RepeatMode

    /// The repeat control cycles through `CaseIterable`'s order, and the raw values are what a
    /// future persistence slice would store — so both are pinned here.
    func testRepeatModeCasesAndRawValues() {
        XCTAssertEqual(RepeatMode.allCases, [.off, .all, .one])
        XCTAssertEqual(RepeatMode.off.rawValue, "off")
        XCTAssertEqual(RepeatMode.all.rawValue, "all")
        XCTAssertEqual(RepeatMode.one.rawValue, "one")
    }
}
