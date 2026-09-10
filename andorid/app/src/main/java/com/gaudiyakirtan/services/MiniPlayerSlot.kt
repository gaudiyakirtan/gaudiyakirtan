package com.gaudiyakirtan.services

/**
 * Pure resolution of **what the mini-player slot shows** (docs/screens/player.md v15, "The
 * mini-player is never empty").
 *
 * Kept **free of every Android import** -- no `Context`, no Compose, no `MediaPlayer` -- for the same
 * reason [resolveTakeEndAction] is (see `TakeQueue.kt`): the precedence rule is the only interesting
 * part of the change, and it belongs where a plain JVM JUnit test can reach it (see
 * `app/src/test/.../services/MiniPlayerSlotTest.kt`). iOS carries the same
 * `resolveMiniPlayerSlot` concept under the same name.
 *
 * The slot has exactly three shapes, matching the spec's table row for row.
 */

/**
 * The last song the reader opened, rehydrated from the bundled corpus (never from prefs -- only its
 * uid is persisted, see [com.gaudiyakirtan.data.LastVisitedRepository]).
 *
 * [author] is the song's **composer**, not a reciter: no take is chosen in the resting state, so
 * there is no reciter to name (docs/screens/player.md v15 "It is not a track"; docs/screens/tracks.md
 * "reciter vs author"). [audioAvailable] is what splits the bar's trailing affordance between a play
 * control and an open-song chevron.
 */
data class LastVisitedSong(
    val uid: String,
    val title: String,
    val author: String,
    val audioAvailable: Boolean
)

/** What the mini-player slot renders. One of these always holds outside song-detail. */
sealed interface MiniPlayerSlot {

    /**
     * The track state: a take is loaded -- playing, paused, loading or errored -- so the bar is the
     * player's, with the reciter credit and a play/pause transport. The loaded take is read from
     * [PlayerUiState] directly; this object only records that the player won the slot.
     */
    data object Playing : MiniPlayerSlot

    /**
     * The resting state: nothing is loaded, but [song] was opened at some point. Same bar, same
     * height, the composer's credit, and a single play affordance rather than a transport.
     */
    data class Resting(val song: LastVisitedSong) : MiniPlayerSlot

    /** A fresh install where no song has ever been opened -- there is genuinely nothing to resume. */
    data object Absent : MiniPlayerSlot
}

/**
 * The precedence rule, whole (docs/screens/player.md v15): **whatever is loaded in the player wins**;
 * the last-visited song only fills the slot when the player is empty.
 *
 * [playbackState] matters independently of [nowPlaying] because a song with no playable take leaves
 * the player in [PlaybackState.ERROR] with nothing loaded (see [PlayerViewModel.play]) -- that is
 * still the player occupying the slot with its "audio unavailable" message, and quietly replacing it
 * with the resting bar would swallow the failure the reader just caused.
 */
fun resolveMiniPlayerSlot(
    nowPlaying: NowPlaying?,
    playbackState: PlaybackState,
    lastVisited: LastVisitedSong?
): MiniPlayerSlot = when {
    nowPlaying != null || playbackState == PlaybackState.ERROR -> MiniPlayerSlot.Playing
    lastVisited != null -> MiniPlayerSlot.Resting(lastVisited)
    else -> MiniPlayerSlot.Absent
}
