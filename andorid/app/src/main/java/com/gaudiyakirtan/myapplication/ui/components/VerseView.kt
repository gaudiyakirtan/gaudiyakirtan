package com.gaudiyakirtan.myapplication.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.models.Verse

@Composable
fun VerseView(
    verse: Verse,
    selectedLanguage: String = "en"
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.Start,
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        // Original Text
        if (verse.original.isNotEmpty()) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                verse.original.forEach { line ->
                    Text(
                        text = line,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        // Transliterations
        verse.transliterations
            .firstOrNull { it?.language == selectedLanguage }
            ?.let { transliteration ->
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.fillMaxWidth()
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
        verse.wordToWords
            .firstOrNull { it?.language == selectedLanguage }
            ?.let { wordToWord ->
                Text(
                    text = buildAnnotatedString {
                        wordToWord.words.forEach { pair ->
                            append(pair[0])
                            withStyle(
                                style = SpanStyle(
                                    color = MaterialTheme.colorScheme.primary
                                )
                            ) {
                                append(" - ${pair[1]}; ")
                            }
                        }
                    },
                    style = MaterialTheme.typography.bodyMedium
                )
            }

        // Translation
        verse.translations
            .firstOrNull { it?.language == selectedLanguage }
            ?.let { translation ->
                Text(
                    text = translation.text,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
    }
}