package com.gaudiyakirtan.myapplication.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.models.Author

@Composable
fun AuthorCard(author: Author) {
    Column(
        modifier = Modifier.width(120.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(80.dp)
                .clip(CircleShape),
            contentAlignment = Alignment.Center
        ) {
            // Placeholder for image - in a real app, you would load the image from resources or a URL
            // For now, just use a placeholder with the first letter of the author's name
            Text(
                text = author.name.firstOrNull()?.toString() ?: "",
                style = MaterialTheme.typography.headlineLarge,
                color = MaterialTheme.colorScheme.primary
            )
        }

        Text(
            text = author.name,
            style = MaterialTheme.typography.bodyMedium,
            maxLines = 2
        )
    }
}