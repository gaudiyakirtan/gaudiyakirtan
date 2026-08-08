package com.gaudiyakirtan.screenshot

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onRoot
import com.github.takahirom.roborazzi.captureRoboImage
import com.gaudiyakirtan.data.SongJson
import com.gaudiyakirtan.data.TestAssets
import com.gaudiyakirtan.myapplication.models.Song
import com.gaudiyakirtan.myapplication.models.author
import com.gaudiyakirtan.myapplication.models.title
import com.gaudiyakirtan.myapplication.ui.player.MiniPlayerBar
import com.gaudiyakirtan.services.LastVisitedSong
import com.gaudiyakirtan.services.NowPlaying
import com.gaudiyakirtan.services.PlaybackState
import com.gaudiyakirtan.services.PlayerUiState
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
 * The v15 mini-player slot (docs/screens/player.md v15, "The mini-player is never empty") in both
 * palettes: the **resting** bar -- last visited song, its **author**, a single play affordance -- and
 * the **playing** bar beside it for comparison, so the two can be checked to be the same furniture at
 * the same height with only the credit and the control differing.
 *
 * Built off a real corpus song (`A10`) rather than a fixture, so the shots show a genuine title and a
 * genuine composer/reciter pair. State is hand-built rather than driven through
 * [com.gaudiyakirtan.services.PlayerViewModel] / navigation: these are layout shots, and a
 * `MediaPlayer` would need a network and a device.
 */
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
// A phone-wide but short viewport: the bar is 56dp, so a full 891dp screen would be mostly empty.
@Config(sdk = [34], qualifiers = "w411dp-h120dp-xhdpi")
class MiniPlayerScreenshotTest {

    @get:Rule val compose = createComposeRule()

    @OptIn(ExperimentalSerializationApi::class)
    private fun song(uid: String): Song =
        File(TestAssets.dir, "songs/$uid.json").inputStream()
            .use { SongJson.instance.decodeFromStream(it) }

    /** The resting state's model: uid only is persisted, everything here is rehydrated from the corpus. */
    private fun resting(uid: String = "A10"): LastVisitedSong {
        val song = song(uid)
        return LastVisitedSong(
            uid = song.uid,
            title = song.title,
            author = song.author,
            audioAvailable = song.audioAvailable
        )
    }

    @Test
    fun `mini player resting gaura`() {
        compose.setContent {
            ScreenshotSurface(darkTheme = false) {
                MiniPlayerBar(
                    uiState = PlayerUiState(),
                    onExpandClick = {},
                    onPlayPauseClick = {},
                    lastVisited = resting()
                )
            }
        }
        compose.waitForIdle()
        compose.onRoot().captureRoboImage("build/screenshots/miniplayer-resting-gaura.png")
    }

    @Test
    fun `mini player resting shyam`() {
        compose.setContent {
            ScreenshotSurface(darkTheme = true) {
                MiniPlayerBar(
                    uiState = PlayerUiState(),
                    onExpandClick = {},
                    onPlayPauseClick = {},
                    lastVisited = resting()
                )
            }
        }
        compose.waitForIdle()
        compose.onRoot().captureRoboImage("build/screenshots/miniplayer-resting-shyam.png")
    }

    /** The track state, for comparison: same bar, same height, reciter credit, pause transport. */
    @Test
    fun `mini player playing gaura`() {
        val song = song("A10")
        compose.setContent {
            ScreenshotSurface(darkTheme = false) {
                MiniPlayerBar(
                    uiState = PlayerUiState(
                        nowPlaying = NowPlaying(
                            song = song,
                            track = song.audioFiles[3],
                            availableTracks = song.audioFiles
                        ),
                        playbackState = PlaybackState.PLAYING,
                        positionMs = 72_000,
                        durationMs = 245_000,
                        playOrder = song.audioFiles.map { it.uid }
                    ),
                    onExpandClick = {},
                    onPlayPauseClick = {},
                    // Present but outranked -- the player wins the slot (v15 precedence).
                    lastVisited = resting("N9")
                )
            }
        }
        compose.waitForIdle()
        compose.onRoot().captureRoboImage("build/screenshots/miniplayer-playing-gaura.png")
    }
}
