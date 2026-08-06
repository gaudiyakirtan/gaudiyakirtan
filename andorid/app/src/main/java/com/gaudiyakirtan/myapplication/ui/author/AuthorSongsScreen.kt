package com.gaudiyakirtan.myapplication.ui.author

import com.gaudiyakirtan.myapplication.ui.theme.neutral

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.ui.components.SongsListWithIndex

/**
 * Author-filtered song list (docs/screens/songs-list.md, `Library (Author)` variant): the same
 * manifest-driven list with the A-Z index, filtered to a single author. Header shows the author;
 * the list shows only their songs. Reached from song-detail's author-tap and the Authors tab.
 */
@Composable
fun AuthorSongsScreen(
    viewModel: AuthorSongsViewModel,
    onSongClick: (String) -> Unit,
    onBackClick: () -> Unit
) {
    val songs by viewModel.songs.collectAsState()
    val authorName by viewModel.authorName.collectAsState()
    val authorNames by viewModel.authorNames.collectAsState()
    val listLanguage by viewModel.listLanguage.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Header: back + author name.
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBackClick) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
                Text(
                    text = authorName,
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }

            when {
                songs.isNotEmpty() -> SongsListWithIndex(
                    songs = songs,
                    authorNames = authorNames,
                    listLanguage = listLanguage,
                    onSongClick = onSongClick,
                    modifier = Modifier.fillMaxSize()
                )

                isLoading -> Box(modifier = Modifier.fillMaxSize())

                else -> Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No songs found for this author",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.neutral
                    )
                }
            }
        }
    }
}
