package com.gaudiyakirtan.myapplication.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gaudiyakirtan.myapplication.models.Collection
import com.gaudiyakirtan.myapplication.ui.theme.getMediaColor

/**
 * Collection card component with song count
 * Reuses styling from TopicCard for consistency
 */
@Composable
fun CollectionCard(
    collection: Collection,
    onClick: () -> Unit = {},
    songCount: Int? = collection.songIds.size.takeIf { it > 0 }
) {
    val mediaColor = getMediaColor(collection.name)
    val textColor = Color.White
    
    Surface(
        modifier = Modifier
            .width(176.dp)
            .height(108.dp), 
        color = mediaColor,
        shape = MaterialTheme.shapes.medium,
        onClick = onClick
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Collection name
            Text(
                text = collection.name,
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                lineHeight = 19.sp,
                color = textColor,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
            )
            
            // Song count (if available)
            if (songCount != null && songCount > 0) {
                Text(
                    text = "$songCount songs",
                    fontSize = 12.sp,
                    color = textColor.copy(alpha = 0.8f),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
        }
    }
}