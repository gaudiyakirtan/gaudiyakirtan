package com.gaudiyakirtan.myapplication.ui.components

import com.gaudiyakirtan.myapplication.ui.theme.Spacing
import com.gaudiyakirtan.myapplication.ui.theme.neutral

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
import com.gaudiyakirtan.myapplication.models.nativeScriptLines
import com.gaudiyakirtan.myapplication.models.romanizedLines

/**
 * A verse view component that matches the iOS implementation styling.
 *
 * @param glossLanguageCode ISO 639-3 language code (e.g. "eng", "hin") used to pick which
 *   [Verse.wordToWords] / [Verse.translations] entry to show, per docs/data/README.md's language
 *   code convention.
 */
@Composable
fun VerseView(
    verse: Verse,
    glossLanguageCode: String = "eng"
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = Spacing.lg), // Match iOS padding of .padding(.vertical)
        verticalArrangement = Arrangement.spacedBy(Spacing.lg) // Increased from 10dp to 16dp for more spacing between content sections
    ) {
        // Original Text - Neutral color and centered
        val originalLines = verse.nativeScriptLines()
        if (originalLines.isNotEmpty()) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                for (i in originalLines.indices) {
                    Text(
                        text = originalLines[i],
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.neutral, // Neutral color
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Add spacer between lines (except after the last line)
                    if (i < originalLines.size - 1) {
                        Spacer(modifier = Modifier.height(Spacing.sm))
                    }
                }
            }
        }

        // Transliteration - Highlight color and centered
        val transliterationLines = verse.romanizedLines()
        if (transliterationLines.isNotEmpty()) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                for (i in transliterationLines.indices) {
                    Text(
                        text = transliterationLines[i],
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.primary, // Highlight color
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Add spacer between lines (except after the last line)
                    if (i < transliterationLines.size - 1) {
                        Spacer(modifier = Modifier.height(Spacing.sm))
                    }
                }
            }
        }

        // Word to Word - Flowing text style with highlight for Sanskrit terms
        verse.wordToWords
            .firstOrNull { it.languageCode == glossLanguageCode }
            ?.let { wordToWord ->
                Text(
                    text = buildAnnotatedString {
                        wordToWord.words.forEach { pair ->
                            withStyle(
                                style = SpanStyle(
                                    color = MaterialTheme.colorScheme.primary, // Highlight color
                                    fontWeight = FontWeight.Medium
                                )
                            ) {
                                append(pair.getOrNull(0) ?: "")
                            }
                            append(" - ${pair.getOrNull(1) ?: ""}; ")
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
            .firstOrNull { it.languageCode == glossLanguageCode }
            ?.let { translation ->
                Column(modifier = Modifier.fillMaxWidth()) {
                    translation.text.forEach { line ->
                        Text(
                            text = line,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onBackground, // Match iOS primaryText color
                            modifier = Modifier.fillMaxWidth(),
                            textAlign = TextAlign.Start // Explicitly set to left align
                        )
                    }
                }
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
