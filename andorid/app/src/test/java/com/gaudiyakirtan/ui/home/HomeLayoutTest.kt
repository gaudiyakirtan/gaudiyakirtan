package com.gaudiyakirtan.ui.home

import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.InputMode
import androidx.compose.ui.input.InputModeManager
import androidx.compose.ui.platform.LocalInputModeManager
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.SemanticsActions
import androidx.compose.ui.semantics.SemanticsProperties
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.text.TextLayoutResult
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.ui.components.SongListItem
import com.gaudiyakirtan.myapplication.ui.home.HomeContent
import com.gaudiyakirtan.myapplication.ui.theme.GaudiyaKirtanTheme
import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [34], qualifiers = "w1024dp-h1000dp-mdpi")
class HomeLayoutTest {
    @get:Rule val compose = createComposeRule()

    @Test fun `phone and tablet keep feature ahead of season with a bounded feed and reflowing songs`() {
        var width by mutableStateOf(1024.dp)
        var scale by mutableFloatStateOf(1f)
        compose.setContent {
            GaudiyaKirtanTheme(false) {
                CompositionLocalProvider(LocalDensity provides Density(1f, scale)) {
                    Box(Modifier.width(width)) {
                        HomeContent(songs = HomeFixtures.manifest, thisMonth = HomeFixtures.populated,
                            listenSong = HomeFixtures.listen, thisMonthSongs = HomeFixtures.monthSongs(HomeFixtures.populated))
                    }
                }
            }
        }
        fun bounds(tag: String) = compose.onNodeWithTag(tag).fetchSemanticsNode().boundsInRoot
        assertTrue(bounds("listen-card").bottom < bounds("month-context").top)
        assertTrue(bounds("month-context").bottom < bounds("month-songs").top)
        assertTrue(bounds("listen-card").width <= 840f)
        compose.runOnIdle { width = 390.dp }
        assertEquals(16f, bounds("listen-card").left, 0.1f)
        assertTrue(bounds("listen-card").bottom < bounds("month-context").top)
        compose.onNodeWithTag("home-feed").performScrollToNode(hasTestTag("song-${HomeFixtures.manifest[3].uid}"))
        val compact = HomeFixtures.manifest.take(4).map { bounds("song-${it.uid}") }
        assertTrue(compact.zipWithNext().all { (a, b) -> b.top > a.top })
        compose.runOnIdle { width = 1024.dp; scale = 2f }
        compose.onNodeWithTag("home-feed").performScrollToIndex(0)
        compose.onNodeWithTag("listen-song").assertIsDisplayed()
        val layouts = mutableListOf<TextLayoutResult>()
        compose.onNodeWithTag("listen-title").performSemanticsAction(SemanticsActions.GetTextLayoutResult) { it(layouts) }
        val layout = layouts.single()
        assertEquals(layout.layoutInput.text.length, layout.getLineEnd(layout.lineCount - 1, visibleEnd = true))
        // Native font metrics have fractional advances; Compose rounds the measured box to px.
        assertTrue("Title height ${layout.multiParagraph.height} exceeds ${layout.size.height}",
            layout.multiParagraph.height <= layout.size.height + 1f)
        repeat(layout.lineCount) { assertTrue(layout.getLineRight(it) <= layout.size.width + 1f) }
    }

    @Test fun `canonical title follows onSurface and focus remains an immediate native control`() {
        var dark by mutableStateOf(false)
        var expected = Color.Unspecified
        lateinit var inputMode: InputModeManager
        compose.setContent {
            GaudiyaKirtanTheme(dark) {
                expected = MaterialTheme.colorScheme.onSurface
                inputMode = LocalInputModeManager.current
                Box(Modifier.padding(16.dp)) {
                    SongListItem("A1", "A complete song title", "Real author", false,
                        modifier = Modifier.testTag("row"))
                }
            }
        }
        fun assertTitleColor() {
            val layouts = mutableListOf<TextLayoutResult>()
            compose.onNodeWithText("A complete song title", useUnmergedTree = true)
                .performSemanticsAction(SemanticsActions.GetTextLayoutResult) { it(layouts) }
            assertEquals(expected, layouts.single().layoutInput.style.color)
        }
        assertTitleColor()
        compose.runOnIdle { inputMode.requestInputMode(InputMode.Keyboard) }
        compose.onNodeWithTag("row").performSemanticsAction(SemanticsActions.RequestFocus) { it() }
        compose.onNodeWithTag("row").assertIsFocused().assertHasClickAction()
        compose.runOnIdle { dark = true }
        assertTitleColor()
        compose.onNodeWithTag("row").assertIsFocused()
        compose.onAllNodes(SemanticsMatcher.keyIsDefined(SemanticsProperties.LiveRegion)).assertCountEquals(0)
    }
}
