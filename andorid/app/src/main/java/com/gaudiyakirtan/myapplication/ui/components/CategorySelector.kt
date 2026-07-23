package com.gaudiyakirtan.myapplication.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * A selector component for switching between categories
 * Used in the Library view to switch between Songs, Authors, Topics, and Books
 */
@Composable
fun <T> CategorySelector(
    categories: List<T>,
    selectedCategory: T,
    onCategorySelected: (T) -> Unit,
    categoryToString: (T) -> String,
    modifier: Modifier = Modifier
) {
    LazyRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        contentPadding = PaddingValues(horizontal = 16.dp),
        modifier = modifier
    ) {
        items(categories) { category ->
            val isSelected = category == selectedCategory
            
            Button(
                onClick = { onCategorySelected(category) },
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(
                    // Selected pill is tinted to the accent/highlight (docs/screens/theme.md
                    // "Interactive controls"); unselected pills get a neutral card fill so the
                    // accent reads as the one active/selected state, not the reverse.
                    containerColor = if (isSelected)
                        MaterialTheme.colorScheme.surfaceVariant
                    else
                        MaterialTheme.colorScheme.surface,
                    contentColor = if (isSelected)
                        MaterialTheme.colorScheme.onSurfaceVariant // onHighlight
                    else
                        MaterialTheme.colorScheme.onBackground
                ),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                modifier = Modifier.height(36.dp)
            ) {
                Text(
                    text = categoryToString(category),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}