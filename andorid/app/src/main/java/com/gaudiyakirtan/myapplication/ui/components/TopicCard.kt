package com.gaudiyakirtan.myapplication.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gaudiyakirtan.myapplication.models.Topic
import com.gaudiyakirtan.myapplication.ui.theme.getMediaColor

@Composable
fun TopicCard(
    topic: Topic,
    onClick: () -> Unit = {},
    songCount: Int? = null
) {
    val mediaColor = getMediaColor(topic.name)
    // Determine if the media color is dark to choose appropriate text color
    val textColor = Color.White // We could implement a brightness check like in web
    
    Surface(
        modifier = Modifier
            .width(176.dp)
            .height(108.dp), // Match web minHeight of 108px
        color = mediaColor,
        shape = MaterialTheme.shapes.medium,
        onClick = onClick
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp), // Match web padding of 1.25rem
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Topic name
            Text(
                text = topic.name,
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp, // Match web text-base
                lineHeight = 19.sp, // Match line-height: 1.2
                color = textColor,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp) // Match web min-height: 48px
            )
            
            // Song count badge at the bottom (if available)
            songCount?.let { count ->
                Tag(
                    text = "$count songs",
                    variant = TagVariant.Default,
                    size = TagSize.Normal,
                    modifier = Modifier.wrapContentWidth()
                )
            }
        }
    }
}