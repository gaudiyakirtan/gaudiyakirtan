package com.gaudiyakirtan.myapplication.ui.settings

import com.gaudiyakirtan.myapplication.ui.theme.neutral
import com.gaudiyakirtan.myapplication.ui.theme.accentRadioButtonColors

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.gaudiyakirtan.myapplication.models.DisplayNames
import com.gaudiyakirtan.myapplication.models.ScriptOptions
import com.gaudiyakirtan.myapplication.models.ThemePreference
import com.gaudiyakirtan.myapplication.models.preferredText
import com.gaudiyakirtan.myapplication.models.scriptLinesOrNull
import com.gaudiyakirtan.myapplication.models.translationFor
import com.gaudiyakirtan.myapplication.models.wordToWordFor
import com.gaudiyakirtan.myapplication.ui.song.VerseLines
import com.gaudiyakirtan.myapplication.ui.song.buildWordToWordText

private const val SCRIPT_UNAVAILABLE = "This script isn’t available for this verse."
private const val NO_GLOSSARY = "No glossary in this language for this verse."
private const val NO_TRANSLATION = "No translation in this language for this verse."

/**
 * Settings screen (docs/screens/settings.md **v5**, `Settings` / `Settings-1..3` frames).
 *
 * The screen **is** a sample verse. A column of bare labelled pickers cannot answer the only question
 * a reader actually has -- *what will this do to the page I'm reading?* -- so each control sits
 * directly under the part of a real verse (song `N9`) it drives, rendered through the very same
 * composables the song screen uses ([VerseLines], [buildWordToWordText]), so the preview can never
 * lie about the reader. Top to bottom: **Language** (the app-wide list script, with a live title /
 * author example), **Reading** (four preview rows in the reader's own vertical order), **Appearance**
 * (theme + version + corpus), **About**.
 *
 * Every control writes its setting immediately (via [SettingsViewModel] over the shared repository)
 * so an open song-detail reflects it live; everything here is device-local, persisted and offline.
 */
