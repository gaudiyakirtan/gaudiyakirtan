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

    @Test fun `bento modules use staggered columns then stack and preserve four song grid`() {
        var width by mutableStateOf(1024.dp)
        var scale by mutableFloatStateOf(1f)
        compose.setContent {
            GaudiyaKirtanTheme(false) {
                CompositionLocalProvider(LocalDensity provides Density(1f, scale)) {
                    Box(Modifier.width(width)) {
                        HomeContent(songs = HomeFixtures.manifest, thisMonth = HomeFixtures.populated,
                            thisMonthSongs = HomeFixtures.monthSongs(HomeFixtures.populated))
                    }
                }
            }
        }
        fun bounds(tag: String) = compose.onNodeWithTag(tag).fetchSemanticsNode().boundsInRoot
        val context = bounds("month-context")
        val listen = bounds("listen-card")
        val songs = bounds("month-songs")
        assertEquals(32f, context.left, 0.1f)
        assertEquals(28f, listen.left - context.right, 0.1f)
        assertEquals(28f, songs.left - listen.right, 0.1f)
        assertEquals(24f, listen.top - context.top, 0.1f)
        assertEquals(12f, songs.top - context.top, 0.1f)
        assertTrue(context.height > listen.height)
        fun songBounds() = HomeFixtures.manifest.take(4).map { bounds("song-${it.uid}") }
        compose.onNodeWithTag("home-feed").performScrollToNode(hasTestTag("song-${HomeFixtures.manifest[3].uid}"))
        val first = songBounds()
        assertEquals(first[0].top, first[2].top, 0.1f)
        assertTrue(first[3].top > first[0].top)
        compose.runOnIdle { width = 720.dp }
        compose.onNodeWithTag("home-feed").performScrollToIndex(0)
        assertEquals(24f, bounds("month-context").left, 0.1f)
        assertTrue(bounds("listen-card").top > bounds("month-context").bottom)
        assertEquals(bounds("listen-card").top, bounds("month-songs").top, 0.1f)
        compose.onNodeWithTag("home-feed").performScrollToNode(hasTestTag("song-${HomeFixtures.manifest[3].uid}"))
        val medium = songBounds()
        assertEquals(medium[0].top, medium[1].top, 0.1f)
        assertTrue(medium[2].top > medium[0].top)
        compose.runOnIdle { width = 390.dp }
        compose.onNodeWithTag("home-feed").performScrollToIndex(0)
        assertEquals(16f, bounds("month-context").left, 0.1f)
        compose.onNodeWithTag("home-feed").performScrollToNode(hasTestTag("song-${HomeFixtures.manifest[3].uid}"))
        val compact = songBounds()
        assertTrue(compact.zipWithNext().all { (a, b) -> b.top > a.top })
        compose.runOnIdle { width = 1024.dp; scale = 2f }
        compose.onNodeWithTag("home-feed").performScrollToIndex(0)
        val monthBottom = bounds("month-context").bottom
        assertTrue(bounds("listen-card").top > monthBottom)
        assertEquals(bounds("month-context").width, bounds("listen-card").width, 0.1f)

    }

    @Test fun `gallery and authors share a new row after the fourth song`() {
        compose.setContent {
            GaudiyaKirtanTheme(false) {
                HomeContent(songs = HomeFixtures.manifest, books = HomeFixtures.books, authors = HomeFixtures.authors)
            }
        }
        compose.onNodeWithTag("home-feed").performScrollToNode(hasTestTag("books-card"))
        val books = compose.onNodeWithTag("books-card").fetchSemanticsNode().boundsInRoot
        val authors = compose.onNodeWithTag("authors-card").fetchSemanticsNode().boundsInRoot
        assertEquals(32f, books.left, 0.1f)
        assertEquals(books.top, authors.top, 0.1f)
        assertEquals(28f, authors.left - books.right, 0.1f)
        assertTrue(books.width > authors.width * 2f)
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
