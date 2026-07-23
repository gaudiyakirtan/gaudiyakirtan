package com.gaudiyakirtan.myapplication.ui.components

import com.gaudiyakirtan.myapplication.ui.theme.neutral

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.models.ManifestEntry
import com.gaudiyakirtan.myapplication.models.title
import com.gaudiyakirtan.myapplication.models.titleForListLanguage
import com.gaudiyakirtan.myapplication.utils.StringUtils

/**
 * Manifest-driven song list with a sticky-style alphabetical section index and an A–Z scrubber
 * (docs/screens/songs-list.md). Shared by the Library Songs tab and the author-filtered variant.
 *
 * Ordering rules from the spec:
 *  - **Sort/group key is the stable Latin `primary_title`** ([ManifestEntry.title]) so the index
 *    never reshuffles when `listLanguage` changes; only the *displayed* row title follows
 *    [listLanguage] (via [ManifestEntry.titleForListLanguage]).
 *  - **Sections are keyed to the manifest's [ManifestEntry.firstLetter]** (its canonical index key).
 *    35 Hindi songs carry a Devanagari `first_letter`; they sort after Latin and form their own
 *    trailing sections. The Latin A–Z scrubber maps those to "#", which jumps to that trailing block.
 */
@Composable
fun SongsListWithIndex(
    songs: List<ManifestEntry>,
    authorNames: Map<String, String>,
    listLanguage: String,
    onSongClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    // Sort by the stable Latin primary-title key (aligned with first_letter, punctuation-skipping);
    // group (preserving that order) by the manifest's first_letter so sections stay contiguous.
    val grouped: Map<String, List<ManifestEntry>> = remember(songs) {
        songs
            .sortedBy { StringUtils.sortKey(it.title) }
            .groupBy { it.firstLetter?.takeIf { c -> c.isNotEmpty() } ?: StringUtils.sectionLetter(it.title) }
    }

    val lazyListState = rememberLazyListState()

    // Scrubber map: item index of each section, folding non-Latin sections under "#".
    val sectionMap: Map<String, Int> = remember(grouped) {
        val result = linkedMapOf<String, Int>()
        var index = 0
        grouped.forEach { (letter, entries) ->
            val scrubberKey = if (letter.length == 1 && letter[0] in 'A'..'Z') letter else "#"
            result.putIfAbsent(scrubberKey, index)
            index += entries.size + 1 // +1 for the section header row
        }
        result
    }

    Box(modifier = modifier) {
        LazyColumn(
            state = lazyListState,
            contentPadding = PaddingValues(start = 16.dp, end = 32.dp, bottom = 16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            grouped.forEach { (letter, entries) ->
                item(key = "header-$letter") {
                    Text(
                        text = letter,
                        style = MaterialTheme.typography.titleLarge,
                        color = MaterialTheme.colorScheme.neutral,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                }
                items(entries, key = { it.uid }) { song ->
                    SongListItem(
                        uid = song.uid,
                        title = song.titleForListLanguage(listLanguage),
                        authorName = authorNames[song.authorUid] ?: "",
                        audioAvailable = song.audioAvailable,
                        onClick = { onSongClick(song.uid) }
                    )
                }
            }
        }

        AlphabeticalScrollBar(
            lazyListState = lazyListState,
            sectionMap = sectionMap,
            modifier = Modifier.align(Alignment.CenterEnd)
        )
    }
}
