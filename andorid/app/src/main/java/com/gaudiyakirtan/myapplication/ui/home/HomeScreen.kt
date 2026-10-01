package com.gaudiyakirtan.myapplication.ui.home

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontSynthesis
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.gaudiyakirtan.myapplication.models.*
import com.gaudiyakirtan.myapplication.ui.components.RowUidChip
import com.gaudiyakirtan.myapplication.ui.components.SearchBar
import com.gaudiyakirtan.myapplication.ui.components.VerseView
import com.gaudiyakirtan.myapplication.ui.components.icons.Mridanga
import com.gaudiyakirtan.myapplication.ui.sections.*
import com.gaudiyakirtan.myapplication.ui.theme.DisplayFontFamily
import com.gaudiyakirtan.myapplication.ui.theme.Spacing

@Composable
fun HomeScreen(
    onSongClick: (String) -> Unit = {},
    onSettingsClick: () -> Unit = {},
    onSearchClick: () -> Unit = {},
    onAuthorClick: (String) -> Unit = {},
    onGroupClick: (String) -> Unit = {},
    viewModel: HomeViewModel = viewModel()
) {
    val songs by viewModel.songs.collectAsState()
    val authors by viewModel.authors.collectAsState()
    val topics by viewModel.topics.collectAsState()
    val books by viewModel.books.collectAsState()
    val featuredSong by viewModel.featuredSong.collectAsState()
    val thisMonth by viewModel.thisMonth.collectAsState()
    val thisMonthSongs by viewModel.thisMonthSongs.collectAsState()
    val settings by viewModel.settings.collectAsState()
    HomeCalendarRefresh(viewModel)
    HomeContent(songs, authors, topics, books, featuredSong, thisMonth, thisMonthSongs, settings,
        onSongClick, onSettingsClick, onSearchClick, onAuthorClick, onGroupClick)
}

/**
 * Adaptive feed: seasonal context → repertoire → four native songs → browse → complete reading.
 * A is measured after AppNavigation's Scaffold insets. One lazy grid owns vertical scrolling;
 * full-span modules and row-major song cells retain the same traversal order at every width.
 */
