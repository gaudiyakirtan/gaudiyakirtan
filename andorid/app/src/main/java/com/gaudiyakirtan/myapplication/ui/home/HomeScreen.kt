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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.gaudiyakirtan.myapplication.models.*
import com.gaudiyakirtan.myapplication.ui.components.RowUidChip
import com.gaudiyakirtan.myapplication.ui.components.SearchBar
import com.gaudiyakirtan.myapplication.ui.components.VerseView
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
 * V7 Singing Page: one recommended song → season/repertoire → native Songs → discovery → N9.
 * AppNavigation supplies measured Scaffold insets for the shared player, tabs and safe areas.
 * One bounded lazy feed retains semantic order at every width; no nested vertical scrollers.
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
    val previewAuthors = remember(authors) { authors.filter { it.uid != "?" }.take(4) }
    Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
        BoxWithConstraints(Modifier.fillMaxSize()) {
            val enlarged = LocalDensity.current.fontScale >= 1.5f
            val columns = if (maxWidth >= 600.dp && !enlarged) 2 else 1
            Column(Modifier.widthIn(max = 840.dp).fillMaxSize().align(Alignment.TopCenter)
                .padding(horizontal = Spacing.lg)) {
                HomeBrand()
                SearchBar("", {}, onSettingsClick, onSearchClick = onSearchClick)
                LazyVerticalGrid(
                    columns = GridCells.Fixed(columns),
                    state = gridState,
                    modifier = Modifier.weight(1f).testTag("home-feed"),
                    horizontalArrangement = Arrangement.spacedBy(Spacing.lg),
                    verticalArrangement = Arrangement.spacedBy(Spacing.xs),
                    // The parent reserves actual player + tabs + safe areas, including their
                    // large-font heights. Clearance also keeps the final focus outline visible.
                    contentPadding = PaddingValues(top = Spacing.xs, bottom = Spacing.xl + Spacing.lg)
                ) {
                    item(key = "listen", span = { GridItemSpan(maxLineSpan) }) {
                        HomeListenCard(listenSong, playerUiState, settings.listLanguage, onSongClick,
                            onPlaySong, onPlayPause, onBrowseRecordings)
                    }
                    if (thisMonth != null) {
                        item(key = "seasonal", span = { GridItemSpan(maxLineSpan) }) {
                            MonthContext(thisMonth, Modifier.padding(top = Spacing.md), thisMonthSongs.size)
                        }
                        item(key = "seasonal-songs", span = { GridItemSpan(maxLineSpan) }) {
                            MonthSongs(thisMonthSongs, authorNames, settings.listLanguage, onSongClick,
                                Modifier.padding(top = Spacing.sm))
                        }
                    }
                    if (songs.isNotEmpty()) {
                        item(key = "songs-gap", span = { GridItemSpan(maxLineSpan) }) { Spacer(Modifier.height(Spacing.lg)) }
                        songsSection(songs.take(4), authorNames, settings.listLanguage, onSongClick)
                    }
                    if (books.isNotEmpty()) {
                        item(key = "books", span = { GridItemSpan(maxLineSpan) }) {
                            Box(Modifier.padding(top = Spacing.xl)) {
                                HomeBooks(books, settings.listLanguage, enlarged, onGroupClick)
                            }
                        }
                    }
                        if (previewAuthors.isNotEmpty()) {
                            item(key = "authors", span = { GridItemSpan(maxLineSpan) }) {
                                Box(Modifier.padding(top = Spacing.xl)) {
                                    HomeAuthors(previewAuthors, authorSongCounts, settings.listLanguage, onAuthorClick)
                                }
                            }
                    }
                    if (topics.isNotEmpty()) {
                        item(key = "topics", span = { GridItemSpan(maxLineSpan) }) {
                            Box(Modifier.padding(top = Spacing.xl)) {
                                HomeTopics(topics, settings.listLanguage, onGroupClick)
                            }
                        }
                    }
                    if (featuredSong != null) {
                        item(key = "featured", span = { GridItemSpan(maxLineSpan) }) {
                            ReadingColumn(Modifier.padding(top = Spacing.xl).testTag("featured-reading")) {
                                Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(Spacing.xs)) {
                                    Text(featuredSong.titleMain.preferredText(settings.displayScript),
                                        style = MaterialTheme.typography.titleLarge,
                                        color = MaterialTheme.colorScheme.onSurface,
                                        textAlign = TextAlign.Center)
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

@Composable
private fun ReadingColumn(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    Box(modifier.fillMaxWidth(), contentAlignment = Alignment.TopCenter) {
        Column(Modifier.widthIn(max = 680.dp).fillMaxWidth()) { content() }
    }
}

@Composable
private fun HomeBrand() {
    Text("Śrī Gaudiya Kirtan", style = MaterialTheme.typography.headlineSmall.copy(
        fontFamily = DisplayFontFamily, fontWeight = FontWeight.Normal, fontSynthesis = FontSynthesis.None),
        color = MaterialTheme.colorScheme.onSurface,
        modifier = Modifier.padding(horizontal = Spacing.xs, vertical = Spacing.sm).semantics { heading() })
}
