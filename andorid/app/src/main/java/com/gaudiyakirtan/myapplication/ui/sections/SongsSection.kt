package com.gaudiyakirtan.myapplication.ui.sections

import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyGridScope
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.ui.Modifier
import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.platform.testTag
import com.gaudiyakirtan.myapplication.models.ManifestEntry
import com.gaudiyakirtan.myapplication.models.titleForListLanguage
import com.gaudiyakirtan.myapplication.ui.components.SongListItem

/** Native song cells participate in Home's lazy grid, without nesting a vertical scroller. */
fun LazyGridScope.songsSection(
    songs: List<ManifestEntry>,
    authorNames: Map<String, String>,
    listLanguage: String,
    onSongClick: (String) -> Unit
) {
    if (songs.isEmpty()) return
    item(key = "songs-heading", span = { GridItemSpan(maxLineSpan) }) { SectionHeading("Songs", isHeading = false) }
    items(songs, key = { "song-${it.uid}" }) { song ->
        SongListItem(song.uid, song.titleForListLanguage(listLanguage),
            authorNames[song.authorUid].orEmpty(), song.audioAvailable,
            onClick = { onSongClick(song.uid) }, modifier = Modifier.testTag("song-${song.uid}"),
            containerColor = MaterialTheme.colorScheme.background)
    }
}
