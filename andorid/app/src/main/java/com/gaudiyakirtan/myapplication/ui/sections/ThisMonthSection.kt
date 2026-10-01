package com.gaudiyakirtan.myapplication.ui.sections

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.font.FontSynthesis
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gaudiyakirtan.myapplication.models.*
import com.gaudiyakirtan.myapplication.ui.components.SongListItem
import com.gaudiyakirtan.myapplication.ui.home.HomeCard
import com.gaudiyakirtan.myapplication.ui.home.HomeModule
import com.gaudiyakirtan.myapplication.ui.theme.DisplayFontFamily
import com.gaudiyakirtan.myapplication.ui.theme.HomeFocus
import com.gaudiyakirtan.myapplication.ui.theme.HomeFocusAccent
import com.gaudiyakirtan.myapplication.ui.theme.HomeFocusMuted
import com.gaudiyakirtan.myapplication.ui.theme.HomeFocusSoft
import com.gaudiyakirtan.myapplication.ui.theme.HomeFocusText
import kotlin.math.cos
import kotlin.math.sin

/** Standalone seasonal composition, also used by deterministic calendar behavior tests. */
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
        Row(horizontalArrangement = Arrangement.spacedBy(28.dp)) {
            HomeModule("Season", Modifier.weight(1f)) { MonthContext(today, songCount = songs.size) }
            HomeModule("Seasonal songs", Modifier.weight(1f)) { MonthSongs(songs, authorNames, listLanguage, onSongClick) }
        }
    } else {
        Column(verticalArrangement = Arrangement.spacedBy(if (medium) 34.dp else 28.dp)) {
            HomeModule("Season") { MonthContext(today, songCount = songs.size) }
            HomeModule("Seasonal songs") { MonthSongs(songs, authorNames, listLanguage, onSongClick) }
        }
    }
}

private val monthOrder = listOf("Caitra", "Vaiśākha", "Jyeṣṭha", "Āṣāḍha", "Śrāvaṇa", "Bhādrapada",
    "Āśvina", "Kārtika", "Mārgaśīrṣa", "Pauṣa", "Māgha", "Phālguna")

internal fun monthDialIndex(lunarMonth: String): Int = monthOrder.indexOf(lunarMonth)

@Composable
fun MonthContext(today: CalendarToday, modifier: Modifier = Modifier, songCount: Int = today.month.songs.size) {
    val enlarged = LocalDensity.current.fontScale >= 1.5f
    val name = if (today.window.adhika) "Puruṣottama" else today.window.lunarMonth
    Surface(modifier.fillMaxWidth().testTag("month-context"), shape = RoundedCornerShape(28.dp),
        color = HomeFocus, shadowElevation = 8.dp) {
        Column(Modifier.background(Brush.linearGradient(listOf(HomeFocusSoft, HomeFocus)))
            .background(Brush.radialGradient(listOf(HomeFocusAccent.copy(alpha = 0.18f), Color.Transparent), Offset(280f, 80f), 420f))
            .heightIn(min = 330.dp).padding(24.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            // Full text survives enlargement. The dial marks alone are decorative, never the name.
            if (enlarged) {
                Text("This month", color = HomeFocusMuted, style = MaterialTheme.typography.bodyMedium)
                Text("$songCount seasonal ${if (songCount == 1) "song" else "songs"}", color = HomeFocusMuted,
                    style = MaterialTheme.typography.bodyMedium)
            } else {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("This month", color = HomeFocusMuted, style = MaterialTheme.typography.labelMedium)
                    Text("$songCount seasonal ${if (songCount == 1) "song" else "songs"}", color = HomeFocusMuted,
                        style = MaterialTheme.typography.labelMedium)
                }
            }
            Box(Modifier.fillMaxWidth().heightIn(min = if (enlarged) 220.dp else 218.dp), contentAlignment = Alignment.Center) {
                if (!enlarged) Canvas(Modifier.size(218.dp).clearAndSetSemantics { }) {
                    val unit = size.minDimension / 220f
                    drawCircle(HomeFocusText.copy(alpha = 0.08f), 76f * unit, style = Stroke(2f * unit))
                    val current = monthDialIndex(today.window.lunarMonth)
                    repeat(24) { index ->
                        val angle = Math.toRadians(index * 15.0 - 90.0)
                        val active = index / 2 == current
                        fun point(radius: Float) = center + Offset(cos(angle).toFloat(), sin(angle).toFloat()) * radius * unit
                        drawLine(if (active) HomeFocusAccent else HomeFocusText.copy(alpha = 0.27f),
                            point(90f), point(if (active) 75f else 80f),
                            (if (active) 6f else 4f) * unit, StrokeCap.Round)
                    }
                }
                Column(Modifier.then(if (enlarged) Modifier.fillMaxWidth() else Modifier.widthIn(max = 220.dp))
                    .padding(vertical = 22.dp), horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(7.dp)) {
                    Text(name, style = MaterialTheme.typography.headlineMedium.copy(fontFamily = DisplayFontFamily,
                        fontWeight = FontWeight.Normal, fontSynthesis = FontSynthesis.None, letterSpacing = 0.sp),
                        color = HomeFocusText, textAlign = TextAlign.Center, modifier = Modifier.semantics { heading() })
                    val secondary = if (today.window.adhika) "adhika-māsa" else today.window.gaudiyaMonth
                    if (secondary != name) Text(secondary, style = MaterialTheme.typography.bodyMedium,
                        color = HomeFocusMuted, textAlign = TextAlign.Center)
                }
            }
            if (today.month.observances.isNotEmpty()) Text(today.month.observances.joinToString(" · "),
                style = MaterialTheme.typography.bodyMedium, color = HomeFocusMuted)
        }
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
    HomeCard(modifier.testTag("month-songs")) {
        Column(Modifier.heightIn(min = 240.dp).padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            SectionHeading("Sung this month")
            if (songs.isEmpty()) Text("No songs are specific to this month.", style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant)
            else Column(Modifier.semantics { collectionInfo = CollectionInfo(songs.size, 1) }) {
                // The repository resolves and stably partitions the complete list; never cap it.
                songs.forEachIndexed { index, song ->
                    if (index > 0) HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                    SongListItem(song.uid, song.titleForListLanguage(listLanguage),
                        authorNames[song.authorUid].orEmpty(), song.audioAvailable,
                        onClick = { onSongClick(song.uid) }, modifier = Modifier.testTag("month-song-${song.uid}"))
                }
            }
        }
    }
}

@Composable
fun SectionHeading(title: String, modifier: Modifier = Modifier) {
    Text(title, style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurface,
        modifier = modifier.semantics { heading() })
}
