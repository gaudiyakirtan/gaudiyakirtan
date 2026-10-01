package com.gaudiyakirtan.myapplication.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.style.TextAlign
import com.gaudiyakirtan.myapplication.models.*
import com.gaudiyakirtan.myapplication.ui.theme.Spacing

/** Complete Home reading, using the same persisted preferences and resolvers as song detail. */
@Composable
fun VerseView(verse: Verse, settings: AppSettings = AppSettings()) {
    Column(Modifier.fillMaxWidth().padding(vertical = Spacing.lg),
        verticalArrangement = Arrangement.spacedBy(Spacing.lg)) {
        val primaryLines = verse.linesForScript(settings.displayScript, settings.romanStandard)
        VerseLines(primaryLines)
        if (settings.displayScript != "Latn") {
            val romanLines = verse.linesForScript("Latn", settings.romanStandard)
            if (romanLines != primaryLines) VerseLines(romanLines)
        }
        if (settings.showWordToWord) {
            verse.wordToWordFor(settings.wordToWordLanguage)?.let { glossary ->
                Text(buildAnnotatedString {
                    glossary.words.forEachIndexed { index, pair ->
                        if (index > 0) append("; ")
                        append(pair.getOrNull(0).orEmpty())
                        append(" — ")
                        append(pair.getOrNull(1).orEmpty())
                    }
                }, style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
        if (settings.showTranslation) {
            verse.translationFor(settings.translationLanguage)?.text?.forEach { line ->
                Text(line, style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

@Composable
private fun VerseLines(lines: List<String>) {
    Column(verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
        lines.forEach { line ->
            Text(line, style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurface,
                textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
        }
    }
}
