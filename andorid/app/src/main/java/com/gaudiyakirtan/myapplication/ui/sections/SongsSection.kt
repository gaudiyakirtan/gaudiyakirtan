package com.gaudiyakirtan.myapplication.ui.sections

import com.gaudiyakirtan.myapplication.ui.theme.Spacing
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.models.ManifestEntry
import com.gaudiyakirtan.myapplication.models.titleForListLanguage
import com.gaudiyakirtan.myapplication.ui.components.SongCard

@Composable
fun SongsSection(
    songs: List<ManifestEntry>,
    authorNames: Map<String, String> = emptyMap(),
    listLanguage: String = "Latn",
    onSongClick: (String) -> Unit = {}
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(Spacing.lg)
    ) {
        Text(
            text = "Songs",
            style = MaterialTheme.typography.titleLarge,
            modifier = Modifier.padding(horizontal = Spacing.lg)
        )

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = Spacing.lg),
            horizontalArrangement = Arrangement.spacedBy(Spacing.lg)
        ) {
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(Spacing.lg)
            ) {
                // First column of songs (even indices)
                for (i in songs.indices.filter { it % 2 == 0 }) {
                    val song = songs[i]
                    SongCard(
                        uid = song.uid,
                        title = song.titleForListLanguage(listLanguage),
                        authorName = authorNames[song.authorUid] ?: "",
                        audioAvailable = song.audioAvailable,
                        onClick = { onSongClick(song.uid) }
                    )
                }
            }

            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(Spacing.lg)
            ) {
                // Second column of songs (odd indices)
                for (i in songs.indices.filter { it % 2 == 1 }) {
                    val song = songs[i]
                    SongCard(
                        uid = song.uid,
                        title = song.titleForListLanguage(listLanguage),
                        authorName = authorNames[song.authorUid] ?: "",
                        audioAvailable = song.audioAvailable,
                        onClick = { onSongClick(song.uid) }
                    )
                }
            }
        }
    }
}
