package com.gaudiyakirtan.myapplication.ui.sections

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.CollectionInfo
import androidx.compose.ui.semantics.collectionInfo
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gaudiyakirtan.myapplication.models.CalendarToday
import com.gaudiyakirtan.myapplication.models.ManifestEntry
import com.gaudiyakirtan.myapplication.models.titleForListLanguage
import com.gaudiyakirtan.myapplication.ui.components.RhythmArtwork
import com.gaudiyakirtan.myapplication.ui.components.SongListItem
import com.gaudiyakirtan.myapplication.ui.theme.Spacing

/** Two sibling surfaces. The month explains the repertoire; neither card is itself a control. */
@Composable
fun ThisMonthSection(
    today: CalendarToday,
    songs: List<ManifestEntry>,
    authorNames: Map<String, String> = emptyMap(),
    listLanguage: String = "Latn",
    onSongClick: (String) -> Unit = {},
    expanded: Boolean = false,
    medium: Boolean = false
) {
    if (expanded) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(Spacing.xl)) {
            MonthContext(today, Modifier.weight(5f), expanded = true)
            MonthSongs(songs, authorNames, listLanguage, onSongClick, Modifier.weight(7f), true)
        }
    } else {
        Column(
            verticalArrangement = Arrangement.spacedBy(if (medium) Spacing.xl else Spacing.lg)
        ) {
            MonthContext(today)
            MonthSongs(songs, authorNames, listLanguage, onSongClick)
        }
    }
}

@Composable
fun MonthContext(today: CalendarToday, modifier: Modifier = Modifier, expanded: Boolean = false) {
    Surface(
        modifier = modifier.fillMaxWidth().heightIn(min = 160.dp).testTag("month-context"),
        shape = MaterialTheme.shapes.large,
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
    ) {
        BoxWithConstraints(Modifier.padding(if (expanded) Spacing.xl else Spacing.lg)) {
            val showTrailingArt = !expanded && maxWidth >= 320.dp && LocalDensity.current.fontScale < 2f
            Column(verticalArrangement = Arrangement.spacedBy(Spacing.lg)) {
                Row(horizontalArrangement = Arrangement.spacedBy(Spacing.lg)) {
                    Column(
                        Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(Spacing.xs)
                    ) {
                        Text("This month", style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant)
                        val name = if (today.window.adhika) "Puruṣottama" else today.window.lunarMonth
                        Text(name, style = MaterialTheme.typography.headlineSmall.copy(letterSpacing = 0.sp),
                            color = MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.semantics { heading() })
                        val secondaryName = today.window.gaudiyaMonth
                        if (!today.window.adhika && secondaryName != name) {
                            Text(secondaryName, style = MaterialTheme.typography.bodyLarge,
                                color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        if (today.window.adhika) {
                            Text("adhika-māsa", style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        if (today.month.observances.isNotEmpty()) {
                            Text(today.month.observances.joinToString(" · "),
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                    if (showTrailingArt) RhythmArtwork(Modifier.width(96.dp))
                }
                if (expanded) {
                    RhythmArtwork(Modifier.width(240.dp).align(Alignment.CenterHorizontally))
                }
            }
        }
    }
}

@Composable
fun MonthSongs(
    songs: List<ManifestEntry>,
    authorNames: Map<String, String>,
    listLanguage: String,
    onSongClick: (String) -> Unit,
    modifier: Modifier = Modifier,
    expanded: Boolean = false
) {
    Surface(
        modifier = modifier.fillMaxWidth().testTag("month-songs"),
        shape = MaterialTheme.shapes.large,
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
    ) {
        Column(
            Modifier.padding(if (expanded) Spacing.xl else Spacing.lg),
            verticalArrangement = Arrangement.spacedBy(Spacing.lg)
        ) {
            SectionHeading("Sung this month")
            if (songs.isEmpty()) {
                Text("No songs are specific to this month.",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
            } else {
                Column(Modifier.semantics { collectionInfo = CollectionInfo(songs.size, 1) }) {
                    // The repository has already resolved and stably partitioned the full list.
                    songs.forEach { song ->
                        SongListItem(
                            song.uid, song.titleForListLanguage(listLanguage),
                            authorNames[song.authorUid].orEmpty(), song.audioAvailable,
                            onClick = { onSongClick(song.uid) },
                            modifier = Modifier.testTag("month-song-${song.uid}")
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun SectionHeading(title: String, modifier: Modifier = Modifier) {
    Text(title, style = MaterialTheme.typography.titleLarge,
        color = MaterialTheme.colorScheme.onSurface,
        modifier = modifier.semantics { heading() })
}
