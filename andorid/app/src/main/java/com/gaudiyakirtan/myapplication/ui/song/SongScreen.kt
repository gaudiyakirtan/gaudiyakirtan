package com.gaudiyakirtan.myapplication.ui.song

import com.gaudiyakirtan.myapplication.ui.theme.neutral

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gaudiyakirtan.myapplication.models.Song
import com.gaudiyakirtan.myapplication.models.Verse
import com.gaudiyakirtan.myapplication.models.author
import com.gaudiyakirtan.myapplication.models.linesForScript
import com.gaudiyakirtan.myapplication.models.title
import com.gaudiyakirtan.myapplication.models.translationFor
import com.gaudiyakirtan.myapplication.models.wordToWordFor
import com.gaudiyakirtan.myapplication.ui.components.Tag
import com.gaudiyakirtan.myapplication.ui.components.icons.MusicNote

/**
 * Song Detail screen (docs/screens/song-detail.md), `Song Component (app)` mobile layout: a
 * single-column, scrollable reader with a top toolbar (back · player pill iff audio · display
 * settings), a centered title/author header, and a vertical list of verse blocks. Each verse stacks
 * the reader's chosen native script, the IAST romanization, an optional word-to-word glossary, and
 * an optional full translation -- all driven by [SongViewModel] state, so a script switch or a
 * toggle re-renders every verse. Loads the full song offline from bundled assets by uid.
 */
@Composable
fun SongScreen(
    viewModel: SongViewModel,
    onBackClick: () -> Unit,
    onPlayClick: () -> Unit = {},
    onAuthorClick: (String) -> Unit = {}
) {
    val song by viewModel.song.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val settings by viewModel.settings.collectAsState()
    val isCollapsed by viewModel.isCollapsed.collectAsState()
    val expandedVerses by viewModel.expandedVerses.collectAsState()

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            val current = song
            SongToolbar(
                song = current,
                settings = settings,
                availableScripts = viewModel.availableScripts,
                availableGlossLanguages = viewModel.availableGlossLanguages,
                hasTranslations = viewModel.hasTranslations,
                isCollapsed = isCollapsed,
                onBackClick = onBackClick,
                onPlayClick = onPlayClick,
                onScriptSelected = viewModel::setPrimaryScript,
                onGlossLanguageSelected = viewModel::setGlossLanguage,
                onToggleWordToWord = viewModel::toggleWordToWord,
                onToggleTranslation = viewModel::toggleTranslation,
                onToggleCollapsed = viewModel::toggleCollapsed
            )

            when {
                current != null -> SongBody(
                    song = current,
                    settings = settings,
                    isCollapsed = isCollapsed,
                    expandedVerses = expandedVerses,
                    onVerseToggle = viewModel::toggleVerseExpanded,
                    onAuthorClick = { onAuthorClick(current.authorUid) }
                )

                isLoading -> LoadingSkeleton()

                else -> Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Song not found",
                        style = MaterialTheme.typography.headlineSmall,
                        color = MaterialTheme.colorScheme.neutral
                    )
                }
            }
        }
    }
}

@Composable
private fun SongToolbar(
    song: Song?,
    settings: VerseDisplaySettings,
    availableScripts: List<NamedOption>,
    availableGlossLanguages: List<NamedOption>,
    hasTranslations: Boolean,
    isCollapsed: Boolean,
    onBackClick: () -> Unit,
    onPlayClick: () -> Unit,
    onScriptSelected: (String) -> Unit,
    onGlossLanguageSelected: (String) -> Unit,
    onToggleWordToWord: () -> Unit,
    onToggleTranslation: () -> Unit,
    onToggleCollapsed: () -> Unit
) {
    var menuOpen by remember { mutableStateOf(false) }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.background)
            .padding(horizontal = 8.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        IconButton(onClick = onBackClick) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                contentDescription = "Back",
                tint = MaterialTheme.colorScheme.primary
            )
        }

        // Player pill -- shown only when the song has audio (docs/screens/song-detail.md).
        if (song != null && song.audioAvailable) {
            PlayerPill(
                title = song.title,
                author = song.author,
                onClick = onPlayClick,
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = 4.dp)
            )
        } else {
            Spacer(modifier = Modifier.weight(1f))
        }

        // Display settings ("Aa") -- quick-toggles script / word-to-word / translation / collapse.
        Box {
            TextButton(
                onClick = { menuOpen = true },
                enabled = song != null
            ) {
                Text(
                    text = "Aa",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            DisplaySettingsMenu(
                expanded = menuOpen,
                onDismiss = { menuOpen = false },
                settings = settings,
                availableScripts = availableScripts,
                availableGlossLanguages = availableGlossLanguages,
                hasTranslations = hasTranslations,
                isCollapsed = isCollapsed,
                onScriptSelected = onScriptSelected,
                onGlossLanguageSelected = onGlossLanguageSelected,
                onToggleWordToWord = onToggleWordToWord,
                onToggleTranslation = onToggleTranslation,
                onToggleCollapsed = onToggleCollapsed
            )
        }
    }
}

