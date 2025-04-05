package com.gaudiyakirtan.myapplication.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.models.Topic
import com.gaudiyakirtan.myapplication.ui.theme.getMediaColor

@Composable
fun TopicCard(topic: Topic) {
    Surface(
        modifier = Modifier
            .width(176.dp)
            .height(96.dp),
        color = getMediaColor(topic.name),
        shape = MaterialTheme.shapes.medium
    ) {
        Box(
            modifier = Modifier.padding(24.dp),
            contentAlignment = Alignment.TopStart
        ) {
            Text(
                text = topic.name,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.surface,
                maxLines = 2,
                modifier = Modifier.width(140.dp)
            )
        }
    }
}