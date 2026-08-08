package com.gaudiyakirtan.myapplication.models

/** App palette preference, per docs/screens/settings.md `theme` (gaura / shyam / system). */
enum class ThemePreference(val storageValue: String) {
    GAURA("gaura"),
    SHYAM("shyam"),
    SYSTEM("system");

    companion object {
        fun fromStorage(value: String?): ThemePreference =
            entries.firstOrNull { it.storageValue == value } ?: SYSTEM
    }
}

/**
 * The reader's device-local, persisted, offline settings object -- the single source of truth for
 * how songs are displayed and how the app looks (docs/screens/settings.md, spec v5). Field names and
 * defaults mirror the spec's settings table exactly. Both the Settings screen and the song-detail
 * quick-toggles read/write this one object (via [com.gaudiyakirtan.data.SettingsRepository]), so the
 * two stay in sync.
 *
 * The verse's two script lines are set independently (v5): [displayScript] drives the muted **source**
 * line and defaults to [ScriptOptions.AUTO] ("Default (source language)", resolved per song from its
 * `language_of_origin`); [transliterationScript] drives the accented **reading** line and defaults to
 * Latin, so the out-of-the-box reading is unchanged. [romanStandard] applies to whichever of the two
 * is Latin.
 */
data class AppSettings(
    val displayScript: String = ScriptOptions.AUTO,
    val transliterationScript: String = ScriptOptions.LATIN,
    val romanStandard: String = "IAST",
    val showWordToWord: Boolean = true,
    val wordToWordLanguage: String = "eng",
    val showTranslation: Boolean = true,
    val translationLanguage: String = "eng",
    val listLanguage: String = "Latn",
    val theme: ThemePreference = ThemePreference.SYSTEM
)
