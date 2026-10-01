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
import com.gaudiyakirtan.services.PlayerUiState

@Composable
fun HomeScreen(
    onSongClick: (String) -> Unit = {},
    onSettingsClick: () -> Unit = {},
    onSearchClick: () -> Unit = {},
    onAuthorClick: (String) -> Unit = {},
    onGroupClick: (String) -> Unit = {},
    playerUiState: PlayerUiState,
    onPlaySong: (Song) -> Unit,
    onPlayPause: () -> Unit,
    onBrowseRecordings: () -> Unit,
    viewModel: HomeViewModel = viewModel()
) {
    val songs by viewModel.songs.collectAsState()
    val authors by viewModel.authors.collectAsState()
    val topics by viewModel.topics.collectAsState()
    val books by viewModel.books.collectAsState()
    val featuredSong by viewModel.featuredSong.collectAsState()
    val listenSong by viewModel.listenSong.collectAsState()
    val thisMonth by viewModel.thisMonth.collectAsState()
    val thisMonthSongs by viewModel.thisMonthSongs.collectAsState()
    val settings by viewModel.settings.collectAsState()
    HomeCalendarRefresh(viewModel)
    HomeContent(songs, authors, topics, books, featuredSong, thisMonth, thisMonthSongs, settings,
        onSongClick, onSettingsClick, onSearchClick, onAuthorClick, onGroupClick,
        listenSong = listenSong, playerUiState = playerUiState, onPlaySong = onPlaySong,
        onPlayPause = onPlayPause, onBrowseRecordings = onBrowseRecordings)
}

/**
 * V6 bento canvas: season → shared listening → repertoire → four songs → discovery → full N9.
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
    gridState: LazyGridState = rememberLazyGridState(),
    listenSong: Song? = null,
    playerUiState: PlayerUiState = PlayerUiState(),
    onPlaySong: (Song) -> Unit = {},
    onPlayPause: () -> Unit = {},
    onBrowseRecordings: () -> Unit = {}
) {
    val authorNames = remember(authors, settings.listLanguage) {
        authors.associate { it.uid to it.names.preferredText(settings.listLanguage) }
    }
    val authorSongCounts = remember(songs) { songs.groupingBy { it.authorUid }.eachCount() }
    HomeStyle {
        Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
            BoxWithConstraints(Modifier.fillMaxSize()) {
                val expanded = maxWidth >= 840.dp
                val medium = maxWidth >= 600.dp && !expanded
                val gutter = if (expanded) Spacing.xxl else if (medium) Spacing.xl else Spacing.lg
                val enlarged = LocalDensity.current.fontScale >= 1.5f
                val reflow = enlarged || maxWidth - gutter * 2 < 240.dp
                val columns = if (reflow || (!expanded && !medium)) 1 else if (expanded) 3 else 2
                Column(Modifier.padding(horizontal = gutter).widthIn(max = 1120.dp)
                    .fillMaxSize().align(Alignment.TopCenter)) {
                    SearchBar("", {}, onSettingsClick, onSearchClick = onSearchClick)
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(columns),
                        state = gridState,
                        modifier = Modifier.weight(1f).testTag("home-feed"),
                        horizontalArrangement = Arrangement.spacedBy(28.dp),
                        verticalArrangement = Arrangement.spacedBy(28.dp),
                        // The parent already reserves measured player + tabs + safe areas. Add the
                        // 24dp page padding and 16dp clearance, rather than guessing player heights.
                        contentPadding = PaddingValues(top = Spacing.xl, bottom = Spacing.xl + Spacing.lg)
                    ) {
                        item(key = "brand", span = { GridItemSpan(maxLineSpan) }) { HomeBrand(expanded) }
                        if (thisMonth != null) {
                            item(key = "seasonal", span = { GridItemSpan(if (expanded && !reflow) 1 else maxLineSpan) }) {
                                HomeModule("Season") { MonthContext(thisMonth, songCount = thisMonthSongs.size) }
                            }
                        }
                        item(key = "listen") {
                            HomeModule("Listen now", Modifier.padding(top = if (expanded && !reflow) 24.dp else 0.dp)) {
                            HomeListenCard(listenSong, playerUiState, settings.listLanguage, onSongClick,
                                onPlaySong, onPlayPause, onBrowseRecordings)
                            }
                        }
                        if (thisMonth != null) {
                            item(key = "seasonal-songs") {
                                HomeModule("Seasonal songs", Modifier.padding(top = if (expanded && !reflow) 12.dp else 0.dp)) {
                                    MonthSongs(thisMonthSongs, authorNames, settings.listLanguage, onSongClick)
                                }
                            }
                        }
                        if (songs.isNotEmpty()) {
                            songsSection(songs.take(4), authorNames, settings.listLanguage, onSongClick)
                            // Close the four-song grid before the two-column gallery begins.
                            item(key = "discovery-gap", span = { GridItemSpan(maxLineSpan) }) { Spacer(Modifier.height(0.dp)) }
                        }
                        if (books.isNotEmpty()) {
                            item(key = "books", span = { GridItemSpan(if (expanded && !reflow) 2 else maxLineSpan) }) {
                                HomeBooks(books, settings.listLanguage, reflow, onGroupClick)
                            }
                        }
                        if (authors.isNotEmpty()) {
                            item(key = "authors", span = { GridItemSpan(if (expanded && !reflow) 1 else maxLineSpan) }) {
                                HomeAuthors(authors, authorSongCounts, settings.listLanguage, reflow, onAuthorClick)
                            }
                        }
                        if (topics.isNotEmpty()) {
                            item(key = "topics", span = { GridItemSpan(maxLineSpan) }) {
                                HomeTopics(topics, settings.listLanguage, reflow, medium || expanded, onGroupClick)
                            }
                        }
                        if (featuredSong != null) {
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
