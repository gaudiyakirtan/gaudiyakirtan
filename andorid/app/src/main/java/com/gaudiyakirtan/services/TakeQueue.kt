package com.gaudiyakirtan.services

import kotlin.random.Random

/**
 * Pure take-queue logic for the mobile player (docs/screens/player.md v14, "Shuffle and repeat
 * operate over the song's takes, the only queue mobile has").
 *
 * Deliberately split out of [PlayerViewModel] and kept **free of every Android import** -- no
 * `MediaPlayer`, no `Context`, no Compose. That is the same split web uses for
 * `services/playerQueue.ts` (`resolveTrackEndAction`) and iOS for its `TakeQueue`, and for the same
 * reason the spec gives: the end-of-take decision is the only part of playback that can be tested
 * without a player object or a device, so it lives where a plain JVM JUnit test can reach it (see
 * `app/src/test/.../services/TakeQueueTest.kt`).
 *
 * The vocabulary is the spec's: a **take** is one recording of a song (`Song.audio_files[]`,
 * identified by [com.gaudiyakirtan.myapplication.models.AudioTrack.uid]), and the *order* is the
 * sequence the player walks through them in -- listed order normally, a shuffled permutation when
 * shuffle is on. Every function here takes that order as an argument rather than deriving it, so
 * shuffle is decided once, in [playOrder], and never re-rolled mid-song.
 */

/** Repeat setting, per docs/screens/player.md v14's shuffle/repeat table. */
enum class RepeatMode { OFF, ALL, ONE }

/**
 * What must happen when the current take reaches its end -- exactly one of these fires, chosen by
 * [resolveTakeEndAction]. Mirrors web's `TrackEndAction` union and iOS's `TakeEndAction`.
 */
sealed interface TakeEndAction {
    /** Repeat-one: play the same take again from the start. */
    data object Replay : TakeEndAction

    /** Move on to another take of the same song. */
    data class PlayTake(val trackUid: String) : TakeEndAction

    /** Nothing follows -- fall silent (staying loaded and rewound, never crashing). */
    data object Stop : TakeEndAction
}

/**
 * The end-of-take decision (docs/screens/player.md v14: "Precedence at end of track, mirroring web's
 * `resolveTrackEndAction`: **repeat-one** wins over everything; then the shuffle/repeat-aware next
 * take; otherwise stop.").
 *
 * In priority order:
 *  1. [RepeatMode.ONE] -> [TakeEndAction.Replay]. An explicit "play this one again" must not be
 *     pre-empted by shuffle or by the rest of the order.
 *  2. The next uid in [order] after [currentTrackUid], when there is one.
 *  3. At the end of [order]: wrap to the first take under [RepeatMode.ALL], otherwise
 *     [TakeEndAction.Stop].
 *  4. [TakeEndAction.Stop] when [currentTrackUid] isn't in [order] at all -- the order was armed for
 *     a different song (or is empty), so there is no meaningful "next" and silence is the safe
 *     answer.
 *
 * [shuffle] does not change the arithmetic here because the shuffle has *already been applied*:
 * [order] is the permutation [playOrder] produced. It stays on the signature because that is the
 * shape the spec names (and iOS/web mirror), and because it documents at the call site that the
 * caller must pass the shuffled order and not the raw `audio_files` order.
 */
fun resolveTakeEndAction(
    repeatMode: RepeatMode,
    shuffle: Boolean,
    order: List<String>,
    currentTrackUid: String
): TakeEndAction {
    if (repeatMode == RepeatMode.ONE) return TakeEndAction.Replay

    val next = neighbor(
        order = order,
        currentTrackUid = currentTrackUid,
        delta = 1,
        wrap = repeatMode == RepeatMode.ALL
    ) ?: return TakeEndAction.Stop

    // A single-take song under repeat-all wraps onto itself; that is a replay, not a reload.
    return if (next == currentTrackUid) TakeEndAction.Replay else TakeEndAction.PlayTake(next)
}

/**
 * The sequence the player walks the takes in: [takeUids] as listed when [shuffle] is off, a
 * permutation of them when it is on (docs/screens/player.md v14: "When on, 'next' draws from a
 * shuffled permutation of the takes rather than their listed order. Turning it off restores listed
 * order from the current take.").
 *
 * The permutation is **seeded**, so it is deterministic and therefore unit-testable: the caller
 * holds one seed per shuffle session, which keeps the order stable while shuffle stays on instead of
 * re-rolling on every `next`.
 */
fun playOrder(takeUids: List<String>, shuffle: Boolean, seed: Long): List<String> =
    if (shuffle) takeUids.shuffled(Random(seed)) else takeUids.toList()

/**
 * The uid [delta] steps from [currentTrackUid] in [order] -- the previous/next transport, and the
 * step half of [resolveTakeEndAction].
 *
 * Returns `null` when [currentTrackUid] isn't in [order], and when the step falls off either end
 * with [wrap] off. With [wrap] on the index wraps in both directions, so `previous` from the first
 * take lands on the last.
 */
fun neighbor(order: List<String>, currentTrackUid: String, delta: Int, wrap: Boolean): String? {
    if (order.isEmpty()) return null
    val index = order.indexOf(currentTrackUid)
    if (index < 0) return null

    val target = index + delta
    if (target in order.indices) return order[target]
    if (!wrap) return null
    // Kotlin's % keeps the sign of the dividend, so normalize into 0..size-1 for negative deltas.
    return order[((target % order.size) + order.size) % order.size]
}
