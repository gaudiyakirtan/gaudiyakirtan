package com.gaudiyakirtan.myapplication.ui.home

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.*
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.R
import com.gaudiyakirtan.myapplication.models.*
import com.gaudiyakirtan.myapplication.ui.components.NavigationSurface
import com.gaudiyakirtan.myapplication.ui.theme.Spacing

// Licensed covers shared with Web, bundled for offline browsing.
private val bookCovers = mapOf(
    "book-srinamastaka" to R.drawable.book_srinamastaka,
    "book-srisiksastaka" to R.drawable.book_srisiksastaka,
    "book-sriupadesamrta" to R.drawable.book_sriupadesamrta,
    "book-srimanahsiksa" to R.drawable.book_srimanahsiksa,
    "book-kalyanakalpataru" to R.drawable.book_kalyanakalpataru,
    "book-saranagati" to R.drawable.book_saranagati,
    "book-gitavali" to R.drawable.book_gitavali
)

@Composable
internal fun HomeBooks(books: List<SongGroup>, listLanguage: String, reflow: Boolean, onClick: (String) -> Unit) {
    HomeModule("Books") {
        BoxWithConstraints(Modifier.fillMaxWidth()) {
            // Two complete books and the next edge on a phone; three on tablets. At enlarged
            // text sizes a single wider book keeps the full label readable in the native rail.
            val bookWidth = if (reflow) maxWidth - Spacing.xxl else if (maxWidth >= 600.dp)
                (maxWidth - Spacing.xl * 2) / 3 else (maxWidth - Spacing.lg * 2) / 2.3f
            LazyRow(Modifier.testTag("shelf-Books"),
                horizontalArrangement = Arrangement.spacedBy(Spacing.lg), contentPadding = PaddingValues(Spacing.xs)) {
                items(books, key = { it.uid }) { book ->
                    val title = book.titles.preferredText(listLanguage)
                    NavigationSurface({ onClick(book.uid) }, Modifier.width(bookWidth).testTag("book-${book.uid}"),
                        shape = MaterialTheme.shapes.small, color = MaterialTheme.colorScheme.background) {
                        Column(verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
                            val cover = bookCovers[book.uid]
                            if (cover != null) Image(painterResource(cover), null,
                                Modifier.fillMaxWidth().height(if (reflow) 200.dp else bookWidth * 1.3f),
                                contentScale = ContentScale.Fit)
                            else Surface(Modifier.fillMaxWidth().heightIn(min = 160.dp), shape = MaterialTheme.shapes.small) {
                                Box(Modifier.padding(Spacing.md), contentAlignment = Alignment.Center) {
                                    Text(title, style = MaterialTheme.typography.titleMedium,
                                        modifier = Modifier.clearAndSetSemantics { })
                                }
                            }
                            Text(title, Modifier.padding(horizontal = Spacing.xs, vertical = Spacing.xs),
                                style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.onSurface)
                        }
                    }
                }
            }
        }
    }
}

@Composable
internal fun HomeAuthors(authors: List<Author>, counts: Map<String, Int>, language: String, onClick: (String) -> Unit) {
    HomeModule("Authors") {
        Column(Modifier.fillMaxWidth().testTag("shelf-Authors")
            .semantics { collectionInfo = CollectionInfo(authors.size, 1) }) {
            authors.forEach { author ->
                NavigationSurface({ onClick(author.uid) }, Modifier.fillMaxWidth().testTag("author-${author.uid}"),
                    shape = MaterialTheme.shapes.small, color = MaterialTheme.colorScheme.background) {
                    Row(Modifier.padding(horizontal = Spacing.xs, vertical = Spacing.sm),
                        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(Spacing.sm)) {
                        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(Spacing.xxs)) {
                            Text(author.names.preferredText(language), style = MaterialTheme.typography.titleSmall)
                            counts[author.uid]?.let { Text("$it ${if (it == 1) "song" else "songs"}",
                                style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant) }
                        }
                        Icon(Icons.AutoMirrored.Filled.ArrowForward, null, Modifier.size(16.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun HomeTopics(topics: List<SongGroup>, language: String, onClick: (String) -> Unit) {
    HomeModule("Topics") {
        FlowRow(Modifier.fillMaxWidth().padding(Spacing.xs).testTag("shelf-Topics"),
            horizontalArrangement = Arrangement.spacedBy(Spacing.sm), verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
            topics.forEach { topic ->
                NavigationSurface({ onClick(topic.uid) }, Modifier.testTag("topic-${topic.uid}"),
                    shape = MaterialTheme.shapes.small, color = MaterialTheme.colorScheme.background,
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)) {
                    Text("${topic.titles.preferredText(language)} · ${topic.songCount}",
                        Modifier.padding(horizontal = Spacing.md, vertical = Spacing.md),
                        style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}
