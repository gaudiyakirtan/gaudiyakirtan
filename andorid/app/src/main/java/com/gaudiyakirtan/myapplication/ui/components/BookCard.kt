package com.gaudiyakirtan.myapplication.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.gaudiyakirtan.myapplication.models.Book
import com.gaudiyakirtan.myapplication.ui.theme.getMediaColor

@Composable
fun BookCard(
    book: Book,
    onClick: () -> Unit = {}
) {
    // Get the media color for this book (will be used for placeholder)
    val mediaColor = getMediaColor(book.title)
    
    Box(
        modifier = Modifier
            .width(144.dp)
            .height(192.dp)
            .clip(MaterialTheme.shapes.medium)
    ) {
        // Background Image Layer with Placeholder
        if (book.image != null) {
            AsyncImage(
                model = book.image,
                contentDescription = book.title,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
        } else {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(mediaColor)
            )
        }

        // Gradient Overlays Layer
        GradientOverlays(book)

        // Content Layer
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(start = 12.dp, end = 12.dp, bottom = 24.dp),
            verticalArrangement = Arrangement.Bottom,
            horizontalAlignment = Alignment.Start
        ) {
            Text(
                text = book.title,
                style = TextStyle(
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    lineHeight = 20.sp
                ),
                color = MaterialTheme.colorScheme.onPrimary,
                maxLines = 3,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.width(100.dp)
            )
            
            Spacer(modifier = Modifier.height(2.dp))
            
            book.author?.let {
                Text(
                    text = it,
                    style = TextStyle(
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium,
                    ),
                    color = MaterialTheme.colorScheme.onPrimary,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.width(100.dp)
                )
            }
        }
    }
}

@Composable
private fun GradientOverlays(book: Book) {
    // Get the background color based on current theme
    val backgroundColor = MaterialTheme.colorScheme.background

    Box(modifier = Modifier.fillMaxSize()) {
        // 1. Color Overlay Gradient - matching iOS implementation
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            getMediaColor(book.title),
                            Color.Transparent
                        ),
                        startY = 0f,
                        endY = Float.POSITIVE_INFINITY / 2
                    )
                )
        )
        
        // 2. Bottom to Top Black Gradient
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                            Color.Transparent
                        ),
                        startY = Float.POSITIVE_INFINITY,
                        endY = Float.POSITIVE_INFINITY / 2
                    )
                )
        )
        
        // 3. Horizontal Left Gradient - similar to iOS horizontalLeftGradient
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.horizontalGradient(
                        colorStops = arrayOf(
                            0.0f to backgroundColor,
                            0.0258f to backgroundColor.copy(alpha = 0f),
                            0.0515f to backgroundColor.copy(alpha = 0.5f),
                            0.08f to backgroundColor.copy(alpha = 0f),
                            1f to backgroundColor.copy(alpha = 0f)
                        )
                    )
                )
        )
    }
}