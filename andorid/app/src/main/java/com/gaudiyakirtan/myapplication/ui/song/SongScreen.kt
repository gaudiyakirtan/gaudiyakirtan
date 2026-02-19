package com.gaudiyakirtan.myapplication.ui.song

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.MusicOff
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gaudiyakirtan.data.SampleData
import com.gaudiyakirtan.myapplication.models.Song
import com.gaudiyakirtan.myapplication.models.Verse

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SongScreen(
    song: Song,
    verses: List<Verse> = SampleData.verses,
    onBackClick: () -> Unit
) {
    val context = LocalContext.current
    var fontSize by remember { mutableFloatStateOf(14f) }
    var showOriginal by remember { mutableStateOf(true) }
    var showTransliteration by remember { mutableStateOf(true) }
    var showWordToWord by remember { mutableStateOf(true) }
    var showTranslation by remember { mutableStateOf(true) }
    var showReaderSettings by remember { mutableStateOf(false) }
    val bookmarkedSongIds = remember { listOf("N3", "S1", "E4") }
    var isBookmarked by remember { mutableStateOf(bookmarkedSongIds.contains(song.uid)) }
    var showQueue by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Content
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(top = 60.dp),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Song header section
            item {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = song.title,
                        style = MaterialTheme.typography.headlineLarge,
                        color = MaterialTheme.colorScheme.primary,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Text(
                        text = song.author,
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Normal
                        ),
                        color = MaterialTheme.colorScheme.onBackground,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }

            // Verse sections
            itemsIndexed(verses) { index, verse ->
                VerseSection(
                    verse = verse,
                    verseNumber = index + 1,
                    fontSize = fontSize.sp,
                    showOriginal = showOriginal,
                    showTransliteration = showTransliteration,
                    showWordToWord = showWordToWord,
                    showTranslation = showTranslation
                )
            }

            // Bottom spacer
            item {
                Spacer(modifier = Modifier.height(50.dp))
            }
        }

        // Back button and action icons overlay
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.background)
                .padding(horizontal = 16.dp, vertical = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextButton(
                onClick = onBackClick,
                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "Back",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(start = 4.dp)
                )
            }
            Spacer(modifier = Modifier.weight(1f))
            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                // Queue
                IconButton(onClick = { showQueue = true }) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.List,
                        contentDescription = "Queue",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
                // Font size
                Box {
                    IconButton(onClick = {
                        showReaderSettings = !showReaderSettings
                    }) {
                        Text(
                            text = "Aa",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold
                            ),
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                    DropdownMenu(
                        expanded = showReaderSettings,
                        onDismissRequest = { showReaderSettings = false }
                    ) {
                        Column(
                            modifier = Modifier
                                .width(260.dp)
                                .padding(16.dp)
                        ) {
                            Text(
                                text = "Font Size",
                                style = MaterialTheme.typography.labelMedium,
                                color = MaterialTheme.colorScheme.tertiary
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text("A", fontSize = 12.sp, color = MaterialTheme.colorScheme.tertiary)
                                Slider(
                                    value = fontSize,
                                    onValueChange = { fontSize = it },
                                    valueRange = 10f..22f,
                                    steps = 11,
                                    modifier = Modifier.weight(1f),
                                    colors = SliderDefaults.colors(
                                        thumbColor = MaterialTheme.colorScheme.primary,
                                        activeTrackColor = MaterialTheme.colorScheme.primary
                                    )
                                )
                                Text("A", fontSize = 20.sp, color = MaterialTheme.colorScheme.tertiary)
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            HorizontalDivider()
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Display",
                                style = MaterialTheme.typography.labelMedium,
                                color = MaterialTheme.colorScheme.tertiary
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            ReaderToggleRow("Original Script", showOriginal) { showOriginal = it }
                            ReaderToggleRow("Transliteration", showTransliteration) { showTransliteration = it }
                            ReaderToggleRow("Synonyms", showWordToWord) { showWordToWord = it }
                            ReaderToggleRow("Translation", showTranslation) { showTranslation = it }
                        }
                    }
                }
                // Bookmark
                IconButton(onClick = { isBookmarked = !isBookmarked }) {
                    Icon(
                        imageVector = if (isBookmarked) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                        contentDescription = "Bookmark",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
                // Share
                IconButton(onClick = {
                    val shareIntent = Intent(Intent.ACTION_SEND).apply {
                        type = "text/plain"
                        putExtra(Intent.EXTRA_TEXT, "${song.title} by ${song.author}\nhttps://gaudiyakirtan.com/songs/${song.uid}")
                    }
                    context.startActivity(Intent.createChooser(shareIntent, "Share song"))
                }) {
                    Icon(
                        imageVector = Icons.Default.Share,
                        contentDescription = "Share",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }
    }

    // Queue bottom sheet
    if (showQueue) {
        ModalBottomSheet(
            onDismissRequest = { showQueue = false }
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Text(
                    text = "Tracks",
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.onBackground,
                    modifier = Modifier.padding(bottom = 16.dp)
                )
                if (song.audio) {
                    Text(
                        text = "Track 1",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onBackground,
                        modifier = Modifier.padding(vertical = 12.dp)
                    )
                    HorizontalDivider()
                    Text(
                        text = "Track 2",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onBackground,
                        modifier = Modifier.padding(vertical = 12.dp)
                    )
                } else {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.MusicOff,
                            contentDescription = null,
                            modifier = Modifier.size(40.dp),
                            tint = MaterialTheme.colorScheme.tertiary
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "No audio tracks available",
                            color = MaterialTheme.colorScheme.tertiary
                        )
                    }
                }
                Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }
}

@Composable
private fun VerseSection(
    verse: Verse,
    verseNumber: Int = 0,
    fontSize: TextUnit = 14.sp,
    showOriginal: Boolean = true,
    showTransliteration: Boolean = true,
    showWordToWord: Boolean = true,
    showTranslation: Boolean = true
) {
    val selectedLanguage = "en"

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Original text
        if (showOriginal && verse.original.isNotEmpty()) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                verse.original.forEach { line ->
                    Text(
                        text = line,
                        fontSize = fontSize,
                        color = MaterialTheme.colorScheme.tertiary
                    )
                }
            }
        }

        // Transliteration
        val transliteration = verse.transliterations.find { it?.language == selectedLanguage }
        if (showTransliteration && transliteration != null) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                transliteration.text.forEachIndexed { index, line ->
                    val displayText = if (index == transliteration.text.size - 1 && verseNumber > 0) {
                        "$line ($verseNumber)"
                    } else {
                        line
                    }
                    Text(
                        text = displayText,
                        fontSize = fontSize,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }

        // Word to Word
        val wordToWord = verse.wordToWords.find { it?.language == selectedLanguage }
        if (showWordToWord && wordToWord != null) {
            Text(
                text = buildAnnotatedString {
                    wordToWord.words.forEach { pair ->
                        withStyle(style = SpanStyle(
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Medium
                        )) {
                            append(pair.getOrNull(0) ?: "")
                        }
                        append(" \u2014 ${pair.getOrNull(1) ?: ""}; ")
                    }
                },
                fontSize = fontSize,
                lineHeight = (fontSize.value * 1.4).sp,
                modifier = Modifier.fillMaxWidth()
            )
        }

        // Translation - bold
        val translation = verse.translations.find { it?.language == selectedLanguage }
        if (showTranslation && translation != null) {
            Text(
                text = translation.text,
                fontSize = (fontSize.value + 1).sp,
                fontWeight = FontWeight.Bold,
                lineHeight = ((fontSize.value + 1) * 1.4).sp,
                color = MaterialTheme.colorScheme.onBackground
            )
        }
    }
}

@Composable
private fun ReaderToggleRow(
    label: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onBackground
        )
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedTrackColor = MaterialTheme.colorScheme.primary,
                checkedThumbColor = MaterialTheme.colorScheme.onPrimary
            )
        )
    }
}
