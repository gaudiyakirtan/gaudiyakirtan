package com.gaudiyakirtan.myapplication.ui.library

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.gaudiyakirtan.myapplication.models.Author
import com.gaudiyakirtan.myapplication.models.ManifestEntry
import com.gaudiyakirtan.myapplication.models.SongGroup
import com.gaudiyakirtan.myapplication.models.title
import com.gaudiyakirtan.myapplication.models.titleForListLanguage
import com.gaudiyakirtan.myapplication.ui.components.*
import com.gaudiyakirtan.myapplication.ui.library.LibraryViewModel.Category
import com.gaudiyakirtan.myapplication.ui.theme.neutral
import com.gaudiyakirtan.myapplication.utils.StringUtils

/**
 * Library screen with categorized content
 * Features tabs for Songs, Authors, Topics, and Books
 */
@Composable
fun LibraryScreen(
    onSongClick: (String) -> Unit = {},
    onAuthorClick: (String) -> Unit = {},
    onGroupClick: (String) -> Unit = {},
    viewModel: LibraryViewModel = viewModel()
) {
    val categories = remember { Category.values().toList() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Category selector at the top
        CategorySelector(
            categories = categories,
            selectedCategory = viewModel.selectedCategory,
            onCategorySelected = { viewModel.setCategory(it) },
            categoryToString = { it.title },
            modifier = Modifier.padding(top = 8.dp)
        )

        // Search bar
        LibrarySearchBar(
            searchText = viewModel.searchText,
            onSearchTextChange = { viewModel.updateSearchText(it) },
            placeholder = viewModel.getSearchPlaceholder(),
            modifier = Modifier.padding(16.dp)
        )

        // Category-specific content
        when (viewModel.selectedCategory) {
            Category.SONGS -> SongsContent(
                songs = viewModel.filteredSongs,
                authorNames = viewModel.authorNames,
                listLanguage = viewModel.listLanguage,
                onSongClick = onSongClick,
                modifier = Modifier.fillMaxSize()
            )

            Category.AUTHORS -> AuthorsContent(
                authors = viewModel.filteredAuthors,
                songCounts = viewModel.authorSongCounts,
                onAuthorClick = onAuthorClick,
                modifier = Modifier.fillMaxSize()
            )

            Category.TOPICS -> TopicsContent(
                topics = viewModel.filteredTopics,
                onGroupClick = onGroupClick,
                modifier = Modifier.fillMaxSize()
            )

            Category.BOOKS -> BooksContent(
                books = viewModel.filteredBooks,
                onGroupClick = onGroupClick,
                modifier = Modifier.fillMaxSize()
            )
        }
    }
}

@Composable
private fun SongsContent(
    songs: List<ManifestEntry>,
    authorNames: Map<String, String>,
    listLanguage: String,
    onSongClick: (String) -> Unit = {},
    modifier: Modifier = Modifier
) {
    // Manifest-driven list with the A-Z index keyed to `first_letter` and a stable Latin sort --
    // shared with the author-filtered variant (see SongsListWithIndex).
    SongsListWithIndex(
        songs = songs,
        authorNames = authorNames,
        listLanguage = listLanguage,
        onSongClick = onSongClick,
        modifier = modifier
    )
}

@Composable
private fun AuthorsContent(
    authors: List<Author>,
    onAuthorClick: (String) -> Unit,
    songCounts: Map<String, Int> = emptyMap(),
    modifier: Modifier = Modifier
) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        contentPadding = PaddingValues(16.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        modifier = modifier
    ) {
        items(authors) { author ->
            AuthorCard(
                author = author,
                songCount = songCounts[author.uid],
                onClick = { onAuthorClick(author.uid) }
            )
        }
    }
}

@Composable
private fun TopicsContent(
    topics: List<SongGroup>,
    onGroupClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    // Empty-state discipline (docs/screens/browse.md): only truly empty (e.g. a search with no
    // matches) shows this -- the shipped song_groups.json carries 74 real topics.
    if (topics.isEmpty()) {
        LibraryEmptyState(message = "No topics yet", modifier = modifier)
        return
    }
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        contentPadding = PaddingValues(16.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        modifier = modifier
    ) {
        items(topics, key = { it.uid }) { topic ->
            TopicCard(
                group = topic,
                onClick = { onGroupClick(topic.uid) }
            )
        }
    }
}

@Composable
private fun BooksContent(
    books: List<SongGroup>,
    onGroupClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    // Empty-state discipline (docs/screens/browse.md): only truly empty (e.g. a search with no
    // matches) shows this -- the shipped song_groups.json carries 19 real books.
    if (books.isEmpty()) {
        LibraryEmptyState(message = "No books yet", modifier = modifier)
        return
    }
    LazyVerticalGrid(
        columns = GridCells.Adaptive(minSize = 150.dp),
        contentPadding = PaddingValues(16.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        modifier = modifier
    ) {
        items(books, key = { it.uid }) { book ->
            BookCard(group = book, onClick = { onGroupClick(book.uid) })
        }
    }
}

/**
 * Tasteful, centered empty-state message (docs/screens/browse.md: "render a tasteful empty state,
 * never fake rows") for browse surfaces backed by data the shipped corpus doesn't carry yet.
 * Mirrors the pattern already used by [com.gaudiyakirtan.myapplication.ui.author.AuthorSongsScreen]
 * for its "no songs found" state.
 */
@Composable
private fun LibraryEmptyState(message: String, modifier: Modifier = Modifier) {
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = message,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.neutral
        )
    }
}
