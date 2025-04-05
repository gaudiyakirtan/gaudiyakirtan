package com.gaudiyakirtan.myapplication.ui.sections

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.models.Song
import com.gaudiyakirtan.myapplication.ui.components.SongCard

@Composable
fun SongsSection(songs: List<Song>) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(16.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        items(songs) { song ->
            SongCard(song = song)
        }
    }
}