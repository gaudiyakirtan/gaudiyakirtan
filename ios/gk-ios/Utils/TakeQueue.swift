import Foundation

/// Pure take-queue logic for the Now Playing transport (docs/screens/player.md **v14** — "Shuffle
/// and repeat operate over the song's takes, the only queue mobile has").
///
/// **Why this is a separate, `Foundation`-only file.** player.md v14 asks for the end-of-take
/// decision to live in "a pure, unit-tested function with no `AVPlayer`/`MediaPlayer` in sight —
/// web does the same and it is the only part of playback that can be tested without a device".
/// Web keeps it in `services/playerQueue.ts` (`resolveTrackEndAction`); Android keeps it in
/// `TakeQueue.kt`. Deliberately imports **no** SwiftUI and **no** AVFoundation, so
/// `AudioPlayerService` can be a thin shell around `AVPlayer` and every branch below is reachable
/// from `gk-iosTests/TakeQueueTests.swift`.
///
/// Names are kept identical across platforms (`RepeatMode`, `resolveTakeEndAction`, `playOrder`,
/// `neighbor`) so the same concept reads the same way everywhere (CLAUDE.md "Parallel structure &
/// naming").

/// How playback repeats at the end of a take (player.md v14 table: `off` · `all` · `one`).
///
/// `String`-backed so it can be persisted verbatim later without a mapping table, and
/// `CaseIterable` so the repeat control can cycle `off → all → one → off`.
enum RepeatMode: String, CaseIterable {
    /// Next take, then stop after the last one.
    case off
    /// Next take, wrapping past the last one.
    case all
    /// Replay the current take forever.
    case one
}

/// The single action to take when a take finishes playing (player.md v14 "Precedence at end of
/// track, mirroring web's `resolveTrackEndAction`").
enum TakeEndAction: Equatable {
    /// Play the take that just ended again, from the start.
    case replay
    /// Load and play another take of the same song.
    case play(trackUid: String)
    /// Stop cleanly (no auto-advance).
    case stop
}

enum TakeQueue {

    // MARK: - End of take

    /// What should happen when the current take reaches its end. Priority, per player.md v14:
    ///
    /// 1. **repeat-one wins over everything** — an explicit "keep playing this take" must not be
    ///    pre-empted by shuffle or by the listed order.
    /// 2. Otherwise the **next uid in `order`**, wrapping past the last one when `repeatMode` is
    ///    `.all` and **stopping** after it when `.off`.
    /// 3. `.stop` when `currentTrackUid` isn't in `order` at all (a take that was switched out
    ///    from under the player, or an empty song) — never guess a take.
    ///
    /// - Parameter order: the *resolved* play order — the listed take order, or the shuffled
    ///   permutation from `playOrder(takeUids:shuffle:seed:)`. Shuffle is therefore already baked
    ///   into this array; `shuffle` is kept in the signature so the call site states its intent
    ///   (and so the signature matches Android's `TakeQueue.kt` and web's resolver, which take the
    ///   same inputs). It deliberately does **not** change the outcome on its own: "next" under
    ///   shuffle simply means "next in the shuffled order".
    static func resolveTakeEndAction(
        repeatMode: RepeatMode,
        shuffle: Bool,
        order: [String],
        currentTrackUid: String
    ) -> TakeEndAction {
        if repeatMode == .one { return .replay }
        guard order.contains(currentTrackUid) else { return .stop }
        guard let next = neighbor(
            order: order,
            currentTrackUid: currentTrackUid,
            delta: 1,
            wrap: repeatMode == .all
        ) else {
            return .stop
        }
        return .play(trackUid: next)
    }

    // MARK: - Play order

    /// The order the song's takes play in: the listed order when `shuffle` is off, and a
    /// **deterministic** permutation of it when on (player.md v14 — "When on, 'next' draws from a
    /// shuffled permutation of the takes rather than their listed order. Turning it off restores
    /// listed order").
    ///
    /// Determinism matters twice over: the same `seed` must yield the same permutation for the
    /// whole listening session (so "next" and the queue list agree, and so the order survives a
    /// recompute of this derived value), and the unit tests need a fixed expectation.
    /// `SystemRandomNumberGenerator` gives neither, hence the seeded generator below.
    static func playOrder(takeUids: [String], shuffle: Bool, seed: UInt64) -> [String] {
        guard shuffle, takeUids.count > 1 else { return takeUids }
        var generator = SeededGenerator(seed: seed)
        var result = takeUids
        // Fisher–Yates, spelled out rather than delegated to `shuffled(using:)` so the permutation
        // is fixed by *this* file and not by a standard-library implementation detail.
        var index = result.count - 1
        while index > 0 {
            let swapIndex = Int(boundedRandom(UInt64(index + 1), using: &generator))
            if swapIndex != index { result.swapAt(index, swapIndex) }
            index -= 1
        }
        return result
    }

    // MARK: - Stepping

    /// The uid `delta` steps from `currentTrackUid` within `order`, or `nil` when there is none.
    ///
    /// Off the end (or before the start) it returns `nil` unless `wrap` is true, in which case it
    /// wraps around modulo the queue length. Returns `nil` when `currentTrackUid` isn't in `order`
    /// or `order` is empty. Backs both the manual previous/next transport (which wraps) and the
    /// end-of-take resolution (which wraps only under `.all`).
    static func neighbor(
        order: [String],
        currentTrackUid: String,
        delta: Int,
        wrap: Bool
    ) -> String? {
        guard !order.isEmpty, let index = order.firstIndex(of: currentTrackUid) else { return nil }
        let target = index + delta
        if target >= 0, target < order.count { return order[target] }
        guard wrap else { return nil }
        let count = order.count
        // Swift's `%` keeps the sign of the dividend, so normalize into `0..<count`.
        let wrapped = ((target % count) + count) % count
        return order[wrapped]
    }

    // MARK: - Seeded randomness

    /// A uniformly distributed value in `0..<upperBound`, drawn by rejection sampling.
    ///
    /// Written out rather than using `RandomNumberGenerator.next(upperBound:)` for the same reason
    /// as the hand-rolled shuffle: the emitted sequence must be a property of this file, so the
    /// tests' fixed-seed expectations can't drift with the standard library.
    private static func boundedRandom(
        _ upperBound: UInt64,
        using generator: inout SeededGenerator
    ) -> UInt64 {
        guard upperBound > 1 else { return 0 }
        // Values below `rejectionFloor` would bias the low end of the range (2^64 isn't a multiple of
        // `upperBound`), so they're rejected — the classic `arc4random_uniform` trick.
        let rejectionFloor = (0 &- upperBound) % upperBound
        var value = generator.next()
        while value < rejectionFloor { value = generator.next() }
        return value % upperBound
    }
}

/// A reproducible `RandomNumberGenerator` (SplitMix64) — the same seed always yields the same
/// stream. `SystemRandomNumberGenerator` is explicitly *not* reproducible, which both the shuffle's
/// session stability and `TakeQueueTests` require.
struct SeededGenerator: RandomNumberGenerator {
    private var state: UInt64

    init(seed: UInt64) {
        self.state = seed
    }

    mutating func next() -> UInt64 {
        state = state &+ 0x9E37_79B9_7F4A_7C15
        var z = state
        z = (z ^ (z >> 30)) &* 0xBF58_476D_1CE4_E5B9
        z = (z ^ (z >> 27)) &* 0x94D0_49BB_1331_11EB
        return z ^ (z >> 31)
    }
}
