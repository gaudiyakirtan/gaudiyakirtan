package com.gaudiyakirtan.ui.screenshot

import androidx.activity.ComponentActivity
import android.provider.Settings
import androidx.compose.ui.platform.LocalInputModeManager
import androidx.compose.ui.input.InputMode
import androidx.compose.ui.input.InputModeManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.SemanticsActions
import org.junit.Assert.assertTrue
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.LazyGridState
import androidx.compose.foundation.lazy.grid.rememberLazyGridState
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.unit.Density
import coil3.ImageLoader
import coil3.SingletonImageLoader
import coil3.intercept.Interceptor
import coil3.request.ErrorResult
import com.github.takahirom.roborazzi.captureRoboImage
import com.gaudiyakirtan.myapplication.models.*
import com.gaudiyakirtan.myapplication.ui.home.HomeContent
import com.gaudiyakirtan.myapplication.ui.player.MiniPlayerBar
import com.gaudiyakirtan.myapplication.ui.theme.GaudiyaKirtanTheme
import com.gaudiyakirtan.myapplication.ui.theme.neutral
import com.gaudiyakirtan.navigation.Tab
import com.gaudiyakirtan.services.*
import com.gaudiyakirtan.ui.home.HomeFixtures
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

/** Home v7 baselines, deliberately under Android. Frozen corpus dates; bundled covers and deterministic offline imagery. */
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [34], qualifiers = "w390dp-h844dp-mdpi")
class HomeScreenshotTest {
    @get:Rule val compose = createAndroidComposeRule<ComponentActivity>()

    @OptIn(coil3.annotation.DelicateCoilApi::class)
    @Before fun offlineImages() {
        // The screenshot records the real missing-cover fallback deterministically, without S3.
        SingletonImageLoader.setUnsafe(ImageLoader.Builder(compose.activity).components {
            add(Interceptor { chain -> ErrorResult(null, chain.request, IllegalStateException("Offline capture")) })
        }.build())
    }

