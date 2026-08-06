package com.gaudiyakirtan.myapplication.ui.home

import com.gaudiyakirtan.myapplication.ui.theme.neutral

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.background
import androidx.compose.runtime.remember
import androidx.lifecycle.viewmodel.compose.viewModel
import com.gaudiyakirtan.myapplication.models.author
import com.gaudiyakirtan.myapplication.models.title
import com.gaudiyakirtan.myapplication.ui.components.SearchBar
import com.gaudiyakirtan.myapplication.ui.components.VerseView
import com.gaudiyakirtan.myapplication.ui.sections.*

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
    val authorNames by viewModel.authorNames.collectAsState()
    val topics by viewModel.topics.collectAsState()
    val books by viewModel.books.collectAsState()
    val featuredSong by viewModel.featuredSong.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val listLanguage by viewModel.listLanguage.collectAsState()

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
        ) {
            // Add the search bar at the top
            SearchBar(
                searchText = searchQuery,
                onSearchTextChange = { viewModel.updateSearchQuery(it) },
                onSettingsClick = onSettingsClick,
                onSearchClick = onSearchClick,
                modifier = Modifier.padding(top = 8.dp)
            )

            // Main content with scroll
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(24.dp)
            ) {
                SongsSection(
                    songs = songs.take(4),
                    authorNames = authorNames,
                    listLanguage = listLanguage,
                    onSongClick = onSongClick
                )
                val authorSongCounts = remember(songs) {
                    songs.groupingBy { it.authorUid }.eachCount()
                }
                AuthorsSection(
                    authors = authors,
                    songCounts = authorSongCounts,
                    onAuthorClick = onAuthorClick
                )
                // Empty-state discipline (docs/screens/browse.md): the shipped corpus has no
                // topics/books data yet -- render nothing rather than a header with no content
                // underneath it. These light up automatically once song_groups.json ships.
                if (topics.isNotEmpty()) {
                    TopicsSection(topics = topics, onTopicClick = onGroupClick)
                }
                if (books.isNotEmpty()) {
                    BooksSection(books = books, onBookClick = onGroupClick)
                }

                // Featured Song Section - Exactly like iOS, now backed by the real corpus (song N9)
                featuredSong?.let { song ->
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp)
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(4.dp),
                            modifier = Modifier.padding(top = 16.dp)
                        ) {
                            Text(
                                text = song.title,
                                fontSize = 28.sp,
                                color = MaterialTheme.colorScheme.primary, // Highlight color
                                textAlign = TextAlign.Center
                            )

                            Text(
                                text = song.author,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Normal,
                                color = MaterialTheme.colorScheme.onBackground, // Match iOS primaryText color
                                textAlign = TextAlign.Center
                            )

                            Text(
                                text = song.uid,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Medium,
                                color = MaterialTheme.colorScheme.neutral,
                                modifier = Modifier
                                    .clip(MaterialTheme.shapes.small)
                                    .background(MaterialTheme.colorScheme.neutral.copy(alpha = 0.25f))
                                    .padding(horizontal = 10.dp, vertical = 2.dp)
                            )
                        }

                        // Verses
                        song.verses.forEach { verse ->
                            VerseView(verse = verse)
                            // Removed Box wrapper with padding to match iOS implementation
                        }
                    }
                }

                // Add padding at the bottom
                Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }
}
