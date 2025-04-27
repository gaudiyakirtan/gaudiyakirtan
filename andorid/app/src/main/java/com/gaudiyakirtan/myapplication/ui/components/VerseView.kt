package com.gaudiyakirtan.myapplication.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gaudiyakirtan.myapplication.models.Verse

/**
 * A verse view component that matches the iOS implementation styling
 */
@Composable
fun VerseView(
    verse: Verse,
    selectedLanguage: String = "en"
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 16.dp), // Match iOS padding of .padding(.vertical)
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        // Original Text - Neutral color and centered
        if (verse.original.isNotEmpty()) {
            VStack(spacing = 4.dp) {
                verse.original.forEach { line ->
                    Text(
                        text = line,
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.tertiary, // Neutral color
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }

        // Transliterations - Highlight color and centered
        verse.transliterations
            .firstOrNull { it?.language == selectedLanguage }
            ?.let { transliteration ->
                VStack(spacing = 4.dp) {
                    transliteration.text.forEach { line ->
                        Text(
                            text = line,
                            fontSize = 14.sp,
                            color = MaterialTheme.colorScheme.surfaceVariant, // Highlight color
                            textAlign = TextAlign.Center,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }

        // Word to Word - Flowing text style with highlight for Sanskrit terms
        verse.wordToWords
            .firstOrNull { it?.language == selectedLanguage }
            ?.let { wordToWord ->
                Text(
                    text = buildAnnotatedString {
                        wordToWord.words.forEach { pair ->
                            withStyle(style = SpanStyle(
                                color = MaterialTheme.colorScheme.surfaceVariant, // Highlight color
                                fontWeight = FontWeight.Medium
                            )) {
                                append(pair[0])
                            }
                            append(" - ${pair[1]}; ")
                        }
                    },
                    fontSize = 14.sp,
                    color = MaterialTheme.colorScheme.onBackground, // Regular text color
                    modifier = Modifier.fillMaxWidth(),
                    textAlign = TextAlign.Start // Explicitly set to left align
                )
            }

        // Translation - PrimaryText color and semibold weight (matching iOS)
        verse.translations
            .firstOrNull { it?.language == selectedLanguage }
            ?.let { translation ->
                Text(
                    text = translation.text,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onBackground, // Match iOS primaryText color
                    modifier = Modifier.fillMaxWidth(),
                    textAlign = TextAlign.Start // Explicitly set to left align
                )
            }
    }
}

/**
 * Helper composable to match iOS VStack with spacing
 */
@Composable
private fun VStack(
    spacing: Dp,
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(spacing),
        content = content
    )
}