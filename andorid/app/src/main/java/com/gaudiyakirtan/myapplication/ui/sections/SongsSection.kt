package com.gaudiyakirtan.myapplication.ui.sections

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.models.Song
import com.gaudiyakirtan.myapplication.ui.components.SongCard

@Composable
fun SongsSection(songs: List<Song>) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = "Songs",
            style = MaterialTheme.typography.titleLarge,
            modifier = Modifier.padding(bottom = 16.dp)
        )
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // First column of songs (even indices)
                for (i in songs.indices.filter { it % 2 == 0 }) {
                    SongCard(song = songs[i], showTags = false) // Hide tags in grid view
                }
            }
            
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Second column of songs (odd indices)
                for (i in songs.indices.filter { it % 2 == 1 }) {
                    SongCard(song = songs[i], showTags = false) // Hide tags in grid view
                }
            }
        }
    }
}