    private fun capture(
        name: String,
        dark: Boolean,
        month: CalendarToday? = HomeFixtures.populated,
        scale: Float = 1f,
        target: String? = null,
        playback: PlaybackState = PlaybackState.PAUSED,
        active: Boolean = true,
        unrelated: Boolean = false,
        reducedMotion: Boolean = false,
        focus: Boolean = false,
        recommendation: Song? = HomeFixtures.recommendation(month),
        checkOpening: Boolean = false
    ) {
        Settings.Global.putFloat(compose.activity.contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE,
            if (reducedMotion) 0f else 1f)
        val playingSong = if (unrelated) HomeFixtures.anotherRecording else recommendation ?: HomeFixtures.listen
        val player = if (!active) PlayerUiState() else PlayerUiState(
            nowPlaying = NowPlaying(playingSong, playingSong.audioFiles.first(), playingSong.audioFiles),
            playbackState = playback, positionMs = 42_000, durationMs = 187_000
        )
        lateinit var gridState: LazyGridState
        lateinit var inputMode: InputModeManager
        compose.setContent {
            gridState = rememberLazyGridState()
            inputMode = LocalInputModeManager.current
            GaudiyaKirtanTheme(dark) {
                CompositionLocalProvider(LocalDensity provides Density(LocalDensity.current.density, scale)) {
                    Scaffold(bottomBar = {
                        Column(Modifier.testTag("bottom-obstruction")) {
                            MiniPlayerBar(player, {}, {})
                            // Same native navigation items and colors as AppNavigation, without a
                            // second player ViewModel or a clock-dependent navigation host.
                            NavigationBar(containerColor = MaterialTheme.colorScheme.background) {
                                listOf(Tab.Home, Tab.Library, Tab.Collection, Tab.Search).forEach { tab ->
                                    val selected = tab == Tab.Home
                                    NavigationBarItem(selected = selected, onClick = {}, icon = {
                                        Icon(painterResource(if (selected) tab.filledIcon else tab.outlineIcon), tab.label)
                                    }, label = { Text(tab.label) },
                                        colors = NavigationBarItemDefaults.colors(
                                            selectedIconColor = MaterialTheme.colorScheme.primary,
                                            selectedTextColor = MaterialTheme.colorScheme.primary,
                                            unselectedIconColor = MaterialTheme.colorScheme.neutral,
                                            unselectedTextColor = MaterialTheme.colorScheme.neutral,
                                            indicatorColor = MaterialTheme.colorScheme.background))
                                }
                            }
                        }
                    }) { insets ->
                        Box(Modifier.padding(insets)) {
                            HomeContent(HomeFixtures.manifest, HomeFixtures.authors, HomeFixtures.topics,
                                HomeFixtures.books, HomeFixtures.featured, month,
                                month?.let(HomeFixtures::monthSongs).orEmpty(), gridState = gridState,
                                playerUiState = player, listenSong = recommendation)
                        }
                    }
                }
            }
        }
        compose.waitForIdle()
        if (playback == PlaybackState.LOADING) {
            compose.mainClock.advanceTimeBy(300)
            compose.waitForIdle()
            compose.onNodeWithTag("listen-pending", useUnmergedTree = true).assertExists()
        }
        if (checkOpening) {
            compose.onNodeWithContentDescription("Search").assertIsDisplayed()
            compose.onNodeWithTag("listen-song").assertIsDisplayed()
            val playerTop = compose.onNodeWithTag("bottom-obstruction").fetchSemanticsNode().boundsInRoot.top
            HomeFixtures.monthSongs(month!!).take(2).forEach {
                val row = compose.onNodeWithTag("month-song-${it.uid}").assertIsDisplayed().fetchSemanticsNode().boundsInRoot
                assertTrue("Seasonal row ${it.uid} must be fully above the player: $row, player top $playerTop", row.bottom <= playerTop)
            }
        }
        if (focus) {
            compose.runOnIdle { inputMode.requestInputMode(InputMode.Keyboard) }
            compose.onNodeWithTag("listen-song").performSemanticsAction(SemanticsActions.RequestFocus) { it() }
            compose.onNodeWithTag("listen-song").assertIsFocused()
        }
        if (target != null) {
            compose.onNodeWithTag("home-feed").performScrollToNode(hasTestTag(target))
            val key = if (target == "listen-card") "listen" else if (target.startsWith("shelf-")) target.removePrefix("shelf-").lowercase() else if (target == "featured-reading") "featured" else target
            val index = compose.runOnIdle { gridState.layoutInfo.visibleItemsInfo.first { it.key == key }.index }
            compose.onNodeWithTag("home-feed").performScrollToIndex(index)
        }
        compose.onRoot().captureRoboImage("src/test/screenshots/home-v7/$name-${if (dark) "shyam" else "gaura"}.png")
    }

