package com.gaudiyakirtan.ui.screenshot

import androidx.activity.ComponentActivity
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
import com.gaudiyakirtan.data.SongJson
import com.gaudiyakirtan.data.TestAssets
import com.gaudiyakirtan.myapplication.models.*
import com.gaudiyakirtan.myapplication.ui.home.HomeContent
import com.gaudiyakirtan.myapplication.ui.player.MiniPlayerBar
import com.gaudiyakirtan.myapplication.ui.theme.GaudiyaKirtanTheme
import com.gaudiyakirtan.myapplication.ui.theme.neutral
import com.gaudiyakirtan.navigation.Tab
import com.gaudiyakirtan.services.*
import com.gaudiyakirtan.ui.home.HomeFixtures
import java.io.File
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

/** Home v5 baselines, deliberately under Android. Frozen corpus dates; offline cover fallbacks. */
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
        target: String? = null
    ) {
        val playingSong: Song = SongJson.instance.decodeFromString(File(TestAssets.dir, "songs/R8.json").readText())
        val player = PlayerUiState(
            nowPlaying = NowPlaying(playingSong, playingSong.audioFiles.first(), playingSong.audioFiles),
            playbackState = PlaybackState.PAUSED, positionMs = 42_000, durationMs = 187_000
        )
        lateinit var gridState: LazyGridState
        compose.setContent {
            gridState = rememberLazyGridState()
            GaudiyaKirtanTheme(dark) {
                CompositionLocalProvider(LocalDensity provides Density(LocalDensity.current.density, scale)) {
                    Scaffold(bottomBar = {
                        Column {
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
                                month?.let(HomeFixtures::monthSongs).orEmpty(), gridState = gridState)
                        }
                    }
                }
            }
        }
        compose.waitForIdle()
        if (target != null) {
            compose.onNodeWithTag("home-feed").performScrollToNode(hasTestTag(target))
            val key = if (target.startsWith("shelf-")) target.removePrefix("shelf-").lowercase() else if (target == "featured-reading") "featured" else target
            val index = compose.runOnIdle { gridState.layoutInfo.visibleItemsInfo.first { it.key == key }.index }
            compose.onNodeWithTag("home-feed").performScrollToIndex(index)
        }
        compose.onRoot().captureRoboImage("src/test/screenshots/home-v5/$name-${if (dark) "shyam" else "gaura"}.png")
    }

    @Test fun compactGaura() = capture("390", false)
    @Test fun compactShyam() = capture("390", true)
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
    fun shelvesGaura() = capture("shelves", false, target = "shelf-Topics")
    @Test @Config(qualifiers = "w1024dp-h1024dp-mdpi")
    fun shelvesShyam() = capture("shelves", true, target = "shelf-Topics")
    @Test fun readingGaura() = capture("reading", false, target = "featured-reading")
    @Test fun readingShyam() = capture("reading", true, target = "featured-reading")
}
