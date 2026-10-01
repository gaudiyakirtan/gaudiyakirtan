package com.gaudiyakirtan.myapplication.ui.sections

import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.models.SongGroup
import com.gaudiyakirtan.myapplication.ui.components.HomeTopicCard

@Composable
fun TopicsSection(
    topics: List<SongGroup>,
    onTopicClick: (String) -> Unit = {},
    vertical: Boolean = false
) = HomeShelf("Topics", topics, { it.uid }, 176.dp, vertical) { topic, modifier ->
    HomeTopicCard(topic, modifier) { onTopicClick(topic.uid) }
}
