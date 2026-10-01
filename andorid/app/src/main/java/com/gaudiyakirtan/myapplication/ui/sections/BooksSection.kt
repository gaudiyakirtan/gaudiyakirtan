package com.gaudiyakirtan.myapplication.ui.sections

import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.models.SongGroup
import com.gaudiyakirtan.myapplication.ui.components.HomeBookCard

@Composable
fun BooksSection(
    books: List<SongGroup>,
    onBookClick: (String) -> Unit = {},
    vertical: Boolean = false,
    expanded: Boolean = false
) = HomeShelf("Books", books, { it.uid }, if (expanded) 160.dp else 144.dp, vertical) { book, modifier ->
    HomeBookCard(book, modifier) { onBookClick(book.uid) }
}
