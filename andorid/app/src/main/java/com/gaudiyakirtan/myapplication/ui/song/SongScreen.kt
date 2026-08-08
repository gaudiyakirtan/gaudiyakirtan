package com.gaudiyakirtan.myapplication.ui.song

import com.gaudiyakirtan.myapplication.ui.theme.neutral
import com.gaudiyakirtan.myapplication.ui.theme.accentRadioButtonColors
import com.gaudiyakirtan.myapplication.ui.theme.accentSwitchColors

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Pause
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
import com.gaudiyakirtan.myapplication.models.ScriptOptions
import com.gaudiyakirtan.myapplication.models.Song
import com.gaudiyakirtan.myapplication.models.Verse
import com.gaudiyakirtan.myapplication.models.author
import com.gaudiyakirtan.myapplication.models.scriptLinesOrNull
import com.gaudiyakirtan.myapplication.models.title
import com.gaudiyakirtan.myapplication.models.translationFor
import com.gaudiyakirtan.myapplication.models.wordToWordFor
import com.gaudiyakirtan.myapplication.ui.components.Tag
import com.gaudiyakirtan.myapplication.ui.components.icons.MusicNote
import com.gaudiyakirtan.services.PlaybackState
import com.gaudiyakirtan.services.PlayerUiState

/**
 * Song Detail screen (docs/screens/song-detail.md), `Song Component (app)` mobile layout: a
 * single-column, scrollable reader with a top toolbar (back · player pill iff audio · display
 * settings), a centered title/author header, and a vertical list of verse blocks. Each verse stacks
 * the reader's chosen source script, their chosen transliteration, an optional word-to-word glossary, and
 * an optional full translation -- all driven by [SongViewModel] state, so a script switch or a
 * toggle re-renders every verse. Loads the full song offline from bundled assets by uid.
 */
@Composable
fun SongScreen(
    viewModel: SongViewModel,
    onBackClick: () -> Unit,
    onPlayClick: () -> Unit = {},
    onAuthorClick: (String) -> Unit = {},
    /** Live playback state for the toolbar pill (docs/screens/player.md v14 "The reader gets a pill,
     * not a bar"). Passed in rather than read from a ViewModel here, matching how [onPlayClick]
     * already keeps this screen ignorant of the player. */
    playerUiState: PlayerUiState = PlayerUiState(),
    /** Pill body tap while something is loaded: raise Now Playing. */
    onPillClick: () -> Unit = {},
    /** Pill control tap while something is loaded: toggle playback without opening anything. */
    onPillPlayPause: () -> Unit = {}
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
                availableDisplayScripts = viewModel.availableDisplayScripts,
                availableTransliterationScripts = viewModel.availableTransliterationScripts,
                availableGlossLanguages = viewModel.availableGlossLanguages,
                hasTranslations = viewModel.hasTranslations,
                isCollapsed = isCollapsed,
                onBackClick = onBackClick,
                onPlayClick = onPlayClick,
                playerUiState = playerUiState,
                onPillClick = onPillClick,
                onPillPlayPause = onPillPlayPause,
                onDisplayScriptSelected = viewModel::setDisplayScript,
                onTransliterationScriptSelected = viewModel::setTransliterationScript,
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
    availableDisplayScripts: List<NamedOption>,
    availableTransliterationScripts: List<NamedOption>,
    availableGlossLanguages: List<NamedOption>,
    hasTranslations: Boolean,
    isCollapsed: Boolean,
    onBackClick: () -> Unit,
    onPlayClick: () -> Unit,
    playerUiState: PlayerUiState,
    onPillClick: () -> Unit,
    onPillPlayPause: () -> Unit,
    onDisplayScriptSelected: (String) -> Unit,
    onTransliterationScriptSelected: (String) -> Unit,
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
                tint = MaterialTheme.colorScheme.surfaceVariant
            )
        }

        // Now-playing pill (docs/screens/player.md v14 "The reader gets a pill, not a bar"). It is
        // bound to the *player*, not to this page: whatever is loaded shows here, even another song.
        // With nothing loaded it doubles as this song's play affordance, so the toolbar never grows
        // a second button; with nothing loaded and no audio on this song it is absent entirely and
        // the toolbar keeps its plain back / "Aa" layout.
        val nowPlaying = playerUiState.nowPlaying
        when {
            nowPlaying != null -> PlayerPill(
                title = nowPlaying.song.title,
                // The credit is the take's reciter, not the composer (docs/screens/tracks.md).
                subtitle = nowPlaying.track.artist ?: nowPlaying.song.author,
                playing = playerUiState.playbackState == PlaybackState.PLAYING,
                loading = playerUiState.playbackState == PlaybackState.LOADING,
                onBodyClick = onPillClick,
                onControlClick = onPillPlayPause,
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = 4.dp)
            )

            song != null && song.audioAvailable -> PlayerPill(
                title = song.title,
                subtitle = song.author,
                playing = false,
                loading = false,
                onBodyClick = onPlayClick,
                onControlClick = onPlayClick,
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = 4.dp)
            )

            else -> Spacer(modifier = Modifier.weight(1f))
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
                    color = MaterialTheme.colorScheme.surfaceVariant
                )
            }
            DisplaySettingsMenu(
                expanded = menuOpen,
                onDismiss = { menuOpen = false },
                settings = settings,
                availableDisplayScripts = availableDisplayScripts,
                availableTransliterationScripts = availableTransliterationScripts,
                availableGlossLanguages = availableGlossLanguages,
                hasTranslations = hasTranslations,
                isCollapsed = isCollapsed,
                onDisplayScriptSelected = onDisplayScriptSelected,
                onTransliterationScriptSelected = onTransliterationScriptSelected,
                onGlossLanguageSelected = onGlossLanguageSelected,
                onToggleWordToWord = onToggleWordToWord,
                onToggleTranslation = onToggleTranslation,
                onToggleCollapsed = onToggleCollapsed
            )
        }
    }
}

