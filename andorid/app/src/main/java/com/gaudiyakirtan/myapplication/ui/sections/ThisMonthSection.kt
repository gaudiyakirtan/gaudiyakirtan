package com.gaudiyakirtan.myapplication.ui.sections

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.*
import com.gaudiyakirtan.myapplication.models.*
import com.gaudiyakirtan.myapplication.ui.components.SongListItem
import com.gaudiyakirtan.myapplication.ui.theme.Spacing

/** A readable context strip followed by the complete, repository-ordered repertoire. */
@Composable
fun ThisMonthSection(
    today: CalendarToday,
    songs: List<ManifestEntry>,
    authorNames: Map<String, String> = emptyMap(),
    listLanguage: String = "Latn",
    onSongClick: (String) -> Unit = {}
) {
    Column(verticalArrangement = Arrangement.spacedBy(Spacing.lg)) {
        MonthContext(today, songCount = songs.size)
        MonthSongs(songs, authorNames, listLanguage, onSongClick)
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun MonthContext(today: CalendarToday, modifier: Modifier = Modifier, songCount: Int = today.month.songs.size) {
    Column(modifier.fillMaxWidth().testTag("month-context"), verticalArrangement = Arrangement.spacedBy(Spacing.xs)) {
        FlowRow(horizontalArrangement = Arrangement.spacedBy(Spacing.sm),
            verticalArrangement = Arrangement.spacedBy(Spacing.xs)) {
            Text(if (today.window.adhika) "Puruṣottama" else today.window.lunarMonth,
                style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(if (today.window.adhika) "adhika-māsa" else today.window.gaudiyaMonth,
                style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text("$songCount ${if (songCount == 1) "song" else "songs"}",
                style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        if (today.month.observances.isNotEmpty()) Text(today.month.observances.joinToString(" · "),
            style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
fun MonthSongs(
    songs: List<ManifestEntry>,
    authorNames: Map<String, String>,
    listLanguage: String,
    onSongClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(modifier.fillMaxWidth().testTag("month-songs"), verticalArrangement = Arrangement.spacedBy(Spacing.xs)) {
        SectionHeading("Sung this month", isHeading = false)
        if (songs.isEmpty()) Text("No songs are specific to this month.", style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant)
        else Column(Modifier.semantics { collectionInfo = CollectionInfo(songs.size, 1) }) {
            // SongListItem remains the canonical row; availability opens the native detail flow.
            // Home never caps this list or introduces a second recording picker.
            songs.forEachIndexed { index, song ->
                if (index > 0) HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                SongListItem(song.uid, song.titleForListLanguage(listLanguage),
                    authorNames[song.authorUid].orEmpty(), song.audioAvailable,
                    onClick = { onSongClick(song.uid) }, modifier = Modifier.testTag("month-song-${song.uid}"),
                    containerColor = MaterialTheme.colorScheme.background)
            }
        }
    }
}

@Composable
fun SectionHeading(title: String, modifier: Modifier = Modifier, isHeading: Boolean = true) {
    Text(title, style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurface,
        modifier = modifier.then(if (isHeading) Modifier.semantics { heading() } else Modifier))
}
