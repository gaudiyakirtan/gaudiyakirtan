package com.gaudiyakirtan.myapplication.ui.sections

import com.gaudiyakirtan.myapplication.ui.theme.Spacing
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.models.SongGroup
import com.gaudiyakirtan.myapplication.ui.components.TopicCard

/**
 * Topic [SongGroup]s, per docs/data/collections.md `SongGroup(kind = topic)`. Rendered only when
 * [topics] is non-empty (docs/screens/browse.md empty-state discipline).
 */
@Composable
fun TopicsSection(
    topics: List<SongGroup>,
    onTopicClick: (String) -> Unit = {}
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(Spacing.lg)
    ) {
        Text(
            text = "Topics",
            style = MaterialTheme.typography.titleLarge,
            modifier = Modifier.padding(horizontal = Spacing.lg)
        )

        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(Spacing.md),
            contentPadding = PaddingValues(horizontal = Spacing.lg)
        ) {
            items(topics, key = { it.uid }) { topic ->
                TopicCard(
                    group = topic,
                    onClick = { onTopicClick(topic.uid) }
                )
            }
        }
    }
}