/**
 * The toolbar's now-playing pill (docs/screens/player.md v14). **Two distinct hit targets:** the
 * capsule body ([onBodyClick]) opens Now Playing, while the trailing control ([onControlClick])
 * lives in its own [IconButton] so toggling playback does not also raise the sheet.
 */
@Composable
private fun PlayerPill(
    title: String,
    subtitle: String,
    playing: Boolean,
    loading: Boolean,
    onBodyClick: () -> Unit,
    onControlClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier.height(44.dp),
        shape = RoundedCornerShape(22.dp),
        color = MaterialTheme.colorScheme.surface,
        onClick = onBodyClick
    ) {
        Row(
            modifier = Modifier.padding(start = 6.dp, end = 2.dp),
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
                    text = subtitle,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.neutral,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
            if (loading) {
                CircularProgressIndicator(
                    modifier = Modifier
                        .padding(end = 10.dp)
                        .size(20.dp),
                    strokeWidth = 2.dp,
                    color = MaterialTheme.colorScheme.surfaceVariant
                )
            } else {
                IconButton(onClick = onControlClick, modifier = Modifier.size(40.dp)) {
                    Icon(
                        imageVector = if (playing) Icons.Default.Pause else Icons.Default.PlayArrow,
                        contentDescription = if (playing) "Pause" else "Play",
                        tint = MaterialTheme.colorScheme.surfaceVariant,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun DisplaySettingsMenu(
    expanded: Boolean,
    onDismiss: () -> Unit,
    settings: VerseDisplaySettings,
    availableDisplayScripts: List<NamedOption>,
    availableTransliterationScripts: List<NamedOption>,
    availableGlossLanguages: List<NamedOption>,
    hasTranslations: Boolean,
    isCollapsed: Boolean,
    onDisplayScriptSelected: (String) -> Unit,
    onTransliterationScriptSelected: (String) -> Unit,
    onGlossLanguageSelected: (String) -> Unit,
    onToggleWordToWord: () -> Unit,
    onToggleTranslation: () -> Unit,
    onToggleCollapsed: () -> Unit
) {
    DropdownMenu(expanded = expanded, onDismissRequest = onDismiss) {
        // The quick-picker offers the same two script choices as Settings (docs/screens/settings.md
        // v5), writing to the same persisted keys, so the two surfaces never disagree.
        MenuSectionLabel("Display script")
        availableDisplayScripts.forEach { option ->
            ScriptMenuItem(
                option = option,
                selectedCode = settings.displayScriptCode,
                onSelect = onDisplayScriptSelected
            )
        }

        HorizontalDivider()
        MenuSectionLabel("Transliteration")
        availableTransliterationScripts.forEach { option ->
            ScriptMenuItem(
                option = option,
                selectedCode = settings.transliterationScriptCode,
                onSelect = onTransliterationScriptSelected
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
                        onCheckedChange = { onToggleWordToWord() },
                        colors = accentSwitchColors()
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
                                onClick = { onGlossLanguageSelected(option.code) },
                                colors = accentRadioButtonColors()
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
                        onCheckedChange = { onToggleTranslation() },
                        colors = accentSwitchColors()
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
                    onCheckedChange = { onToggleCollapsed() },
                    colors = accentSwitchColors()
                )
            }
        )
    }
}

/** One radio row of the "Aa" menu's script lists (both pickers share the same grammar). */
@Composable
private fun ScriptMenuItem(
    option: NamedOption,
    selectedCode: String,
    onSelect: (String) -> Unit
) {
    DropdownMenuItem(
        text = { Text(option.label) },
        onClick = { onSelect(option.code) },
        leadingIcon = {
            RadioButton(
                selected = option.code == selectedCode,
                onClick = { onSelect(option.code) },
                colors = accentRadioButtonColors()
            )
        }
    )
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
                    color = MaterialTheme.colorScheme.surfaceVariant,
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
                languageOfOrigin = song.languageOfOrigin,
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

/**
 * One verse: the muted **source** line in the reader's `displayScript` (resolved through `auto`
 * against the song's `language_of_origin`), the accented **reading** line in their
 * `transliterationScript`, then the optional glossary and translation
 * (docs/screens/settings.md v5 + docs/screens/song-detail.md).
 *
 * Two spec rules shape the top: the lines **dedupe** to one when both resolve to the same rendering
 * (same [ScriptOptions.renderKey]), and an **absent script is omitted**, never silently swapped for
 * IAST -- [Verse.scriptLinesOrNull] returns null and the line simply does not render.
 */
@Composable
private fun VerseBlock(
    verse: Verse,
    languageOfOrigin: String,
    settings: VerseDisplaySettings,
    collapsed: Boolean,
    onClick: (() -> Unit)?
) {
    val standard = settings.romanizationStandard
    val sourceScript = ScriptOptions.effectiveDisplayScript(settings.displayScriptCode, languageOfOrigin)
    val isDuplicate = ScriptOptions.renderKey(sourceScript, standard) ==
        ScriptOptions.renderKey(settings.transliterationScriptCode, standard)

    // When the two coincide only the accented reading line is drawn, so the same rendering never
    // appears twice.
    val sourceLines = if (isDuplicate) null else verse.scriptLinesOrNull(sourceScript, standard)
    val readingLines = verse.scriptLinesOrNull(settings.transliterationScriptCode, standard)

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        if (collapsed) {
            // Collapsed (hidden-song state): just the first line of the topmost rendered script.
            val preview = sourceLines ?: readingLines
            VerseLines(
                lines = preview.orEmpty().take(1),
                color = if (sourceLines != null) MaterialTheme.colorScheme.neutral
                else MaterialTheme.colorScheme.surfaceVariant,
                fontWeight = if (sourceLines != null) FontWeight.Normal else FontWeight.Medium
            )
        } else {
            // 1. Source line, muted -- omitted when the chosen script is absent or deduped away.
            sourceLines?.let {
                VerseLines(lines = it, color = MaterialTheme.colorScheme.neutral)
            }

            // 2. Reading line (the transliteration), accented.
            readingLines?.let {
                VerseLines(
                    lines = it,
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    fontWeight = FontWeight.Medium
                )
            }

            // 3. Word-to-word glossary (toggle + language matched; omitted when absent).
            if (settings.showWordToWord) {
                verse.wordToWordFor(settings.glossLanguageCode)?.let { w2w ->
                    Text(
                        text = buildWordToWordText(
                            words = w2w.words,
                            headwordColor = MaterialTheme.colorScheme.surfaceVariant
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

/** The verse's type ramp for one script line -- `internal` because the Settings live preview renders
 * through the very same composable, so the preview cannot drift from the reader
 * (docs/screens/settings.md v5). */
@Composable
internal fun VerseLines(
    lines: List<String>,
    color: androidx.compose.ui.graphics.Color,
    fontWeight: FontWeight = FontWeight.Normal
) {
    if (lines.isEmpty()) return
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        lines.forEach { line ->
            Text(
                text = line,
                fontSize = 15.sp,
                fontWeight = fontWeight,
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
 * reproduced here (see slice-2a report). `internal` so the Settings preview renders it identically.
 */
@Composable
internal fun buildWordToWordText(
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
            .clip(RoundedCornerShape(4.dp))
            .background(MaterialTheme.colorScheme.neutral.copy(alpha = 0.15f))
    )
}
