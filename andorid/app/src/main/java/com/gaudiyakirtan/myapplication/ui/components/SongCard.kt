package com.gaudiyakirtan.myapplication.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gaudiyakirtan.myapplication.models.Song
import com.gaudiyakirtan.myapplication.ui.components.icons.MusicNote

@Composable
fun SongCard(
    song: Song,
    onClick: () -> Unit = {},
    showTags: Boolean = true
) {
    // Define the neutral color from the theme
    val neutralColor = MaterialTheme.colorScheme.tertiary
    
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
                        text = song.title,
                        style = MaterialTheme.typography.bodyLarge.copy(
                            color = MaterialTheme.colorScheme.primary,
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
                            text = song.uid,
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
                        text = song.author,
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = neutralColor,
                            fontSize = 13.sp
                        ),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    
                    // Music note icon with neutral color
                    if (song.audio) {
                        MusicNote(
                            modifier = Modifier.size(12.dp),
                            color = neutralColor
                        )
                    }
                }
            }

            if (showTags && song.tags.isNotEmpty()) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    // Display up to 3 tags, starting from the last
                    song.tags.takeLast(3).reversed().forEach { tag ->
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(neutralColor.copy(alpha = 0.2f))
                                .padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = tag,
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = neutralColor,
                                    fontSize = 10.sp
                                )
                            )
                        }
                    }
                }
            }
        }
    }
}