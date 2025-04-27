package com.gaudiyakirtan.myapplication.ui.sections

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.data.SampleData
import com.gaudiyakirtan.myapplication.models.Song
import com.gaudiyakirtan.myapplication.models.Topic
import com.gaudiyakirtan.myapplication.ui.components.TopicCard

@Composable
fun TopicsSection(
    topics: List<Topic>,
    songs: List<Song> = SampleData.songs // Default to sample data if not provided
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "Topics",
            style = MaterialTheme.typography.titleLarge,
            modifier = Modifier.padding(horizontal = 16.dp)
        )

        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(horizontal = 16.dp)
        ) {
            items(topics) { topic ->
                // Use actual song count if available, otherwise use the demo count
                val actualSongCount = if (songs.isEmpty()) 0 else songs.count { song ->
                    song.tags.any { tag -> 
                        tag.equals(topic.name, ignoreCase = true) 
                    }
                }
                
                TopicCard(
                    topic = topic,
                    songCount = if (actualSongCount > 0) actualSongCount else topic.demoSongCount
                )
            }
        }
    }
}