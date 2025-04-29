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
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.gaudiyakirtan.myapplication.models.Author
import com.gaudiyakirtan.myapplication.models.Book
import com.gaudiyakirtan.myapplication.models.Song
import com.gaudiyakirtan.myapplication.models.Topic
import com.gaudiyakirtan.myapplication.ui.components.*
import com.gaudiyakirtan.myapplication.ui.library.LibraryViewModel.Category
import com.gaudiyakirtan.myapplication.utils.StringUtils

/**
 * Library screen with categorized content
 * Features tabs for Songs, Authors, Topics, and Books
 */
@Composable
fun LibraryScreen(
    onSongClick: (Song) -> Unit = {},
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
                onSongClick = onSongClick,
                modifier = Modifier.fillMaxSize()
            )
            
            Category.AUTHORS -> AuthorsContent(
                authors = viewModel.filteredAuthors,
                modifier = Modifier.fillMaxSize()
            )
            
            Category.TOPICS -> TopicsContent(
                topics = viewModel.filteredTopics,
                modifier = Modifier.fillMaxSize()
            )
            
            Category.BOOKS -> BooksContent(
                books = viewModel.filteredBooks,
                modifier = Modifier.fillMaxSize()
            )
        }
    }
}

@Composable
private fun SongsContent(
    songs: List<Song>,
    onSongClick: (Song) -> Unit = {},
    modifier: Modifier = Modifier
) {
    // Group songs by first letter for section headers
    val groupedSongs = songs.groupBy { 
        StringUtils.firstNormalizedLetter(it.title)
    }
    
    val lazyListState = rememberLazyListState()
    
    // Create section map for alphabetical scroll bar
    val sectionMap = remember(songs) {
        val result = mutableMapOf<String, Int>()
        var index = 0
        
        groupedSongs.keys.sorted().forEach { letter ->
            result[letter] = index
            index += (groupedSongs[letter]?.size ?: 0) + 1  // +1 for section header
        }
        
        result
    }
    
    Box(modifier = modifier) {
        LazyColumn(
            state = lazyListState,
            contentPadding = PaddingValues(start = 16.dp, end = 32.dp, bottom = 16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            groupedSongs.keys.sorted().forEach { letter ->
                // Section header
                item {
                    Text(
                        text = letter,
                        style = MaterialTheme.typography.titleLarge,
                        color = MaterialTheme.colorScheme.tertiary,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                }
                
                // Songs for this section
                items(groupedSongs[letter] ?: emptyList()) { song ->
                    SongListItem(
                        song = song,
                        onClick = { onSongClick(song) }
                    )
                }
            }
        }
        
        // Alphabetical scroll bar
        AlphabeticalScrollBar(
            lazyListState = lazyListState,
            sectionMap = sectionMap,
            modifier = Modifier.align(androidx.compose.ui.Alignment.CenterEnd)
        )
    }
}

@Composable
private fun AuthorsContent(
    authors: List<Author>,
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
                onClick = { /* Handle author click */ }
            )
        }
    }
}

@Composable
private fun TopicsContent(
    topics: List<Topic>,
    modifier: Modifier = Modifier,
    viewModel: LibraryViewModel = viewModel()
) {
    // Get songs from the viewModel to count them for each topic
    val songs = viewModel.songs
    
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        contentPadding = PaddingValues(16.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        modifier = modifier
    ) {
        items(topics) { topic ->
            // Count songs for this topic or use demo count if zero
            val actualSongCount = songs.count { song ->
                song.tags.any { tag -> 
                    tag.equals(topic.name, ignoreCase = true) 
                }
            }
            
            TopicCard(
                topic = topic,
                onClick = { /* Handle topic click */ },
                songCount = if (actualSongCount > 0) actualSongCount else topic.demoSongCount
            )
        }
    }
}

@Composable
private fun BooksContent(
    books: List<Book>,
    modifier: Modifier = Modifier
) {
    LazyVerticalGrid(
        columns = GridCells.Adaptive(minSize = 150.dp),
        contentPadding = PaddingValues(16.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        modifier = modifier
    ) {
        items(books) { book ->
            BookCard(
                book = book,
                onClick = { /* Handle book click */ }
            )
        }
    }
}