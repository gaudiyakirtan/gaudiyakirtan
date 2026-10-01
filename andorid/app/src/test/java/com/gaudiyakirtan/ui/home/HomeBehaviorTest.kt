package com.gaudiyakirtan.ui.home

import android.provider.Settings
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.SemanticsActions
import androidx.compose.ui.semantics.SemanticsProperties
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.text.TextLayoutResult
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.dp
import androidx.test.core.app.ApplicationProvider
import com.gaudiyakirtan.myapplication.models.*
import com.gaudiyakirtan.myapplication.ui.components.SongListItem
import com.gaudiyakirtan.myapplication.ui.components.VerseView
import com.gaudiyakirtan.myapplication.ui.home.HomeContent
import com.gaudiyakirtan.myapplication.ui.sections.ThisMonthSection
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
@Config(sdk = [34], qualifiers = "w390dp-h1000dp-mdpi")
class HomeBehaviorTest {
    @get:Rule val compose = createComposeRule()

    private fun content(scale: Float = 1f, body: @Composable () -> Unit) {
        compose.setContent {
            GaudiyaKirtanTheme(false) {
                CompositionLocalProvider(LocalDensity provides Density(LocalDensity.current.density, scale)) {
                    body()
                }
            }
        }
    }

    @Test fun `all resolved seasonal rows retain order and open song detail`() {
        val today = HomeFixtures.largest
        val songs = HomeFixtures.monthSongs(today)
        assertTrue("fixture must detect an accidental six-row cap", songs.size > 6)
        var opened = ""
        content {
            Column(Modifier.verticalScroll(rememberScrollState())) {
                ThisMonthSection(today, songs, HomeFixtures.authorNames, onSongClick = { opened = it })
            }
        }
        val tops = songs.map { song ->
            compose.onNodeWithTag("month-song-${song.uid}").fetchSemanticsNode().positionInRoot.y
        }
        assertEquals(tops.sorted(), tops)
        songs.forEach { song ->
            compose.onNodeWithTag("month-song-${song.uid}").performScrollTo().performClick()
            assertEquals(song.uid, opened)
        }
        compose.onAllNodes(hasContentDescription("Choose recording", substring = true)).assertCountEquals(0)
    }

    @Test fun `intercalary context uses Purusottama once and preserves complete observances`() {
        val today = HomeFixtures.intercalary
        content { ThisMonthSection(today, HomeFixtures.monthSongs(today)) }
        compose.onAllNodesWithText("Puruṣottama").assertCountEquals(1)
        compose.onNodeWithText("adhika-māsa").assertExists()
        compose.onNodeWithText(today.window.lunarMonth).assertDoesNotExist()
        compose.onNodeWithText(today.window.gaudiyaMonth).assertDoesNotExist()
        val layouts = mutableListOf<TextLayoutResult>()
        compose.onNodeWithText(today.month.observances.joinToString(" · "))
            .performSemanticsAction(SemanticsActions.GetTextLayoutResult) { it(layouts) }
        assertTrue(layouts.isNotEmpty())
        val layout = layouts.single()
        assertEquals(today.month.observances.joinToString(" · ").length,
            layout.getLineEnd(layout.lineCount - 1, visibleEnd = true))
        // Native text measurement rounds to whole pixels; allow the fractional final advance.
        assertTrue(layout.multiParagraph.height <= layout.size.height + 1f)
        repeat(layout.lineCount) { assertTrue(layout.getLineRight(it) <= layout.size.width + 1f) }
    }

    @Test fun `empty month keeps context repertoire message and native songs`() {
        content {
            HomeContent(songs = HomeFixtures.manifest, thisMonth = HomeFixtures.empty)
        }
        compose.onNodeWithText("Śrī Gaudiya Kirtan").assertExists()
        compose.onNodeWithTag("month-context").assertExists()
        compose.onNodeWithTag("home-feed").performScrollToNode(hasTestTag("month-songs"))
        compose.onNodeWithTag("month-songs").assertExists()
        compose.onNodeWithText("No songs are specific to this month.").assertExists()
        compose.onNodeWithTag("home-feed").performScrollToNode(hasTestTag("song-${HomeFixtures.manifest[3].uid}"))
        compose.onNodeWithTag("song-${HomeFixtures.manifest[3].uid}").assertIsDisplayed()
    }

