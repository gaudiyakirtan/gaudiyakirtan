package com.gaudiyakirtan.myapplication.ui.song

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gaudiyakirtan.data.SampleData
import com.gaudiyakirtan.myapplication.models.Song
import com.gaudiyakirtan.myapplication.models.Verse
import com.gaudiyakirtan.myapplication.ui.components.Tag
import com.gaudiyakirtan.myapplication.ui.components.icons.MusicNote

/**
 * Full screen view for a single song
 * Displays the song details and verses without any navigation bar
 * Only shows a back button at the top
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SongScreen(
    song: Song,
    verses: List<Verse> = SampleData.verses,
    onBackClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Content
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(top = 60.dp), // Add space for the back button
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Song header section
            item {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Title and UID
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = song.title,
                            style = MaterialTheme.typography.headlineMedium,
                            color = MaterialTheme.colorScheme.primary
                        )
                        
                        // UID badge
                        Surface(
                            modifier = Modifier.padding(start = 8.dp),
                            shape = RoundedCornerShape(11.dp),
                            color = MaterialTheme.colorScheme.tertiary.copy(alpha = 0.25f),
                        ) {
                            Text(
                                text = song.uid,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                style = MaterialTheme.typography.labelMedium,
                                color = MaterialTheme.colorScheme.tertiary
                            )
                        }
                    }
                    
                    // Author and audio icon
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = song.author,
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.tertiary
                        )
                        
                        if (song.audio) {
                            MusicNote(
                                modifier = Modifier.size(16.dp),
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                    
                    // Tags
                    if (song.tags.isNotEmpty()) {
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            items(song.tags) { tag ->
                                Tag(text = tag)
                            }
                        }
                    }
                }
            }
            
            item {
                Divider(
                    modifier = Modifier.padding(vertical = 8.dp),
                    color = MaterialTheme.colorScheme.outline.copy(alpha = 0.5f)
                )
            }
            
            // Verse sections
            items(verses) { verse ->
                VerseSection(verse = verse)
            }
            
            // Bottom spacer
            item {
                Spacer(modifier = Modifier.height(50.dp))
            }
        }
        
        // Back button overlay
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
                    imageVector = Icons.Default.ArrowBack,
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
        }
    }
}

@Composable
private fun VerseSection(verse: Verse) {
    val selectedLanguage = "en" // Default language
    
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        shape = RoundedCornerShape(12.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Original text
            if (verse.original.isNotEmpty()) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    verse.original.forEach { line ->
                        Text(
                            text = line,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.tertiary
                        )
                    }
                }
            }
            
            // Transliteration
            val transliteration = verse.transliterations.find { it?.language == selectedLanguage }
            if (transliteration != null) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    transliteration.text.forEach { line ->
                        Text(
                            text = line,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }
            
            // Word to Word
            val wordToWord = verse.wordToWords.find { it?.language == selectedLanguage }
            if (wordToWord != null) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.Start
                ) {
                    Text(
                        text = buildWordToWordText(wordToWord.words),
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
            
            // Translation
            val translation = verse.translations.find { it?.language == selectedLanguage }
            if (translation != null) {
                Text(
                    text = translation.text,
                    style = MaterialTheme.typography.bodyLarge.copy(
                        fontWeight = FontWeight.SemiBold
                    ),
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

private fun buildWordToWordText(words: List<List<String>>): String {
    return words.joinToString(" ") { pair ->
        "${pair.getOrNull(0) ?: ""} - ${pair.getOrNull(1) ?: ""};"
    }
}