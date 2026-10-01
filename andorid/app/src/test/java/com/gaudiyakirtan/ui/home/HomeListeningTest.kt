package com.gaudiyakirtan.ui.home

import android.content.Context
import androidx.compose.runtime.*
import androidx.compose.ui.semantics.SemanticsProperties
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.unit.dp
import androidx.test.core.app.ApplicationProvider
import coil3.ImageLoader
import coil3.SingletonImageLoader
import coil3.intercept.Interceptor
import coil3.request.ErrorResult
import com.gaudiyakirtan.myapplication.models.*
import com.gaudiyakirtan.myapplication.ui.home.HomeContent
import com.gaudiyakirtan.myapplication.ui.theme.GaudiyaKirtanTheme
import com.gaudiyakirtan.services.*
import org.junit.Assert.*
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [34], qualifiers = "w390dp-h1000dp-mdpi")
class HomeListeningTest {
    @get:Rule val compose = createComposeRule()

    @OptIn(coil3.annotation.DelicateCoilApi::class)
    @Before fun offline() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        SingletonImageLoader.setUnsafe(ImageLoader.Builder(context).components {
            add(Interceptor { chain -> ErrorResult(null, chain.request, IllegalStateException("Offline test")) })
        }.build())
    }

    @Test fun `suggestion starts through supplied callback without optimistic state or stale progress`() {
        var requested: Song? = null
        var opened = ""
        var toggles = 0
        val song = HomeFixtures.listen
        compose.setContent {
            GaudiyaKirtanTheme(false) {
                HomeContent(listenSong = song, onPlaySong = { requested = it }, onPlayPause = { toggles++ },
                    onSongClick = { opened = it }, playerUiState = PlayerUiState(positionMs = 99_000, durationMs = 180_000))
            }
        }
        compose.onNodeWithText("0:00").assertExists()
        compose.onNodeWithText("ready").assertExists()
        compose.onNodeWithTag("listen-play").assertWidthIsAtLeast(48.dp).assertHeightIsAtLeast(48.dp).performClick()
        assertEquals(song, requested)
        assertEquals(0, toggles)
        compose.onNodeWithTag("listen-play").assert(SemanticsMatcher.expectValue(SemanticsProperties.StateDescription, "Ready"))
        compose.onNodeWithTag("listen-song").performClick()
        assertEquals(song.uid, opened)
    }

    @Test fun `shared player changes song take state and progress without starting another recording`() {
        val song = HomeFixtures.listen
        var state by mutableStateOf(PlayerUiState(NowPlaying(song, song.audioFiles[1], song.audioFiles),
            PlaybackState.PLAYING, 42_000, 187_000))
        var starts = 0
        var toggles = 0
        compose.setContent {
            GaudiyaKirtanTheme(false) {
                HomeContent(listenSong = HomeFixtures.anotherRecording, playerUiState = state,
                    onPlaySong = { starts++ }, onPlayPause = { toggles++ })
            }
        }
        compose.onNodeWithText(song.titleMain.preferredText("Latn")).assertExists()
        compose.onNodeWithText("${song.audioFiles.size} takes").assertExists()
        compose.onNodeWithText("0:42").assertExists()
        compose.onNodeWithText("−2:25").assertExists()
        compose.onNodeWithTag("listen-play").assert(SemanticsMatcher.expectValue(SemanticsProperties.StateDescription, "Playing")).performClick()
        assertEquals(1, toggles)
        assertEquals(0, starts)
        compose.runOnIdle { state = state.copy(playbackState = PlaybackState.PAUSED) }
        compose.onNodeWithTag("listen-play").assert(SemanticsMatcher.expectValue(SemanticsProperties.StateDescription, "Paused")).performClick()
        assertEquals(2, toggles)
        val next = HomeFixtures.anotherRecording
        compose.runOnIdle { state = PlayerUiState(NowPlaying(next, next.audioFiles.first(), next.audioFiles), PlaybackState.PLAYING) }
        compose.onNodeWithText(next.titleMain.preferredText("Latn")).assertExists()
        compose.onNodeWithText(song.titleMain.preferredText("Latn")).assertDoesNotExist()
        assertEquals(0, starts)
        compose.runOnIdle { state = PlayerUiState() }
        compose.onNodeWithTag("listen-play").assert(SemanticsMatcher.expectValue(SemanticsProperties.StateDescription, "Ready"))
    }

    @Test fun `loading prevents duplicate requests and error retries through the shared player`() {
        val song = HomeFixtures.listen
        var state by mutableStateOf(PlayerUiState(NowPlaying(song, song.audioFiles.first(), song.audioFiles), PlaybackState.LOADING))
        var starts = 0
        compose.setContent {
            GaudiyaKirtanTheme(false) {
                HomeContent(playerUiState = state, onPlaySong = { starts++ }, onPlayPause = { starts++ },
                    listenSong = song)
            }
        }
        compose.onNodeWithTag("listen-play").assertIsNotEnabled()
        compose.runOnIdle { state = state.copy(playbackState = PlaybackState.ERROR, errorMessage = "Audio unavailable") }
        compose.onNodeWithTag("listen-play").assertIsEnabled().performClick()
        assertEquals(1, starts)
        compose.onAllNodes(SemanticsMatcher.keyIsDefined(SemanticsProperties.LiveRegion)).assertCountEquals(0)
    }

    @Test fun `missing audio offers working library destination and list script stays live`() {
        var song by mutableStateOf<Song?>(HomeFixtures.featured.copy(audioFiles = emptyList()))
        var language by mutableStateOf("Latn")
        var opened = 0
        compose.setContent {
            GaudiyaKirtanTheme(false) {
                HomeContent(listenSong = song, settings = AppSettings(listLanguage = language), onBrowseRecordings = { opened++ })
            }
        }
        compose.onNodeWithTag("listen-play").assertDoesNotExist()
        compose.onNodeWithText("Open library").performClick()
        assertEquals(1, opened)
        compose.runOnIdle { song = HomeFixtures.listen; language = "Beng" }
        compose.onNodeWithText(HomeFixtures.listen.titleMain.preferredText("Beng")).assertExists()
        compose.onNodeWithTag("listen-play").assertIsEnabled()
    }
}