@Composable
private fun PlayerPill(
    title: String,
    author: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier.height(44.dp),
        shape = MaterialTheme.shapes.large,
        color = MaterialTheme.colorScheme.surface,
        onClick = onClick
    ) {
        Row(
            modifier = Modifier.padding(start = 6.dp, end = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.neutral.copy(alpha = 0.2f)),
                contentAlignment = Alignment.Center
            ) {
                MusicNote(
                    modifier = Modifier.size(16.dp),
                    color = MaterialTheme.colorScheme.neutral
                )
            }
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = author,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.neutral,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
            Icon(
                imageVector = Icons.Default.PlayArrow,
                contentDescription = "Play",
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(24.dp)
            )
        }
    }
}

@Composable
private fun DisplaySettingsMenu(
    expanded: Boolean,
    onDismiss: () -> Unit,
    settings: VerseDisplaySettings,
    availableScripts: List<NamedOption>,
    availableGlossLanguages: List<NamedOption>,
    hasTranslations: Boolean,
    isCollapsed: Boolean,
    onScriptSelected: (String) -> Unit,
    onGlossLanguageSelected: (String) -> Unit,
    onToggleWordToWord: () -> Unit,
    onToggleTranslation: () -> Unit,
    onToggleCollapsed: () -> Unit
) {
    DropdownMenu(expanded = expanded, onDismissRequest = onDismiss) {
        MenuSectionLabel("Script")
        availableScripts.forEach { option ->
            DropdownMenuItem(
                text = { Text(option.label) },
                onClick = { onScriptSelected(option.code) },
                leadingIcon = {
                    RadioButton(
                        selected = option.code == settings.primaryScriptCode,
                        onClick = { onScriptSelected(option.code) }
                    )
                }
            )
        }

        if (availableGlossLanguages.isNotEmpty()) {
            HorizontalDivider()
            DropdownMenuItem(
                text = { Text("Word for word") },
                onClick = onToggleWordToWord,
                trailingIcon = {
                    Switch(
                        checked = settings.showWordToWord,
                        onCheckedChange = { onToggleWordToWord() }
                    )
                }
            )
            // Gloss-language sub-choice, only meaningful when word-to-word is on and there's a choice.
            if (settings.showWordToWord && availableGlossLanguages.size > 1) {
                availableGlossLanguages.forEach { option ->
                    DropdownMenuItem(
                        text = {
                            Text(
                                option.label,
                                style = MaterialTheme.typography.bodyMedium,
                                modifier = Modifier.padding(start = 16.dp)
                            )
                        },
                        onClick = { onGlossLanguageSelected(option.code) },
                        leadingIcon = {
                            RadioButton(
                                selected = option.code == settings.glossLanguageCode,
                                onClick = { onGlossLanguageSelected(option.code) }
                            )
                        }
                    )
                }
            }
        }

        if (hasTranslations) {
            HorizontalDivider()
            DropdownMenuItem(
                text = { Text("Translation") },
                onClick = onToggleTranslation,
                trailingIcon = {
                    Switch(
                        checked = settings.showTranslation,
                        onCheckedChange = { onToggleTranslation() }
                    )
                }
            )
        }

        HorizontalDivider()
        DropdownMenuItem(
            text = { Text("Collapse verses") },
            onClick = onToggleCollapsed,
            trailingIcon = {
                Switch(
                    checked = isCollapsed,
                    onCheckedChange = { onToggleCollapsed() }
                )
            }
        )
    }
}

@Composable
private fun MenuSectionLabel(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.labelMedium,
        color = MaterialTheme.colorScheme.neutral,
        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
    )
}

@Composable
private fun SongBody(
    song: Song,
    settings: VerseDisplaySettings,
    isCollapsed: Boolean,
    expandedVerses: Set<Int>,
    onVerseToggle: (Int) -> Unit,
    onAuthorClick: () -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Header: title + author, centered.
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = song.title,
                    style = MaterialTheme.typography.headlineMedium,
                    color = MaterialTheme.colorScheme.primary,
                    textAlign = TextAlign.Center
                )
                Text(
                    text = song.author,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onBackground,
                    textAlign = TextAlign.Center,
                    // Tap author -> author-filtered song list (docs/screens/song-detail.md interaction).
                    modifier = Modifier.clickable(onClick = onAuthorClick)
                )
                if (song.tags.isNotEmpty()) {
                    Row(
                        modifier = Modifier.padding(top = 4.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        song.tags.take(4).forEach { tag -> Tag(text = tag) }
                    }
                }
            }
        }

        itemsIndexed(song.verses) { index, verse ->
            VerseBlock(
                verse = verse,
                settings = settings,
                collapsed = isCollapsed && index !in expandedVerses,
                onClick = if (isCollapsed) {
                    { onVerseToggle(index) }
                } else null
            )
        }

        item { Spacer(modifier = Modifier.height(48.dp)) }
    }
}