    @Test fun `out of range preserves brand four songs and navigation without optional sections`() {
        val opened = mutableListOf<String>()
        var search = 0
        var settings = 0
        content {
            HomeContent(songs = HomeFixtures.manifest, onSongClick = { opened += it },
                onSearchClick = { search++ }, onSettingsClick = { settings++ })
        }
        compose.onNodeWithText("Śrī Gaudiya Kirtan").assertIsDisplayed()
        compose.onNodeWithTag("month-context").assertDoesNotExist()
        listOf("Topics", "Books", "Authors", "Recently played").forEach {
            compose.onNodeWithText(it).assertDoesNotExist()
        }
        listOf("Search", "Settings").forEach {
            compose.onNodeWithContentDescription(it).assertWidthIsAtLeast(48.dp)
                .assertHeightIsAtLeast(48.dp).performClick()
        }
        assertEquals(1, search)
        assertEquals(1, settings)
        HomeFixtures.manifest.take(4).forEach { song ->
            compose.onNodeWithTag("home-feed").performScrollToNode(hasTestTag("song-${song.uid}"))
            compose.onNodeWithTag("song-${song.uid}").assertHeightIsAtLeast(56.dp).performClick()
        }
        assertEquals(HomeFixtures.manifest.take(4).map { it.uid }, opened)
        compose.onNodeWithTag("song-${HomeFixtures.manifest[4].uid}").assertDoesNotExist()
    }

    @Test fun `large type retains topic book and preview author destinations`() {
        val topics = HomeFixtures.topics
        val books = HomeFixtures.books
        val authors = HomeFixtures.authors
        val previewAuthors = authors.filter { it.uid != "?" }.take(4)
        var opened = ""
        content(2f) {
            HomeContent(topics = topics, books = books, authors = authors,
                onGroupClick = { opened = it }, onAuthorClick = { opened = it })
        }
        compose.onNodeWithTag("home-feed").performScrollToNode(hasTestTag("shelf-Books"))
        compose.onNodeWithTag("shelf-Books").performScrollToIndex(books.lastIndex)
        compose.onNodeWithTag("book-${books.last().uid}").performClick()
        assertEquals(books.last().uid, opened)
        compose.onNodeWithTag("home-feed").performScrollToNode(hasTestTag("shelf-Authors"))
        compose.onNodeWithTag("author-${previewAuthors.last().uid}").performScrollTo().performClick()
        assertEquals(previewAuthors.last().uid, opened)
        compose.onNodeWithTag("home-feed").performScrollToNode(hasTestTag("shelf-Topics"))
        compose.onNodeWithTag("topic-${topics.last().uid}").performScrollTo().performClick()
        assertEquals(topics.last().uid, opened)
    }

    @Test fun `book rail and text browsing retain their final working destinations`() {
        var opened = ""
        val previewAuthors = HomeFixtures.authors.filter { it.uid != "?" }.take(4)
        content {
            HomeContent(topics = HomeFixtures.topics, books = HomeFixtures.books,
                authors = HomeFixtures.authors, onGroupClick = { opened = it }, onAuthorClick = { opened = it })
        }
        compose.onNodeWithTag("home-feed").performScrollToNode(hasTestTag("shelf-Books"))
        compose.onNodeWithTag("shelf-Books").performScrollToIndex(HomeFixtures.books.lastIndex)
        compose.onNodeWithTag("book-${HomeFixtures.books.last().uid}").performClick()
        assertEquals(HomeFixtures.books.last().uid, opened)
        compose.onNodeWithTag("home-feed").performScrollToNode(hasTestTag("shelf-Authors"))
        compose.onNodeWithTag("author-${previewAuthors.last().uid}").performScrollTo().performClick()
        assertEquals(previewAuthors.last().uid, opened)
        compose.onNodeWithTag("home-feed").performScrollToNode(hasTestTag("shelf-Topics"))
        compose.onNodeWithTag("topic-${HomeFixtures.topics.last().uid}").performScrollTo().performClick()
        assertEquals(HomeFixtures.topics.last().uid, opened)
    }