@Composable
fun HomeContent(
    songs: List<ManifestEntry> = emptyList(),
    authors: List<Author> = emptyList(),
    topics: List<SongGroup> = emptyList(),
    books: List<SongGroup> = emptyList(),
    featuredSong: Song? = null,
    thisMonth: CalendarToday? = null,
    thisMonthSongs: List<ManifestEntry> = emptyList(),
    settings: AppSettings = AppSettings(),
    onSongClick: (String) -> Unit = {},
    onSettingsClick: () -> Unit = {},
    onSearchClick: () -> Unit = {},
    onAuthorClick: (String) -> Unit = {},
    onGroupClick: (String) -> Unit = {},
    gridState: LazyGridState = rememberLazyGridState()
) {
    val authorNames = remember(authors, settings.listLanguage) {
        authors.associate { it.uid to it.names.preferredText(settings.listLanguage) }
    }
    val authorSongCounts = remember(songs) { songs.groupingBy { it.authorUid }.eachCount() }
    Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
        BoxWithConstraints(Modifier.fillMaxSize()) {
            val expanded = maxWidth >= 840.dp
            val medium = maxWidth >= 600.dp && !expanded
            val gutter = if (expanded) Spacing.xxl else if (medium) Spacing.xl else Spacing.lg
            val enlarged = LocalDensity.current.fontScale >= 2f
            val reflow = enlarged || maxWidth - gutter * 2 < 240.dp
            val columns = if (reflow || (!expanded && !medium)) 1 else if (expanded) 3 else 2
            Column(Modifier.padding(horizontal = gutter).widthIn(max = 1120.dp)
                .fillMaxSize().align(Alignment.TopCenter)) {
                SearchBar("", {}, onSettingsClick, onSearchClick = onSearchClick)
                LazyVerticalGrid(
                    columns = GridCells.Fixed(columns),
                    state = gridState,
                    modifier = Modifier.weight(1f).testTag("home-feed"),
                    horizontalArrangement = Arrangement.spacedBy(Spacing.lg),
                    verticalArrangement = Arrangement.spacedBy(Spacing.lg),
                    // The parent already reserves measured player + tabs + safe areas. Add the
                    // 24dp page padding and 16dp clearance, rather than guessing player heights.
                    contentPadding = PaddingValues(top = Spacing.xl, bottom = Spacing.xl + Spacing.lg)
                ) {
                    item(key = "brand", span = { GridItemSpan(maxLineSpan) }) { HomeBrand(expanded) }
                    if (thisMonth != null) {
                        sectionGap("seasonal-gap")
                        item(key = "seasonal", span = { GridItemSpan(maxLineSpan) }) {
                            ThisMonthSection(thisMonth, thisMonthSongs, authorNames, settings.listLanguage,
                                onSongClick, expanded && !reflow, medium || expanded)
                        }
                    }
                    if (songs.isNotEmpty()) {
                        sectionGap("songs-gap")
                        songsSection(songs.take(4), authorNames, settings.listLanguage, onSongClick)
                    }
                    if (topics.isNotEmpty()) {
                        sectionGap("topics-gap")
                        item(key = "topics", span = { GridItemSpan(maxLineSpan) }) {
                            TopicsSection(topics, onGroupClick, reflow)
                        }
                    }
                    if (books.isNotEmpty()) {
                        sectionGap("books-gap")
                        item(key = "books", span = { GridItemSpan(maxLineSpan) }) {
                            BooksSection(books, onGroupClick, reflow, expanded)
                        }
                    }
                    if (authors.isNotEmpty()) {
                        sectionGap("authors-gap")
                        item(key = "authors", span = { GridItemSpan(maxLineSpan) }) {
                            AuthorsSection(authors, authorSongCounts, onAuthorClick, reflow, settings.listLanguage)
                        }
                    }
                    if (featuredSong != null) {
                        sectionGap("featured-gap")
                        item(key = "featured", span = { GridItemSpan(maxLineSpan) }) {
                            ReadingColumn(Modifier.testTag("featured-reading")) {
                                Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(Spacing.xs)) {
                                    Text(featuredSong.titleMain.preferredText(settings.displayScript),
                                        style = MaterialTheme.typography.titleLarge,
                                        color = MaterialTheme.colorScheme.onSurface,
                                        textAlign = TextAlign.Center,
                                        modifier = Modifier.semantics { heading() })
                                    Text(featuredSong.authorDisplay.preferredText(settings.displayScript),
                                        style = MaterialTheme.typography.bodyLarge,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        textAlign = TextAlign.Center)
                                    RowUidChip(featuredSong.uid)
                                }
                            }
                        }
                        itemsIndexed(featuredSong.verses, key = { index, _ -> "featured-verse-$index" },
                            span = { _, _ -> GridItemSpan(maxLineSpan) }) { index, verse ->
                            ReadingColumn(Modifier.testTag("featured-verse-$index")) {
                                VerseView(verse, settings)
                            }
                        }
                    }
                }
            }
        }
    }
}

private fun LazyGridScope.sectionGap(key: String) {
    // Adjacent 16dp grid gaps add up to the 32dp major-section rhythm.
    item(key = key, span = { GridItemSpan(maxLineSpan) }) { Spacer(Modifier.height(0.dp)) }
}

@Composable
private fun ReadingColumn(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    Box(modifier.fillMaxWidth(), contentAlignment = Alignment.TopCenter) {
        Column(Modifier.widthIn(max = 680.dp).fillMaxWidth()) { content() }
    }
}

@Composable
private fun HomeBrand(expanded: Boolean) {
    val style = (if (expanded) MaterialTheme.typography.displaySmall else MaterialTheme.typography.headlineMedium)
        .copy(fontFamily = DisplayFontFamily, fontWeight = FontWeight.Normal,
            fontSynthesis = FontSynthesis.None, letterSpacing = 0.sp)
    val title = "Śrī Gaudiya Kirtan"
    val measurer = rememberTextMeasurer()
    BoxWithConstraints(Modifier.fillMaxWidth().padding(Spacing.xs)) {
        val markSize = if (expanded) 40.dp else 36.dp
        val textWidth = with(LocalDensity.current) { measurer.measure(title, style).size.width.toDp() }
        val showMark = textWidth + Spacing.md + markSize <= maxWidth
        Row(verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(Spacing.md)) {
            Text(title, style = style, color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.weight(1f, fill = false).semantics { heading() })
            if (showMark) Mridanga(size = markSize)
        }
    }
}
