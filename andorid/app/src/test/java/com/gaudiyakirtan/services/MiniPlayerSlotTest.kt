package com.gaudiyakirtan.services

import com.gaudiyakirtan.myapplication.models.AudioTrack
import com.gaudiyakirtan.myapplication.models.ScriptText
import com.gaudiyakirtan.myapplication.models.Song
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Unit tests for [resolveMiniPlayerSlot] -- the pure precedence rule behind the v15 mini-player
 * (docs/screens/player.md v15, "The mini-player is never empty").
 *
 * The drift these guard against is the precedence quietly inverting. The spec's rule is one line --
 * **whatever is loaded in the player wins**, and the last-visited song only fills the gap -- and it
 * is exactly the rule that is easy to break later: a resting bar that outranks a loaded take would
 * show the wrong song's title over live audio, and a resting bar that pre-empted the *error* state
 * would silently swallow the "audio unavailable" message the reader just triggered (that state
 * carries no `nowPlaying`, so it looks empty unless you check [PlaybackState]). They also pin the
 * two ends: the slot is absent only on a fresh install, and a song with no audio still occupies it
 * (with `audioAvailable = false`, which is what swaps the play control for an open-song chevron).
 */
class MiniPlayerSlotTest {

    private fun song(uid: String, takes: List<AudioTrack> = listOf(AudioTrack("t1", "$uid-1.mp3"))) =
        Song(
            uid = uid,
            languageOfOrigin = "bn",
            titleMain = listOf(ScriptText(scriptCode = "Latn", text = "Title of $uid")),
            authorUid = "bhaktivinoda-thakura",
            authorDisplay = listOf(ScriptText(scriptCode = "Latn", text = "Bhaktivinoda Ṭhākura")),
            verses = emptyList(),
            audioAvailable = takes.isNotEmpty(),
            audioFiles = takes
        )

    private fun nowPlaying(uid: String = "A10"): NowPlaying {
        val song = song(uid)
        return NowPlaying(song = song, track = song.audioFiles.first(), availableTracks = song.audioFiles)
    }

    private val lastVisited = LastVisitedSong(
        uid = "N9",
        title = "Śrī Nāma-kīrtana",
        author = "Bhaktivinoda Ṭhākura",
        audioAvailable = true
    )

    // --- precedence: the player always wins ------------------------------------------------------

    @Test
    fun `a loaded take wins over the last visited song`() {
        // Both are present -- the bar must be the player's, not the reader's history.
        for (state in listOf(PlaybackState.PLAYING, PlaybackState.PAUSED, PlaybackState.LOADING)) {
            assertEquals(
                MiniPlayerSlot.Playing,
                resolveMiniPlayerSlot(nowPlaying(), state, lastVisited)
            )
        }
    }

    @Test
    fun `a loaded take holds the slot even with no last visited song`() {
        assertEquals(
            MiniPlayerSlot.Playing,
            resolveMiniPlayerSlot(nowPlaying(), PlaybackState.PLAYING, lastVisited = null)
        )
    }

    @Test
    fun `the error state still counts as loaded`() {
        // An unplayable song leaves nowPlaying null but the player in ERROR (PlayerViewModel.play).
        // That is still the player occupying the slot with "audio unavailable".
        assertEquals(
            MiniPlayerSlot.Playing,
            resolveMiniPlayerSlot(nowPlaying = null, playbackState = PlaybackState.ERROR, lastVisited = lastVisited)
        )
        assertEquals(
            MiniPlayerSlot.Playing,
            resolveMiniPlayerSlot(nowPlaying = null, playbackState = PlaybackState.ERROR, lastVisited = null)
        )
    }

    // --- the resting state fills the gap ---------------------------------------------------------

    @Test
    fun `the last visited song fills an empty player`() {
        assertEquals(
            MiniPlayerSlot.Resting(lastVisited),
            resolveMiniPlayerSlot(nowPlaying = null, playbackState = PlaybackState.IDLE, lastVisited = lastVisited)
        )
    }

    @Test
    fun `a last visited song with no audio still occupies the slot`() {
        // The reader was there, so it is still the way back -- only the trailing affordance changes,
        // which the bar decides from this flag (play control vs open-song chevron).
        val silent = lastVisited.copy(uid = "MS24", audioAvailable = false)
        val slot = resolveMiniPlayerSlot(
            nowPlaying = null,
            playbackState = PlaybackState.IDLE,
            lastVisited = silent
        )
        assertEquals(MiniPlayerSlot.Resting(silent), slot)
        assertTrue(slot is MiniPlayerSlot.Resting && !slot.song.audioAvailable)
    }

    @Test
    fun `the resting state survives every non-error idle playback state`() {
        // Nothing loaded is nothing loaded, however the player got there.
        for (state in listOf(PlaybackState.IDLE, PlaybackState.PAUSED, PlaybackState.LOADING)) {
            assertEquals(
                MiniPlayerSlot.Resting(lastVisited),
                resolveMiniPlayerSlot(nowPlaying = null, playbackState = state, lastVisited = lastVisited)
            )
        }
    }

    // --- absent ----------------------------------------------------------------------------------

    @Test
    fun `the slot is absent only when nothing has ever been loaded or opened`() {
        assertEquals(
            MiniPlayerSlot.Absent,
            resolveMiniPlayerSlot(nowPlaying = null, playbackState = PlaybackState.IDLE, lastVisited = null)
        )
    }

    @Test
    fun `an absent slot is never produced while either input is present`() {
        // Belt-and-braces against a future edit that adds a condition and drops the bar entirely:
        // once either half exists, the slot must render something.
        val inputs = listOf<Pair<NowPlaying?, LastVisitedSong?>>(
            nowPlaying() to lastVisited,
            nowPlaying() to null,
            null to lastVisited
        )
        for ((playing, visited) in inputs) {
            for (state in PlaybackState.entries) {
                assertTrue(
                    "slot went absent for state=$state playing=${playing != null} visited=${visited != null}",
                    resolveMiniPlayerSlot(playing, state, visited) != MiniPlayerSlot.Absent
                )
            }
        }
    }
}