    @Test fun `every featured verse remains reachable above the bottom obstruction`() {
        content {
            Column(Modifier.fillMaxSize()) {
                Box(Modifier.weight(1f)) { HomeContent(featuredSong = HomeFixtures.featured) }
                Spacer(Modifier.fillMaxWidth().height(160.dp).testTag("obstruction"))
            }
        }
        HomeFixtures.featured.verses.forEachIndexed { index, verse ->
            compose.onNodeWithTag("home-feed").performScrollToNode(hasTestTag("featured-verse-$index"))
            compose.onNodeWithText(verse.linesForScript("Latn", "IAST").first()).assertExists()
        }
        val lastLine = HomeFixtures.featured.verses.last().translationFor("eng")!!.text.last()
        compose.onNodeWithText(lastLine).performScrollTo().assertIsDisplayed()
        val bottom = compose.onNodeWithText(lastLine).fetchSemanticsNode().boundsInRoot.bottom
        val obstruction = compose.onNodeWithTag("obstruction").fetchSemanticsNode().boundsInRoot.top
        assertTrue(bottom <= obstruction)
    }

    @Test fun `featured verse follows live script and independent translation and gloss preferences`() {
        val verse = HomeFixtures.featured.verses.first()
        var settings by mutableStateOf(AppSettings(showWordToWord = false, showTranslation = false))
        content { Column(Modifier.verticalScroll(rememberScrollState())) { VerseView(verse, settings) } }
        compose.onNodeWithText(verse.linesForScript("Latn", "IAST").first()).assertExists()
        compose.onNodeWithText(verse.translationFor("eng")!!.text.first()).assertDoesNotExist()
        compose.runOnIdle { settings = settings.copy(displayScript = "Beng", showTranslation = true) }
        compose.onNodeWithText(verse.linesForScript("Beng").first()).assertExists()
        compose.onNodeWithText(verse.translationFor("eng")!!.text.first()).assertExists()
        compose.runOnIdle { settings = settings.copy(displayScript = "Deva", showWordToWord = true, wordToWordLanguage = "hin") }
        compose.onNodeWithText(verse.linesForScript("Deva").first()).assertExists()
        compose.onNodeWithText(verse.wordToWordFor("hin")!!.words.first()[1], substring = true).assertExists()
    }

    @Test fun `long multilingual rows expand and keep full names with animation disabled`() {
        val context = ApplicationProvider.getApplicationContext<android.content.Context>()
        Settings.Global.putFloat(context.contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE, 0f)
        val title = "śrī-kṛṣṇa-caitanya prabhu nityānanda — শ্রীকৃষ্ণচৈতন্য প্রভু নিত্যানন্দ — श्रीकृष्णचैतन्य प्रभु नित्यानन्द"
        var clicks = 0
        content(2f) {
            Column(Modifier.verticalScroll(rememberScrollState())) {
                SongListItem("N9", title, "Śrīla Narottama dāsa Ṭhākura", false,
                    onClick = { clicks++ }, modifier = Modifier.testTag("row"))
            }
        }
        val layouts = mutableListOf<TextLayoutResult>()
        compose.onNodeWithText(title, useUnmergedTree = true)
            .performSemanticsAction(SemanticsActions.GetTextLayoutResult) { it(layouts) }
        assertFalse("Unexpected text overflow: ${layouts.single()}", layouts.single().hasVisualOverflow)
        compose.onNodeWithTag("row").assertHeightIsAtLeast(56.dp).performClick()
        assertEquals(1, clicks)
        compose.onAllNodes(SemanticsMatcher.keyIsDefined(SemanticsProperties.LiveRegion)).assertCountEquals(0)
        compose.onAllNodes(SemanticsMatcher.keyIsDefined(SemanticsProperties.ProgressBarRangeInfo)).assertCountEquals(0)
    }

    @Test fun `rows below 200 percent text still show complete titles`() {
        val title = "śrī-kṛṣṇa-caitanya prabhu nityānanda — শ্রীকৃষ্ণচৈতন্য প্রভু নিত্যানন্দ — श्रीकृष्णचैतन्य प्रभु नित्यानन्द"
        content(1.3f) {
            SongListItem("N9", title, "Śrīla Narottama dāsa Ṭhākura", false, modifier = Modifier.testTag("row"))
        }
        val layouts = mutableListOf<TextLayoutResult>()
        compose.onNodeWithText(title, useUnmergedTree = true)
            .performSemanticsAction(SemanticsActions.GetTextLayoutResult) { it(layouts) }
        assertTrue("fixture must exceed the default two-line clamp", layouts.single().lineCount > 2)
        assertFalse(layouts.single().hasVisualOverflow)
    }
}
