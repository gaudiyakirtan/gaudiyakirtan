package com.gaudiyakirtan.ui.screenshot

import androidx.activity.ComponentActivity
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.ui.test.onRoot
import com.github.takahirom.roborazzi.captureRoboImage
import com.gaudiyakirtan.data.SongJson
import com.gaudiyakirtan.data.TestAssets
import com.gaudiyakirtan.myapplication.models.Song
import com.gaudiyakirtan.myapplication.ui.collections.CollectionsScreen
import com.gaudiyakirtan.myapplication.ui.home.HomeScreen
import com.gaudiyakirtan.myapplication.ui.library.LibraryScreen
import com.gaudiyakirtan.myapplication.ui.player.MiniPlayerBar
import com.gaudiyakirtan.myapplication.ui.player.PlayerScreen
import com.gaudiyakirtan.myapplication.ui.search.SearchScreen
import com.gaudiyakirtan.myapplication.ui.settings.SettingsScreen
import com.gaudiyakirtan.myapplication.ui.song.SongScreen
import com.gaudiyakirtan.myapplication.ui.song.SongViewModel
import com.gaudiyakirtan.myapplication.ui.theme.GaudiyaKirtanTheme
import com.gaudiyakirtan.services.NowPlaying
import com.gaudiyakirtan.services.PlaybackState
import com.gaudiyakirtan.services.PlayerUiState
import java.io.File
import kotlinx.serialization.decodeFromString
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

/**
 * Renders each screen to a PNG under `docs/screenshots/android/`.
 *
 * These are review artifacts, not assertions — they exist so a reviewer can see what the expressive
 * migration actually looks like in both palettes. No emulator can boot in this environment, so the
 * frames come from Robolectric's native graphics mode via Roborazzi.
 *
 * Regenerate with:
 *   ./gradlew :app:testDebugUnitTest --tests "*ScreenshotTest*" -Proborazzi.test.record=true
 */
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [34], qualifiers = "w411dp-h915dp-xhdpi")
class ScreenshotTest {

    @get:Rule
    val composeRule = createAndroidComposeRule<ComponentActivity>()

    private val outDir = "../../docs/screenshots/android"

    private fun capture(name: String, darkTheme: Boolean, content: @Composable () -> Unit) {
        composeRule.setContent {
            GaudiyaKirtanTheme(darkTheme = darkTheme) {
                Surface(modifier = Modifier.fillMaxSize()) { content() }
            }
        }
        composeRule.waitForIdle()
        val palette = if (darkTheme) "shyam" else "gaura"
        composeRule.onRoot().captureRoboImage("$outDir/$name-$palette.png")
    }

    private fun playerState(playbackState: PlaybackState): PlayerUiState {
        val song: Song = SongJson.instance.decodeFromString(
            File(TestAssets.dir, "songs/R8.json").readText()
        )
        return PlayerUiState(
            nowPlaying = NowPlaying(song, song.audioFiles.first(), song.audioFiles),
            playbackState = playbackState,
            positionMs = 42_000,
            durationMs = 187_000
        )
    }

    @Composable
    private fun Player(playbackState: PlaybackState = PlaybackState.PLAYING) = PlayerScreen(
        uiState = playerState(playbackState),
        onBackClick = {},
        onPlayPauseClick = {},
        onSeek = {},
        onTrackSelected = {}
    )

    @Test fun `home gaura`() = capture("home", false) { HomeScreen() }
    @Test fun `home shyam`() = capture("home", true) { HomeScreen() }

    @Test fun `library gaura`() = capture("library", false) { LibraryScreen() }
    @Test fun `library shyam`() = capture("library", true) { LibraryScreen() }

    @Test fun `search gaura`() = capture("search", false) { SearchScreen() }
    @Test fun `search shyam`() = capture("search", true) { SearchScreen() }

    @Test fun `collections gaura`() = capture("collections", false) { CollectionsScreen() }
    @Test fun `collections shyam`() = capture("collections", true) { CollectionsScreen() }

    @Test fun `settings gaura`() = capture("settings", false) { SettingsScreen(onBackClick = {}) }
    @Test fun `settings shyam`() = capture("settings", true) { SettingsScreen(onBackClick = {}) }

    // The focal screen. Captured playing (wavy scrubber, squircle control) and paused (flat
    // scrubber, circular control) so the state language is visible side by side.
    @Test fun `player playing gaura`() = capture("player-playing", false) { Player() }
    @Test fun `player playing shyam`() = capture("player-playing", true) { Player() }
    @Test fun `player paused gaura`() = capture("player-paused", false) { Player(PlaybackState.PAUSED) }
    @Test fun `player paused shyam`() = capture("player-paused", true) { Player(PlaybackState.PAUSED) }

    @Test fun `mini player gaura`() = capture("mini-player", false) {
        MiniPlayerBar(playerState(PlaybackState.PLAYING), onExpandClick = {}, onPlayPauseClick = {})
    }
    @Test fun `mini player shyam`() = capture("mini-player", true) {
        MiniPlayerBar(playerState(PlaybackState.PLAYING), onExpandClick = {}, onPlayPauseClick = {})
    }

    // Song detail — the reading surface, and the screen the corpus actually exists for. R8 is a
    // real song off the bundled corpus, so these show live verses rather than filler.
    @Composable
    private fun Song(uid: String = "R8") = SongScreen(
        viewModel = viewModel(key = "song/$uid", factory = SongViewModel.factory(uid)),
        onBackClick = {},
        onPlayClick = {},
        onAuthorClick = {}
    )

    @Test fun `song gaura`() = capture("song", false) { Song() }
    @Test fun `song shyam`() = capture("song", true) { Song() }

    /**
     * The mini player as it actually appears: pinned under a screen, the way AppNavigation's
     * Scaffold places it. Captured over both a song and a list screen, because "outside the song"
     * is the case where it has to coexist with the tab bar rather than a reading surface.
     */
    @Composable
    private fun WithMiniPlayer(content: @Composable () -> Unit) {
        Column(modifier = Modifier.fillMaxSize()) {
            Box(modifier = Modifier.weight(1f)) { content() }
            MiniPlayerBar(
                uiState = playerState(PlaybackState.PLAYING),
                onExpandClick = {},
                onPlayPauseClick = {}
            )
        }
    }

    @Test fun `song with mini player gaura`() =
        capture("song-with-mini-player", false) { WithMiniPlayer { Song() } }
    @Test fun `song with mini player shyam`() =
        capture("song-with-mini-player", true) { WithMiniPlayer { Song() } }

    @Test fun `home with mini player gaura`() =
        capture("home-with-mini-player", false) { WithMiniPlayer { HomeScreen() } }
    @Test fun `home with mini player shyam`() =
        capture("home-with-mini-player", true) { WithMiniPlayer { HomeScreen() } }
}
