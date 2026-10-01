package com.gaudiyakirtan.myapplication.ui.sections

import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.models.Author
import com.gaudiyakirtan.myapplication.ui.components.HomeAuthorCard

@Composable
fun AuthorsSection(
    authors: List<Author>,
    songCounts: Map<String, Int> = emptyMap(),
    onAuthorClick: (String) -> Unit = {},
    vertical: Boolean = false,
    listLanguage: String = "Latn"
) = HomeShelf("Authors", authors, { it.uid }, 208.dp, vertical) { author, modifier ->
    HomeAuthorCard(author, songCounts[author.uid], listLanguage, modifier) { onAuthorClick(author.uid) }
}
