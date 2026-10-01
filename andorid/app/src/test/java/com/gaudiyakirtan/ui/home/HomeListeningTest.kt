package com.gaudiyakirtan.ui.home

import android.provider.Settings
import androidx.compose.runtime.*
import androidx.compose.ui.semantics.SemanticsProperties
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.unit.dp
import androidx.test.core.app.ApplicationProvider
import com.gaudiyakirtan.myapplication.models.*
import com.gaudiyakirtan.myapplication.ui.home.HomeContent
import com.gaudiyakirtan.myapplication.ui.theme.GaudiyaKirtanTheme
import com.gaudiyakirtan.services.*
import org.junit.Assert.*
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

    @Test fun `reading and suggested playback use separate callbacks without optimistic state or progress`() {
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
        compose.onNodeWithText("Play recording").assertExists()
        compose.onNodeWithTag("listen-play").assertHeightIsAtLeast(48.dp).assertWidthIsAtLeast(48.dp).performClick()
        assertEquals(song, requested)
        assertEquals(0, toggles)
        compose.onNodeWithTag("listen-play").assert(SemanticsMatcher.expectValue(SemanticsProperties.StateDescription, "Ready"))
        compose.onNodeWithTag("listen-song").assertHeightIsAtLeast(48.dp).performClick()
        assertEquals(song.uid, opened)
        compose.onAllNodes(SemanticsMatcher.keyIsDefined(SemanticsProperties.ProgressBarRangeInfo)).assertCountEquals(0)
        compose.onNodeWithText("0:00").assertDoesNotExist()
        compose.onAllNodes(SemanticsMatcher.keyIsDefined(SemanticsProperties.Heading)).assertCountEquals(1)
    }

    @Test fun `matching player supplies take and pause resume while unrelated states never hijack the feature`() {
        val song = HomeFixtures.listen
        val other = HomeFixtures.anotherRecording
        var state by mutableStateOf(PlayerUiState(NowPlaying(song, song.audioFiles[1], song.audioFiles), PlaybackState.PLAYING))
        var requested: Song? = null
        var toggles = 0
        compose.setContent {
            GaudiyaKirtanTheme(false) {
                HomeContent(listenSong = song, playerUiState = state,
                    onPlaySong = { requested = it }, onPlayPause = { toggles++ })
            }
        }
        compose.onNodeWithText("Recording · ${song.audioFiles[1].artist}").assertExists()
        compose.onNodeWithText("Pause").performClick()
        assertEquals(1, toggles)
        compose.runOnIdle { state = state.copy(playbackState = PlaybackState.PAUSED) }
        compose.onNodeWithText("Resume").performClick()
        assertEquals(2, toggles)
        PlaybackState.entries.forEach { playback ->
            compose.runOnIdle { state = PlayerUiState(NowPlaying(other, other.audioFiles.first(), other.audioFiles), playback) }
            compose.onNodeWithText(song.titleMain.preferredText("Latn")).assertExists()
            compose.onNodeWithText(other.titleMain.preferredText("Latn")).assertDoesNotExist()
            compose.onNodeWithText("Recording · ${song.audioFiles.first().artist}").assertExists()
            compose.onNodeWithTag("listen-play").assertIsEnabled().performClick()
            assertEquals(song, requested)
            assertEquals(2, toggles)
        }
    }

    @Test fun `loading prevents duplicate requests and error keeps reading usable with retry`() {
        val song = HomeFixtures.listen
        var state by mutableStateOf(PlayerUiState(NowPlaying(song, song.audioFiles.first(), song.audioFiles), PlaybackState.LOADING))
        var starts = 0
        var reads = 0
        compose.setContent {
            GaudiyaKirtanTheme(false) {
                HomeContent(playerUiState = state, onPlaySong = { starts++ }, onPlayPause = { starts++ },
                    listenSong = song, onSongClick = { reads++ })
            }
        }
        compose.onNodeWithTag("listen-play").assertIsNotEnabled()
        compose.onNodeWithTag("listen-song").assertIsEnabled().performClick()
        compose.runOnIdle { state = state.copy(playbackState = PlaybackState.ERROR, errorMessage = "Audio unavailable") }
        compose.onNodeWithText("Retry").assertIsEnabled().performClick()
        compose.onNodeWithTag("listen-song").assertIsEnabled().performClick()
        assertEquals(1, starts)
        assertEquals(2, reads)
        compose.onAllNodes(SemanticsMatcher.keyIsDefined(SemanticsProperties.LiveRegion)).assertCountEquals(0)
    }

    @Test fun `missing audio keeps reading available and live script changes`() {
        var song by mutableStateOf(HomeFixtures.featured.copy(audioFiles = emptyList()))
        var language by mutableStateOf("Latn")
        var opened = ""
        compose.setContent {
            GaudiyaKirtanTheme(false) {
                HomeContent(listenSong = song, settings = AppSettings(listLanguage = language), onSongClick = { opened = it })
            }
        }
        compose.onNodeWithTag("listen-play").assertDoesNotExist()
        compose.onNodeWithTag("listen-song").performClick()
        assertEquals(song.uid, opened)
        compose.runOnIdle { song = HomeFixtures.listen; language = "Beng" }
        compose.onNodeWithText(song.titleMain.preferredText("Beng")).assertExists()
        compose.onNodeWithTag("listen-play").assertIsEnabled()
    }

    @Test fun `empty recommendation opens existing library even when an unrelated song is loaded`() {
        var opened = 0
        val song = HomeFixtures.listen
        compose.setContent {
            GaudiyaKirtanTheme(false) {
                HomeContent(onBrowseRecordings = { opened++ }, playerUiState = PlayerUiState(
                    NowPlaying(song, song.audioFiles.first(), song.audioFiles), PlaybackState.PLAYING))
            }
        }
        compose.onNodeWithText("Open library").performClick()
        assertEquals(1, opened)
        compose.onNodeWithTag("listen-play").assertDoesNotExist()
    }

    @Test fun `system disabled animations keep playback commands and immediate state semantics`() {
        val context = ApplicationProvider.getApplicationContext<android.content.Context>()
        Settings.Global.putFloat(context.contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE, 0f)
        val song = HomeFixtures.listen
        var state by mutableStateOf(PlayerUiState(NowPlaying(song, song.audioFiles.first(), song.audioFiles), PlaybackState.PAUSED))
        compose.setContent {
            GaudiyaKirtanTheme(false) { HomeContent(listenSong = song, playerUiState = state,
                onPlayPause = { state = state.copy(playbackState = PlaybackState.PLAYING) }) }
        }
        compose.onNodeWithText("Resume").performClick()
        compose.onNodeWithText("Pause").assertExists()
        compose.onNodeWithTag("listen-play").assert(SemanticsMatcher.expectValue(SemanticsProperties.StateDescription, "Playing"))
    }
}
