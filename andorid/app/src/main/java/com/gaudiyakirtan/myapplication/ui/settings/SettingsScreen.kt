package com.gaudiyakirtan.myapplication.ui.settings

import com.gaudiyakirtan.myapplication.ui.components.GaudiyaTopAppBar
import com.gaudiyakirtan.myapplication.ui.theme.Spacing
import com.gaudiyakirtan.myapplication.ui.theme.neutral

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.gaudiyakirtan.myapplication.models.DisplayNames
import com.gaudiyakirtan.myapplication.models.ThemePreference

/**
 * Settings screen (docs/screens/settings.md, `Settings` / `Settings-1..3` frames): a grouped list
 * of device-local, persisted, offline controls. Each control writes its setting immediately (via
 * [SettingsViewModel] over the shared repository) so an open song-detail reflects it live. Groups:
 * Display (script, roman standard, word-to-word + language, translation + language, list language),
 * Appearance (theme), About.
 */
@Composable
fun SettingsScreen(
    onBackClick: () -> Unit,
    viewModel: SettingsViewModel = viewModel()
) {
    val settings by viewModel.settings.collectAsState()

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            GaudiyaTopAppBar(title = "Settings", onBackClick = onBackClick)

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = Spacing.lg)
            ) {
                // ---- Display ----
                SectionHeader("Display")

                PickerRow(
                    label = "Script",
                    options = DisplayNames.scriptOptions,
                    selectedCode = settings.displayScript,
                    onSelect = viewModel::setDisplayScript
                )
                PickerRow(
                    label = "Roman standard",
                    options = DisplayNames.romanStandardOptions,
                    selectedCode = settings.romanStandard,
                    onSelect = viewModel::setRomanStandard
                )
                SwitchRow(
                    label = "Word for word",
                    checked = settings.showWordToWord,
                    onCheckedChange = viewModel::setShowWordToWord
                )
                if (settings.showWordToWord) {
                    PickerRow(
                        label = "Word-for-word language",
                        options = DisplayNames.wordToWordLanguageOptions,
                        selectedCode = settings.wordToWordLanguage,
                        onSelect = viewModel::setWordToWordLanguage,
                        indented = true
                    )
                }
                SwitchRow(
                    label = "Translation",
                    checked = settings.showTranslation,
                    onCheckedChange = viewModel::setShowTranslation
                )
                if (settings.showTranslation) {
                    PickerRow(
                        label = "Translation language",
                        options = DisplayNames.translationLanguageOptions,
                        selectedCode = settings.translationLanguage,
                        onSelect = viewModel::setTranslationLanguage,
                        indented = true
                    )
                }
                PickerRow(
                    label = "List language",
                    options = DisplayNames.scriptOptions,
                    selectedCode = settings.listLanguage,
                    onSelect = viewModel::setListLanguage
                )

                // ---- Appearance ----
                SectionHeader("Appearance")
                ThemeRow(
                    selected = settings.theme,
                    onSelect = viewModel::setTheme
                )

                // ---- About ----
                SectionHeader("About")
                AboutSection()

                Spacer(modifier = Modifier.height(Spacing.xxxl))
            }
        }
    }
}

@Composable
private fun SectionHeader(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.titleSmall,
        fontWeight = FontWeight.SemiBold,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.padding(top = Spacing.xl, bottom = Spacing.sm)
    )
}

/** A row: label on the left, a tappable rounded value-pill on the right that opens the option menu. */
@Composable
private fun PickerRow(
    label: String,
    options: List<DisplayNames.Option>,
    selectedCode: String,
    onSelect: (String) -> Unit,
    indented: Boolean = false
) {
    var open by remember { mutableStateOf(false) }
    val selectedLabel = options.firstOrNull { it.code == selectedCode }?.label ?: selectedCode

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(start = if (indented) Spacing.lg else 0.dp, top = Spacing.md, bottom = Spacing.md),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.weight(1f)
        )
        Box {
            Surface(
                shape = MaterialTheme.shapes.small,
                color = MaterialTheme.colorScheme.surface,
                onClick = { open = true }
            ) {
                Text(
                    text = selectedLabel,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onBackground,
                    modifier = Modifier.padding(horizontal = Spacing.lg, vertical = Spacing.sm)
                )
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
                                }
                            )
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun SwitchRow(
    label: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = Spacing.sm),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.weight(1f)
        )
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
}

@Composable
private fun ThemeRow(
    selected: ThemePreference,
    onSelect: (ThemePreference) -> Unit
) {
    val options = listOf(
        ThemePreference.SYSTEM to "System",
        ThemePreference.GAURA to "Gaura",
        ThemePreference.SHYAM to "Shyam"
    )
    var open by remember { mutableStateOf(false) }
    val selectedLabel = options.firstOrNull { it.first == selected }?.second ?: "System"

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = Spacing.md),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "Theme",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.weight(1f)
        )
        Box {
            Surface(
                shape = MaterialTheme.shapes.small,
                color = MaterialTheme.colorScheme.surface,
                onClick = { open = true }
            ) {
                Text(
                    text = selectedLabel,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onBackground,
                    modifier = Modifier.padding(horizontal = Spacing.lg, vertical = Spacing.sm)
                )
            }
            DropdownMenu(expanded = open, onDismissRequest = { open = false }) {
                options.forEach { (pref, optionLabel) ->
                    DropdownMenuItem(
                        text = { Text(optionLabel) },
                        onClick = {
                            onSelect(pref)
                            open = false
                        },
                        leadingIcon = {
                            RadioButton(
                                selected = pref == selected,
                                onClick = {
                                    onSelect(pref)
                                    open = false
                                }
                            )
                        }
                    )
                }
            }
        }
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
                .padding(vertical = Spacing.md),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "About",
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
                    .padding(bottom = Spacing.md),
                verticalArrangement = Arrangement.spacedBy(Spacing.xs)
            ) {
                Text(
                    text = "Gaudiya Kirtan",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = "Version 1.0",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.neutral
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
