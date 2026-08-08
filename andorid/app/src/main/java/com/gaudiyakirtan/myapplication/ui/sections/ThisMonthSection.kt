package com.gaudiyakirtan.myapplication.ui.sections

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import com.gaudiyakirtan.data.ImageConfig
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
 * ## Screen-design decisions (CLAUDE.md "Screen design process")
 *
 * - **Goal / primary action:** "what do I sing right now?" — open one of this month's songs.
 * - **Layout:** a single card holding a banner over a list. The spec's "banner left, songs right"
 *   is web's *expanded* arrangement; at compact width web stacks them, and the phone is compact.
 * - **Hierarchy:** banner (which month it is) → song rows (what to sing) → the "sung this month"
 *   label, which is a quiet tag on the list, not a heading competing with the banner.
 * - **The one expressive focal element is the banner**, and it earns it by being the only thing on
 *   Home that answers the screen's question by itself: everything else is navigation. It carries
 *   the emphasis with a gradient fill, the artwork slot and overlaid type — the row list beneath it
 *   stays deliberately quiet so the contrast reads.
 *
 * Honesty constraints from the spec, all load-bearing:
 * - A month with **no songs is a real case** (Pauṣa ships none). Say so plainly — never fabricate
 *   rows to fill the region.
 * - When the date falls outside the calendar's precomputed range, the caller passes `null` and the
 *   region disappears entirely rather than showing a wrong month.
 * - Song order is already decided upstream by [com.gaudiyakirtan.data.CalendarRepositoryLogic]:
 *   evidence strength first (`observed` → `panjika` → `book` → `thematic`), then a stable partition
 *   putting playable songs ahead. The `basis` itself is deliberately not badged on every row.
 */