    @Test @Config(qualifiers = "w1440dp-h900dp-mdpi")
    fun wideGaura() = capture("1440", false)
    @Test @Config(qualifiers = "w1440dp-h900dp-mdpi")
    fun wideShyam() = capture("1440", true)
    @Test @Config(qualifiers = "w1024dp-h768dp-mdpi")
    fun landscapeGaura() = capture("1024x768", false)
    @Test @Config(qualifiers = "w1024dp-h768dp-mdpi")
    fun landscapeShyam() = capture("1024x768", true)
    @Test fun largeBooksGaura() = capture("books-text-200", false, scale = 2f, target = "shelf-Books")
    @Test fun largeTopicsShyam() = capture("topics-text-200", true, scale = 2f, target = "shelf-Topics")
    @Test fun compactGaura() = capture("390", false, checkOpening = true)
    @Test fun compactShyam() = capture("390", true, checkOpening = true)
    @Test @Config(qualifiers = "w720dp-h1024dp-mdpi")
    fun mediumGaura() = capture("720", false)
    @Test @Config(qualifiers = "w720dp-h1024dp-mdpi")
    fun mediumShyam() = capture("720", true)
    @Test @Config(qualifiers = "w1024dp-h900dp-mdpi")
    fun expandedGaura() = capture("1024", false)
    @Test @Config(qualifiers = "w1024dp-h900dp-mdpi")
    fun expandedShyam() = capture("1024", true)
    @Test fun enlargedGaura() = capture("390-text-200", false, scale = 2f)
    @Test fun enlargedShyam() = capture("390-text-200", true, scale = 2f)
    @Test fun intercalaryGaura() = capture("intercalary", false, HomeFixtures.intercalary)
    @Test fun intercalaryShyam() = capture("intercalary", true, HomeFixtures.intercalary)
    @Test fun emptyGaura() = capture("empty", false, HomeFixtures.empty)
    @Test fun emptyShyam() = capture("empty", true, HomeFixtures.empty)
    @Test fun outOfRangeGaura() = capture("out-of-range", false, null)
    @Test fun outOfRangeShyam() = capture("out-of-range", true, null)
    @Test @Config(qualifiers = "w1024dp-h1024dp-mdpi")
    fun shelvesGaura() = capture("shelves", false, target = "shelf-Books")
    @Test @Config(qualifiers = "w1024dp-h1024dp-mdpi")
    fun shelvesShyam() = capture("shelves", true, target = "shelf-Books")
    @Test fun readingGaura() = capture("reading", false, target = "featured-reading")
    @Test fun readingShyam() = capture("reading", true, target = "featured-reading")
    @Test fun listenGaura() = capture("listen", false, target = "listen-card")
    @Test fun listenShyam() = capture("listen", true, target = "listen-card")
    @Test fun readyGaura() = capture("ready", false, target = "listen-card", active = false)
    @Test fun playingShyam() = capture("playing", true, target = "listen-card", playback = PlaybackState.PLAYING)
    @Test fun loadingGaura() = capture("loading", false, target = "listen-card", playback = PlaybackState.LOADING)
    @Test fun errorShyam() = capture("error", true, target = "listen-card", playback = PlaybackState.ERROR)
    @Test fun booksGaura() = capture("books", false, target = "shelf-Books")
    @Test fun booksShyam() = capture("books", true, target = "shelf-Books")
    @Test fun authorsGaura() = capture("authors", false, target = "shelf-Authors")
    @Test fun topicsShyam() = capture("topics", true, target = "shelf-Topics")
    @Test fun noPlayerShyam() = capture("ready", true, active = false)
    @Test fun unrelatedGaura() = capture("unrelated", false, unrelated = true, playback = PlaybackState.PLAYING, checkOpening = true)
    @Test fun unrelatedShyam() = capture("unrelated", true, unrelated = true, playback = PlaybackState.PLAYING, checkOpening = true)
    @Test fun playingGaura() = capture("playing", false, playback = PlaybackState.PLAYING)
    @Test fun loadingShyam() = capture("loading", true, playback = PlaybackState.LOADING)
    @Test fun errorGaura() = capture("error", false, playback = PlaybackState.ERROR)
    @Test fun topicsGaura() = capture("topics", false, target = "shelf-Topics")
    @Test fun authorsShyam() = capture("authors", true, target = "shelf-Authors")
    @Test fun reducedFocusGaura() = capture("focus-reduced", false, reducedMotion = true, focus = true)
    @Test fun reducedFocusShyam() = capture("focus-reduced", true, reducedMotion = true, focus = true)
    @Test @Config(qualifiers = "w320dp-h568dp-mdpi")
    fun smallGaura() = capture("320", false)
    @Test @Config(qualifiers = "w320dp-h568dp-mdpi")
    fun smallShyam() = capture("320", true)
    @Test fun longTitleGaura() = capture("long-title", false, recommendation = HomeFixtures.longTitle, active = false)
    @Test fun longTitleShyam() = capture("long-title", true, recommendation = HomeFixtures.longTitle, active = false)
    @Test fun missingAudioShyam() = capture("missing-audio", true,
        recommendation = HomeFixtures.featured.copy(audioFiles = emptyList()), active = false)
    @Test fun listeningLargeText() = capture("listen-text-200", false, scale = 2f, target = "listen-card")
}
