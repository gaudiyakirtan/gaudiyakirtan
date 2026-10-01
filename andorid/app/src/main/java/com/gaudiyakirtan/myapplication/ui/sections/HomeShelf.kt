package com.gaudiyakirtan.myapplication.ui.sections

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.CollectionInfo
import androidx.compose.ui.semantics.collectionInfo
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import com.gaudiyakirtan.myapplication.ui.theme.Spacing

/** Normal native scrolling; no shelf arrows, smooth-scroll commands or layout animations. */
@Composable
fun <T> HomeShelf(
    title: String,
    entries: List<T>,
    key: (T) -> String,
    cardWidth: Dp,
    vertical: Boolean,
    card: @Composable (T, Modifier) -> Unit
) {
    if (entries.isEmpty()) return
    Column(verticalArrangement = Arrangement.spacedBy(Spacing.lg)) {
        SectionHeading(title)
        if (vertical) {
            Column(Modifier.fillMaxWidth().testTag("shelf-$title").padding(Spacing.xs)
                .semantics { collectionInfo = CollectionInfo(entries.size, 1) },
                verticalArrangement = Arrangement.spacedBy(Spacing.md)) {
                entries.forEach { entry -> card(entry, Modifier.fillMaxWidth()) }
            }
        } else {
            LazyRow(Modifier.fillMaxWidth().testTag("shelf-$title"),
                contentPadding = PaddingValues(Spacing.xs),
                horizontalArrangement = Arrangement.spacedBy(Spacing.md)) {
                items(entries, key = key) { entry -> card(entry, Modifier.width(cardWidth)) }
            }
        }
    }
}
