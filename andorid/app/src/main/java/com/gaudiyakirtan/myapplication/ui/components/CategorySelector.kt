package com.gaudiyakirtan.myapplication.ui.components

import com.gaudiyakirtan.myapplication.ui.theme.Spacing
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
        horizontalArrangement = Arrangement.spacedBy(Spacing.sm),
        contentPadding = PaddingValues(horizontal = Spacing.lg),
        modifier = modifier
    ) {
        items(categories) { category ->
            val isSelected = category == selectedCategory
            
            Button(
                onClick = { onCategorySelected(category) },
                shape = MaterialTheme.shapes.medium,
                colors = ButtonDefaults.buttonColors(
                    // Selected pill is tinted to the accent/highlight (docs/screens/theme.md
                    // "Interactive controls"); unselected pills get a neutral card fill so the
                    // accent reads as the one active/selected state, not the reverse.
                    containerColor = if (isSelected)
                        MaterialTheme.colorScheme.primary
                    else
                        MaterialTheme.colorScheme.surface,
                    contentColor = if (isSelected)
                        MaterialTheme.colorScheme.onPrimary // onHighlight
                    else
                        MaterialTheme.colorScheme.onBackground
                ),
                contentPadding = PaddingValues(horizontal = Spacing.lg, vertical = Spacing.sm),
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