package com.gaudiyakirtan.screenshot

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onRoot
import androidx.lifecycle.viewmodel.compose.viewModel
import com.github.takahirom.roborazzi.captureRoboImage
import com.gaudiyakirtan.data.SongJson
import com.gaudiyakirtan.data.TestAssets
import com.gaudiyakirtan.myapplication.models.Song
import com.gaudiyakirtan.myapplication.ui.player.PlayerScreen
import com.gaudiyakirtan.myapplication.ui.song.SongScreen
import com.gaudiyakirtan.myapplication.ui.song.SongViewModel
import com.gaudiyakirtan.services.NowPlaying
import com.gaudiyakirtan.services.PlaybackState
import com.gaudiyakirtan.services.PlayerUiState
import com.gaudiyakirtan.services.RepeatMode
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.json.decodeFromStream
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import java.io.File

/**
 * Renders the v14 Now Playing modal (docs/screens/player.md v14) in both palettes off a *real*
 * multi-take song -- `A10` ships 9 takes -- so the shots show the actual take count in the actions
 * row and a real reciter credit rather than a fixture. Also captures the song screen with the
 * toolbar's now-playing pill (song-detail.md v7), which is the other half of the v14 change.
 *
 * The state is built directly rather than through [com.gaudiyakirtan.services.PlayerViewModel]:
 * these are layout shots, and a `MediaPlayer` would need a network and a device.
 */
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [34], qualifiers = "w411dp-h891dp-xhdpi")
class PlayerScreenshotTest {

    @get:Rule val compose = createComposeRule()

    @OptIn(ExperimentalSerializationApi::class)
    private fun song(uid: String): Song =
        File(TestAssets.dir, "songs/$uid.json").inputStream()
            .use { SongJson.instance.decodeFromStream(it) }

    /** Mid-take playback of a real 9-take song: 1:12 elapsed of 4:05, so the scrubber shows -2:53. */
    private fun state(
        uid: String,
        trackIndex: Int = 3,
        shuffle: Boolean = false,
        repeatMode: RepeatMode = RepeatMode.OFF
    ): PlayerUiState {
        val song = song(uid)
        return PlayerUiState(
            nowPlaying = NowPlaying(
                song = song,
                track = song.audioFiles[trackIndex],
                availableTracks = song.audioFiles
            ),
            playbackState = PlaybackState.PLAYING,
            positionMs = 72_000,
            durationMs = 245_000,
            shuffle = shuffle,
            repeatMode = repeatMode,
            playOrder = song.audioFiles.map { it.uid }
        )
    }

    @Test
    fun `now playing gaura`() {
        compose.setContent {
            ScreenshotSurface(darkTheme = false) {
                PlayerScreen(
                    uiState = state("A10"),
                    onPlayPauseClick = {},
                    onSeek = {},
                    onTrackSelected = {}
                )
            }
        }
        compose.waitForIdle()
        compose.onRoot().captureRoboImage("build/screenshots/player-v14-gaura.png")
    }

    @Test
    fun `now playing shyam`() {
        compose.setContent {
            ScreenshotSurface(darkTheme = true) {
                PlayerScreen(
                    uiState = state("A10"),
                    onPlayPauseClick = {},
                    onSeek = {},
                    onTrackSelected = {}
                )
            }
        }
        compose.waitForIdle()
        compose.onRoot().captureRoboImage("build/screenshots/player-v14-shyam.png")
    }

    /** The other half of the transport row: shuffle and repeat lit in the accent token. */
    @Test
    fun `now playing gaura with shuffle and repeat one`() {
        compose.setContent {
            ScreenshotSurface(darkTheme = false) {
                PlayerScreen(
                    uiState = state("A10", shuffle = true, repeatMode = RepeatMode.ONE),
                    onPlayPauseClick = {},
                    onSeek = {},
                    onTrackSelected = {}
                )
            }
        }
        compose.waitForIdle()
        compose.onRoot().captureRoboImage("build/screenshots/player-v14-gaura-shuffle-repeat-one.png")
    }

    /**
     * Song detail with the toolbar pill (docs/screens/player.md v14 "The reader gets a pill, not a
     * bar"): a take is loaded and playing, so the pill shows its title + reciter and a pause control.
     */
    @Test
    fun `song screen pill gaura`() {
        compose.setContent {
            ScreenshotSurface(darkTheme = false) {
                SongScreen(
                    viewModel = viewModel(factory = SongViewModel.factory("A10")),
                    onBackClick = {},
                    playerUiState = state("A10")
                )
            }
        }
        compose.waitForIdle()
        compose.onRoot().captureRoboImage("build/screenshots/song-pill-gaura.png")
    }
}
