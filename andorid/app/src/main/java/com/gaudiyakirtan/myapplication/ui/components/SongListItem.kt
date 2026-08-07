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
 * A list item for displaying songs in a single column layout (Library view Songs tab).
 * Driven by the lightweight list fields a
 * [com.gaudiyakirtan.myapplication.models.ManifestEntry] carries -- see [SongCard]'s doc comment.
 */
@Composable
fun SongListItem(
    uid: String,
    title: String,
    authorName: String,
    audioAvailable: Boolean,
    onClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val neutralColor = MaterialTheme.colorScheme.neutral

    Surface(
        modifier = modifier
            .fillMaxWidth()
            .height(56.dp)
            .clip(MaterialTheme.shapes.medium),
        color = MaterialTheme.colorScheme.surface,
        onClick = onClick
    ) {
        Column(
            modifier = Modifier.padding(horizontal = Spacing.md, vertical = Spacing.xs)
        ) {
            // Title and UID row
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(top = Spacing.xs)
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodyLarge.copy(
                        color = MaterialTheme.colorScheme.primary,
                        fontSize = 14.sp
                    ),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f, fill = false)
                )

                Spacer(modifier = Modifier.width(Spacing.sm))

                // UID tag
                Box(
                    modifier = Modifier
                        .clip(MaterialTheme.shapes.small)
                        .background(neutralColor.copy(alpha = 0.25f))
                        .padding(horizontal = Spacing.md, vertical = Spacing.xxs)
                ) {
                    Text(
                        text = uid,
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = neutralColor,
                            fontSize = 10.sp,
                            fontWeight = androidx.compose.ui.text.font.FontWeight.Medium
                        )
                    )
                }
            }

            // Author and audio icon row
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(Spacing.sm),
                modifier = Modifier.padding(bottom = Spacing.xs, top = Spacing.xxs)
            ) {
                Text(
                    text = authorName,
                    style = MaterialTheme.typography.bodyMedium.copy(
                        color = neutralColor,
                        fontSize = 14.sp
                    ),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f, fill = false)
                )

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
