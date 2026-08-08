package com.gaudiyakirtan.myapplication.ui.sections

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.style.TextOverflow
import com.gaudiyakirtan.myapplication.models.CalendarToday
import com.gaudiyakirtan.myapplication.models.ManifestEntry
import com.gaudiyakirtan.myapplication.models.titleForListLanguage
import com.gaudiyakirtan.myapplication.ui.components.SongListItem
import com.gaudiyakirtan.myapplication.ui.theme.Spacing
import com.gaudiyakirtan.myapplication.ui.theme.neutral

/**
 * Home's lead region — "Welcome + this month" (docs/screens/home.md region 1), backed by the
 * lunar-calendar overlay (docs/data/calendar.md).
 *
 * This is the screen's recommendation surface and **the only region that changes on its own**: the
 * lunar month turns over roughly monthly, so in Āṣāḍha it yields the Jagannātha/Ratha-yātrā songs
 * and in Kārtika the Dāmodarāṣṭakam set. Home without it recommends nothing, which is precisely why
 * the spec made it the hero.
 *
 * Honesty constraints from the spec, all load-bearing:
 * - A month with **no songs is a real case** (Pauṣa ships none). Say so plainly — never fabricate
 *   rows to fill the region.
 * - When the date falls outside the calendar's precomputed range, the caller passes `null` and the
 *   region disappears entirely rather than showing a wrong month.
 * - Song order is already decided upstream by [com.gaudiyakirtan.data.CalendarRepositoryLogic]:
 *   evidence strength first (`observed` → `panjika` → `book` → `thematic`), then a stable partition
 *   putting playable songs ahead. The `basis` itself is deliberately not badged on every row.
 *
 * The expressive focal element here is the **banner**: it is the one container on Home carrying the
 * accent as a fill, which is what marks it as the screen's lead rather than one more list header.
 */
@Composable
fun ThisMonthSection(
    today: CalendarToday,
    songs: List<ManifestEntry>,
    authorNames: Map<String, String> = emptyMap(),
    listLanguage: String = "Latn",
    onSongClick: (String) -> Unit = {}
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(Spacing.md)
    ) {
        // The banner. Accent fill + the large shape step: this is the screen's lead container.
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = Spacing.lg)
                .clip(MaterialTheme.shapes.large)
                .background(MaterialTheme.colorScheme.primary)
                .padding(Spacing.lg),
            verticalArrangement = Arrangement.spacedBy(Spacing.xs)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = today.window.lunarMonth,
                    style = MaterialTheme.typography.headlineMedium,
                    color = MaterialTheme.colorScheme.onPrimary
                )
                // An intercalary month is Puruṣottama and is genuinely unusual — worth naming.
                if (today.window.adhika) {
                    Text(
                        text = "adhika-māsa",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onPrimary,
                        modifier = Modifier
                            .clip(MaterialTheme.shapes.extraSmall)
                            .background(MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.2f))
                            .padding(horizontal = Spacing.sm, vertical = Spacing.xxs)
                    )
                }
            }

            Text(
                text = today.window.gaudiyaMonth,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onPrimary
            )

            if (today.month.observances.isNotEmpty()) {
                Text(
                    text = today.month.observances.joinToString(" · "),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onPrimary,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }

        Text(
            text = "Sung this month",
            style = MaterialTheme.typography.titleLarge,
            modifier = Modifier.padding(horizontal = Spacing.lg)
        )

        if (songs.isEmpty()) {
            // A real state, not a failure: some months carry no songs in the shipped corpus.
            Text(
                text = "No songs are recorded for ${today.window.lunarMonth}.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.neutral,
                modifier = Modifier.padding(horizontal = Spacing.lg)
            )
        } else {
            Column(modifier = Modifier.fillMaxWidth()) {
                songs.forEach { song ->
                    SongListItem(
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
