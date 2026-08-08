package com.gaudiyakirtan.data

import android.content.Context
import android.content.SharedPreferences
import com.gaudiyakirtan.myapplication.models.AppSettings
import com.gaudiyakirtan.myapplication.models.ThemePreference
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Device-local, offline persistence for the reader's [AppSettings] (docs/screens/settings.md).
 *
 * Backed by [SharedPreferences] rather than Jetpack DataStore: the spec permits "DataStore/prefs",
 * and prefs needs no extra dependency (DataStore is not in the offline Gradle cache and the build
 * disk is near-full). It is still exposed reactively -- a single [StateFlow]<[AppSettings]> that both
 * the Settings screen and the song-detail quick-toggles observe and mutate -- so a later swap to
 * DataStore is a drop-in behind this same interface.
 *
 * Every setter writes through to prefs immediately and re-emits the whole settings object, so any
 * open screen (e.g. song-detail) reflects the change live, and the value survives relaunch.
 */
class SettingsRepository private constructor(context: Context) {

    private val prefs: SharedPreferences =
        context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    private val _settings = MutableStateFlow(readFromPrefs())
    val settings: StateFlow<AppSettings> = _settings.asStateFlow()

    private fun readFromPrefs(): AppSettings {
        val defaults = AppSettings()
        return AppSettings(
            displayScript = prefs.getString(KEY_DISPLAY_SCRIPT, defaults.displayScript)!!,
            transliterationScript =
                prefs.getString(KEY_TRANSLITERATION_SCRIPT, defaults.transliterationScript)!!,
            romanStandard = prefs.getString(KEY_ROMAN_STANDARD, defaults.romanStandard)!!,
            showWordToWord = prefs.getBoolean(KEY_SHOW_W2W, defaults.showWordToWord),
            wordToWordLanguage = prefs.getString(KEY_W2W_LANG, defaults.wordToWordLanguage)!!,
            showTranslation = prefs.getBoolean(KEY_SHOW_TRANSLATION, defaults.showTranslation),
            translationLanguage = prefs.getString(KEY_TRANSLATION_LANG, defaults.translationLanguage)!!,
            listLanguage = prefs.getString(KEY_LIST_LANGUAGE, defaults.listLanguage)!!,
            theme = ThemePreference.fromStorage(prefs.getString(KEY_THEME, defaults.theme.storageValue))
        )
    }

    private inline fun update(block: SharedPreferences.Editor.() -> Unit, next: (AppSettings) -> AppSettings) {
        prefs.edit().apply(block).apply()
        _settings.value = next(_settings.value)
    }

    fun setDisplayScript(scriptCode: String) =
        update({ putString(KEY_DISPLAY_SCRIPT, scriptCode) }) { it.copy(displayScript = scriptCode) }

    /** The verse's reading line (docs/screens/settings.md v5 `transliterationScript`) -- any script,
     * not just Latin, which is why it is persisted separately from [setDisplayScript]. */
    fun setTransliterationScript(scriptCode: String) =
        update({ putString(KEY_TRANSLITERATION_SCRIPT, scriptCode) }) {
            it.copy(transliterationScript = scriptCode)
        }

    fun setRomanStandard(standard: String) =
        update({ putString(KEY_ROMAN_STANDARD, standard) }) { it.copy(romanStandard = standard) }

    fun setShowWordToWord(show: Boolean) =
        update({ putBoolean(KEY_SHOW_W2W, show) }) { it.copy(showWordToWord = show) }

    fun setWordToWordLanguage(languageCode: String) =
        update({ putString(KEY_W2W_LANG, languageCode) }) { it.copy(wordToWordLanguage = languageCode) }

    fun setShowTranslation(show: Boolean) =
        update({ putBoolean(KEY_SHOW_TRANSLATION, show) }) { it.copy(showTranslation = show) }

    fun setTranslationLanguage(languageCode: String) =
        update({ putString(KEY_TRANSLATION_LANG, languageCode) }) { it.copy(translationLanguage = languageCode) }

    fun setListLanguage(scriptCode: String) =
        update({ putString(KEY_LIST_LANGUAGE, scriptCode) }) { it.copy(listLanguage = scriptCode) }

    fun setTheme(theme: ThemePreference) =
        update({ putString(KEY_THEME, theme.storageValue) }) { it.copy(theme = theme) }

    companion object {
        /** Shared with [LastVisitedRepository] -- docs/screens/player.md v15 puts the mini-player's
         * `last_visited_song_uid` in "the same SharedPreferences store the settings use". */
        internal const val PREFS_NAME = "gaudiya_kirtan_settings"
        // Unchanged key: an install that already stored a concrete `display_script` keeps it, so only
        // a fresh install picks up the v5 `auto` default.
        private const val KEY_DISPLAY_SCRIPT = "display_script"
        private const val KEY_TRANSLITERATION_SCRIPT = "transliteration_script"
        private const val KEY_ROMAN_STANDARD = "roman_standard"
        private const val KEY_SHOW_W2W = "show_word_to_word"
        private const val KEY_W2W_LANG = "word_to_word_language"
        private const val KEY_SHOW_TRANSLATION = "show_translation"
        private const val KEY_TRANSLATION_LANG = "translation_language"
        private const val KEY_LIST_LANGUAGE = "list_language"
        private const val KEY_THEME = "theme"

        @Volatile private var instance: SettingsRepository? = null

        fun getInstance(context: Context): SettingsRepository =
            instance ?: synchronized(this) {
                instance ?: SettingsRepository(context).also { instance = it }
            }
    }
}
