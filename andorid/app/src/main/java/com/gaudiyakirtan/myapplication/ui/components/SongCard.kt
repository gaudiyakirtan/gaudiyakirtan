package com.gaudiyakirtan.myapplication.ui.components

import com.gaudiyakirtan.myapplication.ui.theme.Spacing
import com.gaudiyakirtan.myapplication.ui.theme.neutral

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gaudiyakirtan.myapplication.ui.components.icons.MusicNote

/**
 * A song card for grid/list display, driven by the lightweight list fields a
 * [com.gaudiyakirtan.myapplication.models.ManifestEntry] carries (see docs/data/manifest.md) --
 * the manifest is what list/browse screens read, not a full
 * [com.gaudiyakirtan.myapplication.models.Song]. `authorName` is resolved by the caller from the
 * author catalog (the manifest only carries `author_uid`, not a display name).
 */
@Composable
fun SongCard(
    uid: String,
    title: String,
    authorName: String,
    audioAvailable: Boolean,
    onClick: () -> Unit = {}
) {
    // Define the neutral color from the theme
    val neutralColor = MaterialTheme.colorScheme.neutral

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .clip(MaterialTheme.shapes.medium),
        color = MaterialTheme.colorScheme.surface,
        onClick = onClick
    ) {
        Row(
            modifier = Modifier.padding(horizontal = Spacing.md),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(top = Spacing.sm)
                ) {
                    // Song title in primary *text* color -- see SongListItem for why this is
                    // `onSurface` and not `colorScheme.primary` (which carries the accent since
                    // theme.md v2). Web's SongCard paints the same element with `--primary`.
                    Text(
                        text = title,
                        // Type roles, not one-off sizes: a card's song title is a *title*, so it
                        // takes titleSmall and inherits the scale's weight/tracking contrast.
                        style = MaterialTheme.typography.titleSmall,
                        color = MaterialTheme.colorScheme.onSurface,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f, fill = false)
                    )

                    Spacer(modifier = Modifier.width(Spacing.sm))

                    // UID tag with neutral color background at 20% opacity
                    Box(
                        modifier = Modifier
                            .clip(MaterialTheme.shapes.small)
                            .background(neutralColor.copy(alpha = 0.25f))
                            .padding(horizontal = Spacing.md, vertical = Spacing.xxs)
                    ) {
                        Text(
                            text = uid,
                            style = MaterialTheme.typography.labelSmall,
                            color = neutralColor
                        )
                    }
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(Spacing.sm),
                    modifier = Modifier.padding(bottom = Spacing.sm)
                ) {
                    // Author text with neutral color
                    Text(
                        text = authorName,
                        style = MaterialTheme.typography.bodyMedium,
                        color = neutralColor,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )

                    // Music note icon with neutral color
                    if (audioAvailable) {
                        MusicNote(
                            modifier = Modifier.size(12.dp),
                            color = neutralColor
                        )
                    }
                }
            }
        }
    }
}