@Composable
fun ThisMonthSection(
    today: CalendarToday,
    songs: List<ManifestEntry>,
    authorNames: Map<String, String> = emptyMap(),
    listLanguage: String = "Latn",
    onSongClick: (String) -> Unit = {}
) {
    // The card is what makes the region read as one object rather than three loose stripes on the
    // page: offset fill + border, one step of shadow, no tonal elevation (a tinted card would pull
    // the accent out of the banner, which is where the accent is supposed to live).
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = Spacing.lg),
        shape = MaterialTheme.shapes.medium,
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
        shadowElevation = 1.dp,
        tonalElevation = 0.dp
    ) {
        Column(
            modifier = Modifier.padding(Spacing.lg),
            verticalArrangement = Arrangement.spacedBy(Spacing.lg)
        ) {
            MonthBanner(
                title = today.window.lunarMonth,
                imageUri = ImageConfig.monthArtworkUri(today.window.gaudiyaMonth),
                subtitle = today.window.gaudiyaMonth,
                caption = today.month.observances.joinToString(" · ").ifBlank { null },
                // An intercalary month is Puruṣottama and is genuinely unusual — worth naming.
                badge = if (today.window.adhika) "adhika-māsa" else null
            )

            // No arrangement spacing: the rows are a continuous list and each already carries its
            // own 56dp of height, so a gap between them would break the list into loose cards. The
            // label pays for its own separation instead.
            Column {
                // A quiet tag on the list, not a section heading: the banner directly above already
                // holds the emphasis, and two loud things next to each other read as neither.
                Text(
                    text = "SUNG THIS MONTH",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.neutral.copy(alpha = 0.7f),
                    modifier = Modifier.padding(bottom = Spacing.xs)
                )

                if (songs.isEmpty()) {
                    // A real state, not a failure: some months carry no songs in the shipped corpus.
                    Text(
                        text = "No songs are recorded for ${today.window.lunarMonth}.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.neutral,
                        modifier = Modifier.padding(vertical = Spacing.sm)
                    )
                } else {
                    songs.forEach { song ->
                        // TODO: web's playable rows also carry a recording picker (stacked singer
                        // avatars + take count) that starts a take in the mini-player without
                        // navigating. That needs player wiring this section does not have yet.
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
}

/**
 * The month banner: artwork when there is any, a themed gradient when there is not, a dark scrim
 * over whichever it got, and the month's text overlaid bottom-left.
 *
 * Artwork is best-effort by design — only Vāmana ships a file, so **the gradient is the normal
 * path, not an error** (docs/screens/home.md §1 "Artwork"; ImageConfig.monthArtworkUri). Nothing
 * here signals failure: a missing image simply leaves the gradient visible underneath, which is why
 * the gradient is painted on the container rather than as a fallback painter.
 */
@Composable
private fun MonthBanner(
    title: String,
    imageUri: String,
    subtitle: String?,
    caption: String?,
    badge: String?
) {
    // Web's `from-accent/70 via-highlight/40 to-background-offset`, top-left to bottom-right.
    // `accent` and `highlight` are the same token in both palettes, so this is one hue thinning out
    // into the card's own surface — the banner reads as lit from the corner rather than as a slab.
    val gradient = Brush.linearGradient(
        colors = listOf(
            MaterialTheme.colorScheme.primary.copy(alpha = 0.7f),
            MaterialTheme.colorScheme.primary.copy(alpha = 0.4f),
            MaterialTheme.colorScheme.surface
        ),
        start = Offset.Zero,
        end = Offset.Infinite
    )

    Box(
        modifier = Modifier
            .fillMaxWidth()
            // A minimum, not a fixed height: the observance line and the reader's font scale both
            // grow this box, and clipping either would be the accessibility trade the spec forbids.
            .heightIn(min = 160.dp)
            .clip(MaterialTheme.shapes.small)
            .background(gradient)
    ) {
        AsyncImage(
            model = imageUri,
            // Decorative: the month is named in the text right below it (web marks it aria-hidden
            // for the same reason), so announcing the artwork would just repeat the heading.
            contentDescription = null,
            contentScale = ContentScale.Crop,
            // No error/placeholder painter on purpose — on any failure this draws nothing and the
            // gradient behind it is what the reader sees.
            modifier = Modifier.matchParentSize()
        )

        // Bottom-to-top black scrim, so the overlaid text stays legible over artwork whose colors
        // we do not control. Fixed black rather than a theme token: `onSurface` flips with the
        // palette and would invert this into a *lightening* wash in Shyam (same reasoning as
        // BookCard's scrim).
        Box(
            modifier = Modifier
                .matchParentSize()
                .background(
                    Brush.verticalGradient(
                        listOf(
                            Color.Transparent,
                            Color.Black.copy(alpha = 0.3f),
                            Color.Black.copy(alpha = 0.75f)
                        )
                    )
                )
        )

        Column(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(Spacing.md),
            verticalArrangement = Arrangement.spacedBy(Spacing.xxs)
        ) {
            if (badge != null) {
                Text(
                    text = badge,
                    style = MaterialTheme.typography.labelSmall.onArtwork(),
                    color = Color.White,
                    modifier = Modifier
                        .clip(MaterialTheme.shapes.extraSmall)
                        .background(Color.White.copy(alpha = 0.2f))
                        .padding(horizontal = Spacing.sm, vertical = Spacing.xxs)
                )
            }

            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge.onArtwork(),
                color = Color.White
            )

            if (subtitle != null) {
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodyMedium.onArtwork(),
                    color = Color.White.copy(alpha = 0.8f)
                )
            }

            if (caption != null) {
                Text(
                    text = caption,
                    style = MaterialTheme.typography.bodySmall.onArtwork(),
                    color = Color.White.copy(alpha = 0.75f),
                    // An observance list can run long; two lines is the budget before it starts
                    // crowding out the month name it is annotating.
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}

/**
 * Adds the drop shadow every line of banner text needs.
 *
 * White-on-artwork is the one place the palette does not decide the text color: `onPrimary` means
 * "legible on the accent fill", and this text sits on a photograph the theme knows nothing about.
 * The shadow is what keeps it readable where the artwork happens to be light, and it is applied
 * through the type roles rather than as a per-call `TextStyle`, so no one has to remember it.
 */
private fun TextStyle.onArtwork(): TextStyle = copy(
    shadow = Shadow(
        color = Color.Black.copy(alpha = 0.5f),
        offset = Offset(0f, 1f),
        blurRadius = 3f
    )
)
