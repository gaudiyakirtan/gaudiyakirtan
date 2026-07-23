package com.gaudiyakirtan.myapplication.ui.sections

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.models.Author
import com.gaudiyakirtan.myapplication.ui.components.AuthorCard

@Composable
fun AuthorsSection(
    authors: List<Author>,
    songCounts: Map<String, Int> = emptyMap(),
    onAuthorClick: (String) -> Unit = {}
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "Authors",
            style = MaterialTheme.typography.titleLarge,
            modifier = Modifier.padding(horizontal = 16.dp)
        )

        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(horizontal = 16.dp)
        ) {
            items(authors) { author ->
                AuthorCard(
                    author = author,
                    songCount = songCounts[author.uid],
                    onClick = { onAuthorClick(author.uid) }
                )
            }
        }
    }
}