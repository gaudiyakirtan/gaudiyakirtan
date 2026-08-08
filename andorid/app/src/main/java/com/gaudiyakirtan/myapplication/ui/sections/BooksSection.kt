package com.gaudiyakirtan.myapplication.ui.sections

import com.gaudiyakirtan.myapplication.ui.theme.Spacing
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.models.SongGroup
import com.gaudiyakirtan.myapplication.ui.components.BookCard

/** Book [SongGroup]s (docs/data/collections.md), rendered only when [books] is non-empty. */
@Composable
fun BooksSection(books: List<SongGroup>, onBookClick: (String) -> Unit = {}) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(Spacing.sm)
    ) {
        Text(
            text = "Books",
            style = MaterialTheme.typography.titleLarge.copy(
                fontWeight = FontWeight.Bold
            ),
            modifier = Modifier.padding(horizontal = Spacing.lg, vertical = Spacing.sm)
        )

        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(Spacing.md),
            contentPadding = PaddingValues(horizontal = Spacing.lg)
        ) {
            // Add a small spacer at the beginning, just like in iOS
            item {
                Spacer(modifier = Modifier.width(Spacing.sm))
            }

            items(books, key = { it.uid }) { book ->
                BookCard(group = book, onClick = { onBookClick(book.uid) })
            }
        }
    }
}