@Composable
fun SettingsScreen(
    onBackClick: () -> Unit,
    viewModel: SettingsViewModel = viewModel()
) {
    val settings by viewModel.settings.collectAsState()
    val sampleSong by viewModel.sampleSong.collectAsState()
    val sampleVerse by viewModel.sampleVerse.collectAsState()

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Top bar: back + title.
            Row(
                modifier = Modifier
                    .fillMaxWidth()
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
                Text(
                    text = "Settings",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // ---- Language: the app-wide default, first because it is the primary choice ----
                SettingsCard(caption = "LANGUAGE") {
                    Text(
                        text = "The default language the whole app is shown in — song titles, " +
                            "author names, and every browse & list screen. (The per-verse reading " +
                            "scripts are set under \"Reading\" below.)",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.neutral
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Display language",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    // Live example: the sample song's own title/author in the chosen script. Read
                    // from the full Song -- the manifest ships only Beng + Latn titles.
                    sampleSong?.let { song ->
                        val preferred = listOf(settings.listLanguage, ScriptOptions.LATIN, "Beng")
                        Text(
                            text = "e.g. \"${song.titleMain.preferredText(preferred)}\" — " +
                                song.authorDisplay.preferredText(preferred),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.neutral,
                            modifier = Modifier.padding(top = 2.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                    PickerButton(
                        options = DisplayNames.scriptOptions,
                        selectedCode = settings.listLanguage,
                        onSelect = viewModel::setListLanguage
                    )
                }

                // ---- Reading: the live sample verse, each part above the control that drives it ----
                SettingsCard(caption = "READING") {
                    val verse = sampleVerse
                    val song = sampleSong
                    if (verse == null || song == null) {
                        Text(
                            text = "Sample verse unavailable.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.neutral,
                            modifier = Modifier.padding(vertical = 24.dp)
                        )
                    } else {
                        val standard = settings.romanStandard
                        val sourceScript = ScriptOptions.effectiveDisplayScript(
                            settings.displayScript,
                            song.languageOfOrigin
                        )

                        PreviewRow(
                            caption = "Display script",
                            control = {
                                ScriptControl(
                                    options = DisplayNames.displayScriptOptions,
                                    scriptCode = settings.displayScript,
                                    onScript = viewModel::setDisplayScript,
                                    romanStandard = standard,
                                    onRomanStandard = viewModel::setRomanStandard
                                )
                            }
                        ) {
                            val lines = verse.scriptLinesOrNull(sourceScript, standard)
                            if (lines.isNullOrEmpty()) EmptyState(SCRIPT_UNAVAILABLE)
                            else VerseLines(lines = lines, color = MaterialTheme.colorScheme.neutral)
                        }

                        PreviewDivider()

                        PreviewRow(
                            caption = "Transliteration",
                            control = {
                                ScriptControl(
                                    options = DisplayNames.scriptOptions,
                                    scriptCode = settings.transliterationScript,
                                    onScript = viewModel::setTransliterationScript,
                                    romanStandard = standard,
                                    onRomanStandard = viewModel::setRomanStandard
                                )
                            }
                        ) {
                            val lines = verse.scriptLinesOrNull(settings.transliterationScript, standard)
                            if (lines.isNullOrEmpty()) EmptyState(SCRIPT_UNAVAILABLE)
                            else VerseLines(
                                lines = lines,
                                color = MaterialTheme.colorScheme.surfaceVariant,
                                fontWeight = FontWeight.Medium
                            )
                        }

                        PreviewDivider()

                        PreviewRow(
                            caption = "Word-by-word",
                            control = {
                                PickerButton(
                                    options = DisplayNames.wordToWordLanguageOptions,
                                    selectedCode = settings.wordToWordLanguage,
                                    onSelect = viewModel::setWordToWordLanguage
                                )
                            }
                        ) {
                            val gloss = verse.wordToWordFor(settings.wordToWordLanguage)
                            if (gloss == null || gloss.words.isEmpty()) EmptyState(NO_GLOSSARY)
                            else Text(
                                text = buildWordToWordText(
                                    words = gloss.words,
                                    headwordColor = MaterialTheme.colorScheme.surfaceVariant
                                ),
                                fontSize = 14.sp,
                                color = MaterialTheme.colorScheme.onBackground,
                                textAlign = TextAlign.Start,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }

                        PreviewDivider()

                        PreviewRow(
                            caption = "Translation",
                            control = {
                                PickerButton(
                                    options = DisplayNames.translationLanguageOptions,
                                    selectedCode = settings.translationLanguage,
                                    onSelect = viewModel::setTranslationLanguage
                                )
                            }
                        ) {
                            val translation = verse.translationFor(settings.translationLanguage)
                            if (translation == null || translation.text.isEmpty()) {
                                EmptyState(NO_TRANSLATION)
                            } else {
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

                // ---- Appearance ----
                SettingsCard(caption = "APPEARANCE") {
                    Text(
                        text = "Theme",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    Text(
                        text = "Gaura (light) / Shyam (dark)",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.neutral,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    ThemeSegmentedControl(
                        selected = settings.theme,
                        onSelect = viewModel::setTheme
                    )
                    Spacer(modifier = Modifier.height(14.dp))
                    PreviewDivider()
                    ValueRow(label = "Version", value = appVersionName())
                    ValueRow(label = "Corpus", value = "Bundled, works offline")
                }

                // ---- About ----
                SettingsCard(caption = "ABOUT") { AboutSection() }

                Spacer(modifier = Modifier.height(48.dp))
            }
        }
    }
}

/** A grouped settings card: a small uppercase caption over an outlined `surface` panel. */
@Composable
private fun SettingsCard(caption: String, content: @Composable ColumnScope.() -> Unit) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Caption(caption)
            Spacer(modifier = Modifier.height(8.dp))
            content()
        }
    }
}

/** The small uppercase caption used for card headers and preview-row labels. */
@Composable
private fun Caption(text: String) {
    Text(
        text = text.uppercase(),
        fontSize = 11.sp,
        fontWeight = FontWeight.SemiBold,
        letterSpacing = 1.sp,
        color = MaterialTheme.colorScheme.neutral
    )
}

/**
 * One preview row: on a phone the verse part stacks **above** its caption + control, so the reader
 * sees the effect first and the label second (docs/screens/settings.md v5 -- desktop web puts them
 * side by side; a phone column is too narrow for that).
 */
@Composable
private fun PreviewRow(
    caption: String,
    control: @Composable () -> Unit,
    preview: @Composable () -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 14.dp)) {
        preview()
        Spacer(modifier = Modifier.height(12.dp))
        Caption(caption)
        Spacer(modifier = Modifier.height(6.dp))
        control()
    }
}

@Composable
private fun PreviewDivider() {
    HorizontalDivider(thickness = 1.dp, color = MaterialTheme.colorScheme.outline)
}

/** The italic "this verse has nothing to show here" line -- a missing script/gloss/translation is a
 * visible state, never a silent fallback (docs/screens/settings.md v5). */
@Composable
private fun EmptyState(text: String) {
    Text(
        text = text,
        fontSize = 13.sp,
        fontStyle = FontStyle.Italic,
        color = MaterialTheme.colorScheme.neutral,
        modifier = Modifier.fillMaxWidth()
    )
}

/**
 * A script picker that reveals a second **roman standard** picker beside it only while *this* picker
 * is set to "English (Roman / Latin)" (docs/screens/settings.md v5) -- the standard means nothing for
 * any other script, and both pickers write the one shared `romanStandard` setting.
 */
@Composable
private fun ScriptControl(
    options: List<DisplayNames.Option>,
    scriptCode: String,
    onScript: (String) -> Unit,
    romanStandard: String,
    onRomanStandard: (String) -> Unit
) {
    ControlRow {
        PickerButton(options = options, selectedCode = scriptCode, onSelect = onScript)
        if (scriptCode == ScriptOptions.LATIN) {
            PickerButton(
                options = DisplayNames.romanStandardOptions,
                selectedCode = romanStandard,
                onSelect = onRomanStandard
            )
        }
    }
}

/** Two controls side by side with a gap; kept as one place so the pickers always align. */
@Composable
private fun ControlRow(content: @Composable RowScope.() -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically,
        content = content
    )
}

/**
 * The app's picker idiom: a rounded value-pill that opens a radio [DropdownMenu] of the options
 * (the same grammar as the song screen's "Aa" menu, so Settings still feels like the rest of the app).
 */
@Composable
private fun PickerButton(
    options: List<DisplayNames.Option>,
    selectedCode: String,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var open by remember { mutableStateOf(false) }
    val selectedLabel = options.firstOrNull { it.code == selectedCode }?.label ?: selectedCode

    Box(modifier = modifier) {
        Surface(
            shape = RoundedCornerShape(10.dp),
            color = MaterialTheme.colorScheme.background,
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
            onClick = { open = true }
        ) {
            Row(
                modifier = Modifier.padding(start = 14.dp, end = 6.dp, top = 9.dp, bottom = 9.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = selectedLabel,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Icon(
                    imageVector = Icons.Default.ArrowDropDown,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.neutral
                )
            }
        }
        DropdownMenu(expanded = open, onDismissRequest = { open = false }) {
            options.forEach { option ->
                DropdownMenuItem(
                    text = { Text(option.label) },
                    onClick = {
                        onSelect(option.code)
                        open = false
                    },
                    leadingIcon = {
                        RadioButton(
                            selected = option.code == selectedCode,
                            onClick = {
                                onSelect(option.code)
                                open = false
                            },
                            colors = accentRadioButtonColors()
                        )
                    }
                )
            }
        }
    }
}

/** Theme as a segmented control -- three equal pills, the active one filled with the accent. */
@Composable
private fun ThemeSegmentedControl(
    selected: ThemePreference,
    onSelect: (ThemePreference) -> Unit
) {
    val options = listOf(
        ThemePreference.GAURA to "Gaura",
        ThemePreference.SHYAM to "Shyam",
        ThemePreference.SYSTEM to "System"
    )
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(MaterialTheme.colorScheme.background)
            .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(12.dp))
            .padding(3.dp),
        horizontalArrangement = Arrangement.spacedBy(3.dp)
    ) {
        options.forEach { (preference, label) ->
            val isSelected = preference == selected
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(9.dp))
                    .background(
                        if (isSelected) MaterialTheme.colorScheme.surfaceVariant
                        else Color.Transparent
                    )
                    .clickable { onSelect(preference) }
                    .padding(vertical = 9.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = label,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium,
                    color = if (isSelected) MaterialTheme.colorScheme.onSurfaceVariant
                    else MaterialTheme.colorScheme.neutral
                )
            }
        }
    }
}

/** A read-only "label ........ value" row (Version, Corpus). */
@Composable
private fun ValueRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.weight(1f)
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.neutral
        )
    }
}

/** The installed `versionName`, read from the package rather than duplicated here as a literal that
 * would silently go stale against `build.gradle.kts`. */
@Composable
private fun appVersionName(): String {
    val context = LocalContext.current
    return remember(context) {
        runCatching {
            context.packageManager.getPackageInfo(context.packageName, 0).versionName
        }.getOrNull()?.takeIf { it.isNotBlank() } ?: "—"
    }
}

@Composable
private fun AboutSection() {
    var expanded by remember { mutableStateOf(false) }
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { expanded = !expanded }
                .padding(vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "About this app",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.weight(1f)
            )
            Icon(
                imageVector = if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                contentDescription = if (expanded) "Collapse" else "Expand",
                tint = MaterialTheme.colorScheme.neutral
            )
        }
        AnimatedVisibility(visible = expanded) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = "Gaudiya Kirtan",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = "An offline library of Gaudiya Vaiṣṇava kirtan and bhajan.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.neutral
                )
            }
        }
    }
}
