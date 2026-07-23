package com.gaudiyakirtan.myapplication.ui.group

import com.gaudiyakirtan.myapplication.ui.theme.neutral

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.gaudiyakirtan.myapplication.models.title
import com.gaudiyakirtan.myapplication.models.titleForListLanguage
import com.gaudiyakirtan.myapplication.ui.components.SongListItem
import com.gaudiyakirtan.myapplication.ui.components.SongsListWithIndex

/**
 * A single Book/Topic's song list (docs/data/collections.md `SongGroup`): reached by tapping a
 * [com.gaudiyakirtan.myapplication.ui.components.BookCard]/[com.gaudiyakirtan.myapplication.ui.components.TopicCard]
 * on the Library Books/Topics tabs or the Home Books/Topics sections.
 *
 * `ordered` groups (books) show their `song_uids` in the shipped, authoritative order (docs/data/
 * collections.md invariant) as a plain list; unordered groups (topics) reuse the same alphabetical
 * A-Z list as every other song list, since order isn't meaningful there.
 */
@Composable
fun GroupSongsScreen(
    viewModel: GroupSongsViewModel,
    onSongClick: (String) -> Unit,
    onBackClick: () -> Unit
) {
    val group by viewModel.group.collectAsState()
    val songs by viewModel.songs.collectAsState()
    val authorNames by viewModel.authorNames.collectAsState()
    val listLanguage by viewModel.listLanguage.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
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
                        tint = MaterialTheme.colorScheme.surfaceVariant
                    )
                }
                Text(
                    text = group?.title ?: "",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }

            when {
                songs.isNotEmpty() && group?.ordered == true -> LazyColumn(
                    contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(songs, key = { it.uid }) { song ->
                        SongListItem(
                            uid = song.uid,
                            title = song.titleForListLanguage(listLanguage),
                            authorName = authorNames[song.authorUid] ?: "",
                            audioAvailable = song.audioAvailable,
                            onClick = { onSongClick(song.uid) }
                        )
                    }
                }

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
                        text = "No songs found for this group",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.neutral
                    )
                }
            }
        }
    }
}