@Composable
private fun VerseBlock(
    verse: Verse,
    settings: VerseDisplaySettings,
    collapsed: Boolean,
    onClick: (() -> Unit)?
) {
    // When the chosen script IS Latin, the "native" line is already roman -- render just the one
    // roman line (in the chosen standard) instead of showing the same romanization twice.
    val primaryIsLatin = settings.primaryScriptCode == "Latn"
    val nativeLines = verse.linesForScript(
        settings.primaryScriptCode,
        if (primaryIsLatin) settings.romanizationStandard else null
    )
    val romanLines = verse.linesForScript("Latn", settings.romanizationStandard)

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // 1. Native (chosen) script -- collapsed shows only the first line as a preview.
        //    Latin-chosen uses the accent color (it doubles as the romanization); others use neutral.
        val nativeToShow = if (collapsed) nativeLines.take(1) else nativeLines
        VerseLines(
            lines = nativeToShow,
            color = if (primaryIsLatin) MaterialTheme.colorScheme.primary
            else MaterialTheme.colorScheme.neutral
        )

        if (!collapsed) {
            // 2. IAST romanization (pronunciation guide) -- shown only when the chosen script is a
            //    non-Latin native script, so Latin readers don't see the romanization twice.
            if (!primaryIsLatin) {
                VerseLines(
                    lines = romanLines,
                    color = MaterialTheme.colorScheme.primary
                )
            }

            // 3. Word-to-word glossary (toggle + language matched; omitted when absent).
            if (settings.showWordToWord) {
                verse.wordToWordFor(settings.glossLanguageCode)?.let { w2w ->
                    Text(
                        text = buildWordToWordText(
                            words = w2w.words,
                            headwordColor = MaterialTheme.colorScheme.primary
                        ),
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onBackground,
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = TextAlign.Start
                    )
                }
            }

            // 4. Full translation (toggle + language matched; omitted when absent).
            if (settings.showTranslation) {
                verse.translationFor(settings.translationLanguageCode)?.let { translation ->
                    Column(modifier = Modifier.fillMaxWidth()) {
                        translation.text.forEach { line ->
                            Text(
                                text = line,
                                fontSize = 14.sp,
                                color = MaterialTheme.colorScheme.onBackground,
                                textAlign = TextAlign.Start,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun VerseLines(lines: List<String>, color: androidx.compose.ui.graphics.Color) {
    if (lines.isEmpty()) return
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        lines.forEach { line ->
            Text(
                text = line,
                fontSize = 15.sp,
                color = color,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

/**
 * Flowing "headword — gloss;" text, with the (transliterated) headword emphasized in the accent
 * color, matching the `Song Component (app)` frames. Note: the canonical data does not encode which
 * source line each word pair belongs to, so the per-line superscript markers seen in Figma are not
 * reproduced here (see slice-2a report).
 */
@Composable
private fun buildWordToWordText(
    words: List<List<String>>,
    headwordColor: androidx.compose.ui.graphics.Color
) = buildAnnotatedString {
    words.forEach { pair ->
        withStyle(style = SpanStyle(color = headwordColor, fontWeight = FontWeight.Medium)) {
            append(pair.getOrNull(0) ?: "")
        }
        append(" — ${pair.getOrNull(1) ?: ""}; ")
    }
}

@Composable
private fun LoadingSkeleton() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Spacer(modifier = Modifier.height(8.dp))
        SkeletonBar(widthFraction = 0.6f, height = 28.dp)
        SkeletonBar(widthFraction = 0.4f, height = 20.dp)
        Spacer(modifier = Modifier.height(16.dp))
        repeat(3) {
            SkeletonBar(widthFraction = 0.7f, height = 16.dp)
            SkeletonBar(widthFraction = 0.7f, height = 16.dp)
            SkeletonBar(widthFraction = 0.9f, height = 14.dp)
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
private fun SkeletonBar(widthFraction: Float, height: androidx.compose.ui.unit.Dp) {
    Box(
        modifier = Modifier
            .fillMaxWidth(widthFraction)
            .height(height)
            .clip(MaterialTheme.shapes.extraSmall)
            .background(MaterialTheme.colorScheme.neutral.copy(alpha = 0.15f))
    )
}
