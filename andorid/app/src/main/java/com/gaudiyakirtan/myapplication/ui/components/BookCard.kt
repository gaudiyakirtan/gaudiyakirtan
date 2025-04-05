package com.gaudiyakirtan.myapplication.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import com.gaudiyakirtan.myapplication.models.Book
import com.gaudiyakirtan.myapplication.ui.theme.getMediaColor

@Composable
fun BookCard(book: Book) {
    Box(
        modifier = Modifier
            .width(144.dp)
            .height(192.dp)
            .clip(MaterialTheme.shapes.medium)
    ) {
        // Background Image
        book.image?.let {
            AsyncImage(
                model = it,
                contentDescription = book.title,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
        }

        // Gradients
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            getMediaColor(book.title),
                            androidx.compose.ui.graphics.Color.Transparent
                        )
                    )
                )
        )

        // Content
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.Bottom
        ) {
            Text(
                text = book.title,
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.surface,
                maxLines = 3
            )
            book.author?.let {
                Text(
                    text = it,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.surface,
                    maxLines = 2
                )
            }
        }
    }
}