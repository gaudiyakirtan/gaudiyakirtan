package com.gaudiyakirtan.myapplication.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
//import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material.icons.filled.Build
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.models.Song

@Composable
fun SongCard(
    song: Song,
    showTags: Boolean = true
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp),
        color = MaterialTheme.colorScheme.surface,
        shape = MaterialTheme.shapes.medium
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = song.title,
                        style = MaterialTheme.typography.bodyLarge,
                        maxLines = 1,
                        modifier = Modifier.weight(1f)
                    )

                    Surface(
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        shape = MaterialTheme.shapes.small
                    ) {
                        Text(
                            text = song.uid,
                            style = MaterialTheme.typography.labelSmall,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 2.dp)
                        )
                    }
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        text = song.author,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    if (song.audio) {
                        Icon(
                            Icons.Default.Build,
                            contentDescription = "Has Audio",
                            modifier = Modifier.size(12.dp)
                        )
                    }
                }
            }

            // if (showTags) {
            //     Row(
            //         horizontalArrangement = Arrangement.spacedBy(4.dp)
            //     ) {
            //         song.tags.forEach { tag ->
            //             Surface(
            //                 color = MaterialTheme.colorScheme.surfaceVariant,
            //                 shape = MaterialTheme.shapes.small
            //             ) {
            //                 Text(
            //                     text = tag,
            //                     style = MaterialTheme.typography.labelSmall,
            //                     modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
            //                 )
            //             }
            //         }
            //     }
            // }
        }
    }
}