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
            .clip(RoundedCornerShape(12.dp)),
        color = MaterialTheme.colorScheme.surface,
        onClick = onClick
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(top = 8.dp)
                ) {
                    // Song title with primary color
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

                    Spacer(modifier = Modifier.width(6.dp))

                    // UID tag with neutral color background at 20% opacity
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(neutralColor.copy(alpha = 0.25f))
                            .padding(horizontal = 10.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = uid,
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = neutralColor,
                                fontSize = 10.sp
                            )
                        )
                    }
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.padding(bottom = 8.dp)
                ) {
                    // Author text with neutral color
                    Text(
                        text = authorName,
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = neutralColor,
                            fontSize = 13.sp
                        ),
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
