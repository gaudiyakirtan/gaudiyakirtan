package com.gaudiyakirtan.myapplication.ui.home

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.font.FontSynthesis
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.R
import com.gaudiyakirtan.myapplication.models.*
import com.gaudiyakirtan.myapplication.ui.components.NavigationSurface
import com.gaudiyakirtan.myapplication.ui.sections.SectionHeading
import com.gaudiyakirtan.myapplication.ui.theme.DisplayFontFamily
import com.gaudiyakirtan.myapplication.ui.theme.HomeAuthorSwatches
import com.gaudiyakirtan.myapplication.ui.theme.HomeFocusText
import com.gaudiyakirtan.myapplication.ui.theme.HomeTopicInks
import com.gaudiyakirtan.myapplication.ui.theme.HomeTopicSurfaces

// The exact seven covers also shipped by Web, bundled here so the gallery is available offline.
private val bookCovers = mapOf(
    "book-srinamastaka" to R.drawable.book_srinamastaka,
    "book-srisiksastaka" to R.drawable.book_srisiksastaka,
    "book-sriupadesamrta" to R.drawable.book_sriupadesamrta,
    "book-srimanahsiksa" to R.drawable.book_srimanahsiksa,
    "book-kalyanakalpataru" to R.drawable.book_kalyanakalpataru,
    "book-saranagati" to R.drawable.book_saranagati,
    "book-gitavali" to R.drawable.book_gitavali
)

/** Horizontal pages keep the entire existing catalog. Large type reflows every entry vertically. */
@Composable
private fun <T> BrowsePages(
    title: String, entries: List<T>, pageSize: Int, reflow: Boolean,
    page: @Composable (List<T>, Modifier) -> Unit
) {
    if (reflow) Column(Modifier.fillMaxWidth().testTag("shelf-$title")
        .semantics { collectionInfo = CollectionInfo(entries.size, 1) },
        verticalArrangement = Arrangement.spacedBy(12.dp)) {
        entries.forEach { page(listOf(it), Modifier.fillMaxWidth()) }
    } else BoxWithConstraints(Modifier.fillMaxWidth()) {
        val pageWidth = maxWidth - 32.dp
        LazyRow(Modifier.testTag("shelf-$title"), horizontalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(4.dp)) {
            itemsIndexed(entries.chunked(pageSize)) { _, chunk -> page(chunk, Modifier.width(pageWidth)) }
        }
    }
}

@Composable
internal fun HomeBooks(books: List<SongGroup>, listLanguage: String, reflow: Boolean, onClick: (String) -> Unit) {
    HomeModule("Books") {
        HomeCard(Modifier.testTag("books-card")) {
            Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(20.dp)) {
                Text("A library made for singing", style = MaterialTheme.typography.headlineMedium.copy(
                    fontFamily = DisplayFontFamily, fontWeight = FontWeight.Normal, fontSynthesis = FontSynthesis.None),
                    color = MaterialTheme.colorScheme.onSurface, modifier = Modifier.semantics { heading() })
                Text("Open a songbook and move through its original sequence.", style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
                BrowsePages("Books", books, 3, reflow) { page, modifier ->
                    if (reflow) BookCover(page.first(), listLanguage, modifier, onClick, showTitle = true)
                    else Row(modifier, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        BookCover(page.first(), listLanguage, Modifier.weight(1.35f).height(300.dp), onClick)
                        if (page.size > 1) Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            page.drop(1).forEach { BookCover(it, listLanguage, Modifier.fillMaxWidth().height(145.dp), onClick) }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun BookCover(book: SongGroup, language: String, modifier: Modifier, onClick: (String) -> Unit, showTitle: Boolean = false) {
    val title = book.titles.preferredText(language)
    val cover = bookCovers[book.uid]
    NavigationSurface({ onClick(book.uid) }, modifier.testTag("book-${book.uid}").semantics { contentDescription = title },
        shape = RoundedCornerShape(16.dp)) {
        Column(Modifier.background(MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f))) {
            if (cover != null) Image(painterResource(cover), null,
                modifier = if (showTitle) Modifier.fillMaxWidth().height(240.dp) else Modifier.fillMaxSize(),
                contentScale = if (showTitle) ContentScale.Fit else ContentScale.Crop)
            if (showTitle || cover == null) Text(title, Modifier.padding(16.dp),
                style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurface)
        }
    }
}

@Composable
internal fun HomeAuthors(
    authors: List<Author>, counts: Map<String, Int>, language: String, reflow: Boolean, onClick: (String) -> Unit
) {
    HomeModule("Authors") {
        HomeCard(Modifier.testTag("authors-card")) {
            Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                SectionHeading("Voices in the library")
                BrowsePages("Authors", authors, 4, reflow) { page, modifier ->
                    Column(modifier, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        page.forEachIndexed { index, author ->
                            val name = author.names.preferredText(language)
                            NavigationSurface({ onClick(author.uid) }, Modifier.fillMaxWidth().testTag("author-${author.uid}")) {
                                Row(Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                    Box(Modifier.size(42.dp).clip(RoundedCornerShape(13.dp)).background(HomeAuthorSwatches[index % 4])
                                        .clearAndSetSemantics { }, contentAlignment = Alignment.Center) {
                                        Text(name.firstOrNull()?.uppercase().orEmpty(), style = MaterialTheme.typography.titleLarge,
                                            color = HomeFocusText)
                                    }
                                    Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                                        Text(name, style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.onSurface)
                                        counts[author.uid]?.let { Text("$it songs", style = MaterialTheme.typography.labelMedium,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant) }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
internal fun HomeTopics(topics: List<SongGroup>, language: String, reflow: Boolean, expanded: Boolean, onClick: (String) -> Unit) {
    val columns = if (reflow) 1 else if (expanded) 6 else 2
    HomeModule("Explore") {
        BrowsePages("Topics", topics, columns * 2, reflow) { page, modifier ->
            Column(modifier, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                page.chunked(columns).forEach { row ->
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        row.forEach { topic ->
                            val index = topics.indexOf(topic) % 3
                            val background = HomeTopicSurfaces[index]
                            val ink = HomeTopicInks[index]
                            NavigationSurface({ onClick(topic.uid) }, Modifier.weight(1f).testTag("topic-${topic.uid}"),
                                shape = RoundedCornerShape(22.dp)) {
                                Column(Modifier.background(background).heightIn(min = 100.dp).padding(16.dp),
                                    verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                    Text(topic.titles.preferredText(language), style = MaterialTheme.typography.labelLarge, color = ink)
                                    Text("${topic.songCount} songs", style = MaterialTheme.typography.labelMedium, color = ink)
                                }
                            }
                        }
                        repeat(columns - row.size) { Spacer(Modifier.weight(1f)) }
                    }
                }
            }
        }
    }
}
