package com.gaudiyakirtan.myapplication.ui.search

import com.gaudiyakirtan.myapplication.ui.haptics.AppHapticEvent
import com.gaudiyakirtan.myapplication.ui.haptics.SearchPhase
import com.gaudiyakirtan.myapplication.ui.haptics.rememberAppHaptics
import com.gaudiyakirtan.myapplication.ui.haptics.searchPhase
import com.gaudiyakirtan.myapplication.ui.haptics.searchWarns
import com.gaudiyakirtan.myapplication.ui.theme.Spacing
import com.gaudiyakirtan.myapplication.ui.theme.neutral

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.vectorResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.gaudiyakirtan.myapplication.R
import com.gaudiyakirtan.myapplication.models.titleForListLanguage
import com.gaudiyakirtan.myapplication.ui.components.SongListItem

/**
 * Search screen (docs/screens/search.md, `Search` / `Search-1` frames): an autofocus search field
 * over a score-ordered results list that reuses the song-list row. Offline, diacritic-insensitive
 * fuzzy matching happens in [SearchViewModel]'s [com.gaudiyakirtan.data.SongSearchEngine]. Idle
 * (empty query) shows nothing; a query with no hits shows an explicit no-matches message.
 */
@Composable
fun SearchScreen(
    onSongClick: (String) -> Unit = {},
    viewModel: SearchViewModel = viewModel()
) {
    val query by viewModel.query.collectAsState()
    val results by viewModel.results.collectAsState()
    val authorNames by viewModel.authorNames.collectAsState()
    val listLanguage by viewModel.listLanguage.collectAsState()

    // Marks the moment a query stops matching anything. Search is incremental, so this fires on the
    // transition into "no matches" rather than on every keystroke that stays there.
    val appHaptics = rememberAppHaptics()
    var lastSearchPhase by remember { mutableStateOf(SearchPhase.IDLE) }
    val phase = searchPhase(query.isBlank(), results.size)
    LaunchedEffect(phase) {
        if (searchWarns(lastSearchPhase, phase)) {
            appHaptics.play(AppHapticEvent.WARNING)
        }
        lastSearchPhase = phase
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        SearchInputField(
            query = query,
            onQueryChange = viewModel::updateQuery,
            onClear = viewModel::clearQuery,
            modifier = Modifier.padding(Spacing.lg)
        )

        when {
            query.isBlank() -> {
                // Idle state -- nothing until the reader types (per Search-1 frame).
            }

            results.isEmpty() -> Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.TopCenter
            ) {
                Text(
                    text = "No matches for \"$query\"",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.neutral,
                    modifier = Modifier.padding(top = Spacing.xxxl, start = Spacing.xl, end = Spacing.xl)
                )
            }

            else -> LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = Spacing.lg, vertical = Spacing.xs),
                verticalArrangement = Arrangement.spacedBy(Spacing.sm)
            ) {
                // Ranked results (best-first) -- NOT alphabetized; reuse the song-list row.
                items(results, key = { it.uid }) { entry ->
                    SongListItem(
                        uid = entry.uid,
                        title = entry.titleForListLanguage(listLanguage),
                        authorName = authorNames[entry.authorUid] ?: "",
                        audioAvailable = entry.audioAvailable,
                        onClick = { onSongClick(entry.uid) }
                    )
                }
            }
        }
    }
}

@Composable
private fun SearchInputField(
    query: String,
    onQueryChange: (String) -> Unit,
    onClear: () -> Unit,
    modifier: Modifier = Modifier
) {
    val focusRequester = remember { FocusRequester() }
    // Autofocus on the Search tab (docs/screens/search.md).
    LaunchedEffect(Unit) { focusRequester.requestFocus() }

    Surface(
        modifier = modifier
            .fillMaxWidth()
            .height(44.dp),
        shape = MaterialTheme.shapes.large,
        color = MaterialTheme.colorScheme.surface
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = Spacing.md),
            verticalAlignment = Alignment.CenterVertically
        ) {
            BasicTextField(
                value = query,
                onValueChange = onQueryChange,
                modifier = Modifier
                    .weight(1f)
                    .focusRequester(focusRequester),
                singleLine = true,
                keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(imeAction = ImeAction.Search),
                textStyle = MaterialTheme.typography.bodyMedium.copy(
                    color = MaterialTheme.colorScheme.onSurface
                ),
                cursorBrush = androidx.compose.ui.graphics.SolidColor(MaterialTheme.colorScheme.primary),
                decorationBox = { innerTextField ->
                    if (query.isEmpty()) {
                        Text(
                            text = "Search songs and authors",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.neutral
                        )
                    }
                    innerTextField()
                }
            )

            if (query.isNotEmpty()) {
                Icon(
                    imageVector = Icons.Default.Clear,
                    contentDescription = "Clear search",
                    tint = MaterialTheme.colorScheme.neutral,
                    modifier = Modifier
                        .size(20.dp)
                        .clip(MaterialTheme.shapes.small)
                        .clickable { onClear() }
                )
                Spacer(modifier = Modifier.width(Spacing.sm))
            }

            Icon(
                imageVector = ImageVector.vectorResource(id = R.drawable.ic_search),
                contentDescription = "Search",
                tint = MaterialTheme.colorScheme.neutral,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}
