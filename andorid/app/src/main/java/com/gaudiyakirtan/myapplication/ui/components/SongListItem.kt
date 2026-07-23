package com.gaudiyakirtan.myapplication.ui.components

import com.gaudiyakirtan.myapplication.ui.theme.neutral

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
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
            .clip(RoundedCornerShape(12.dp)),
        color = MaterialTheme.colorScheme.surface,
        onClick = onClick
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
        ) {
            // Title and UID row
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(top = 4.dp)
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodyLarge.copy(
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        fontSize = 14.sp
                    ),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f, fill = false)
                )

                Spacer(modifier = Modifier.width(8.dp))

                // UID tag
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(11.dp))
                        .background(neutralColor.copy(alpha = 0.25f))
                        .padding(horizontal = 10.dp, vertical = 2.dp)
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
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier.padding(bottom = 4.dp, top = 2.dp)
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
