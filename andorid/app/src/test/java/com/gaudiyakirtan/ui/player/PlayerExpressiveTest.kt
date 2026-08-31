package com.gaudiyakirtan.ui.player

import androidx.compose.ui.semantics.SemanticsActions
import androidx.compose.ui.semantics.SemanticsProperties
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule

import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.SemanticsMatcher
import com.gaudiyakirtan.data.SongJson
import com.gaudiyakirtan.data.TestAssets
import com.gaudiyakirtan.myapplication.models.Song
import com.gaudiyakirtan.myapplication.ui.player.MiniPlayerBar
import com.gaudiyakirtan.myapplication.ui.player.PlayerScreen
import com.gaudiyakirtan.myapplication.ui.theme.GaudiyaKirtanTheme
import com.gaudiyakirtan.services.NowPlaying
import com.gaudiyakirtan.services.PlaybackState
import com.gaudiyakirtan.services.PlayerUiState
import java.io.File
import kotlinx.serialization.decodeFromString
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

/**
 * Behavioral coverage for the player's expressive migration (docs/screens/theme.md v2, "Motion").
 *
 * The contract these protect is the accessibility one: the scrubber's bar silhouette is decorative
 * and announces nothing, so a real transparent `Slider` is layered over it to keep seek, keyboard
 * and TalkBack semantics. If someone later "simplifies"
 * that by dropping the Slider, the screen silently stops being operable by assistive tech — these
 * tests fail instead.
 */
@RunWith(RobolectricTestRunner::class)
// A realistic phone window. Robolectric's default is small enough that the playback controls fall
// below the fold and `assertIsDisplayed` fails on a screen that is perfectly fine on a real device.
@Config(sdk = [34], qualifiers = "w411dp-h1000dp")
class PlayerExpressiveTest {

    @get:Rule
    val composeRule = createComposeRule()

    /** A real song off the bundled corpus, so the state under test is the shape production uses. */
    private fun nowPlaying(): NowPlaying {
        val song: Song = SongJson.instance.decodeFromString(
            File(TestAssets.dir, "songs/R8.json").readText()
        )
        return NowPlaying(song = song, track = song.audioFiles.first(), availableTracks = song.audioFiles)
    }

    private fun state(playbackState: PlaybackState) = PlayerUiState(
        nowPlaying = nowPlaying(),
        playbackState = playbackState,
        positionMs = 30_000,
        durationMs = 120_000
    )

    private fun setPlayer(playbackState: PlaybackState) {
        composeRule.setContent {
            GaudiyaKirtanTheme(darkTheme = false) {
                PlayerScreen(
                    uiState = state(playbackState),
                    onBackClick = {},
                    onPlayPauseClick = {},
                    onSeek = {},
                    onTrackSelected = {}
                )
            }
        }
        composeRule.waitForIdle()
    }

    /** Matches the seek control: a node exposing Material's set-progress action. */
    private val isSeekable = SemanticsMatcher.keyIsDefined(SemanticsActions.SetProgress)

    /** Matches anything announcing a progress range — the thing a screen reader reads out. */
    private val announcesProgress = SemanticsMatcher.keyIsDefined(SemanticsProperties.ProgressBarRangeInfo)

    @Test
    fun `the waveform scrubber keeps a real seek control underneath it`() {
        setPlayer(PlaybackState.PLAYING)

        assertEquals(
            "the player must expose exactly one seekable control — the waveform bars are decoration",
            1,
            composeRule.onAllNodes(matcher = isSeekable).fetchSemanticsNodes().size
        )
    }

    @Test
    fun `the decorative waveform does not announce a second progress bar`() {
        setPlayer(PlaybackState.PLAYING)

        // The Slider announces its own range; the indicator clears its semantics. More than one
        // would mean a screen reader reads the same position twice.
        assertEquals(
            "only the Slider may announce progress",
            1,
            composeRule.onAllNodes(matcher = announcesProgress).fetchSemanticsNodes().size
        )
    }

    @Test
    fun `the play control announces Pause while playing`() {
        setPlayer(PlaybackState.PLAYING)
        composeRule.onNodeWithContentDescription("Pause").assertIsDisplayed()
    }

    @Test
    fun `the play control announces Play while paused`() {
        setPlayer(PlaybackState.PAUSED)
        composeRule.onNodeWithContentDescription("Play").assertIsDisplayed()
    }

    @Test
    fun `the mini bar's wavy indicator is silent to assistive tech`() {
        composeRule.setContent {
            GaudiyaKirtanTheme(darkTheme = false) {
                MiniPlayerBar(
                    uiState = state(PlaybackState.PLAYING),
                    onExpandClick = {},
                    onPlayPauseClick = {}
                )
            }
        }
        composeRule.waitForIdle()

        // The full player owns the announced position. The bar's semantics stay "expand" +
        // "play/pause"; its progress line is cleared, so nothing here announces a range.
        assertEquals(
            "the mini bar must not announce progress — the Now Playing screen does",
            0,
            composeRule.onAllNodes(matcher = announcesProgress).fetchSemanticsNodes().size
        )
        composeRule.onNodeWithContentDescription("Pause").assertIsDisplayed()
    }
}
