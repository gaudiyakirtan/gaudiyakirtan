package com.gaudiyakirtan.myapplication.ui.settings

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.gaudiyakirtan.data.SettingsRepository
import com.gaudiyakirtan.data.SongRepository
import com.gaudiyakirtan.myapplication.models.AppSettings
import com.gaudiyakirtan.myapplication.models.Song
import com.gaudiyakirtan.myapplication.models.ThemePreference
import com.gaudiyakirtan.myapplication.models.Verse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/** The song every platform previews on Settings, so the three screens can be compared side by side
 * (docs/screens/settings.md v5, "Sample song"). */
private const val SAMPLE_SONG_UID = "N9"

/**
 * ViewModel for the Settings screen (docs/screens/settings.md v5). A thin, reactive layer over the
 * shared [SettingsRepository]: it re-exposes the persisted [AppSettings] flow and forwards each
 * control's change straight to the repository, which writes through to storage immediately. Because
 * the same repository backs the song-detail quick-toggles, edits here are reflected there live.
 *
 * It also loads the spec's **sample song** from the offline [SongRepository], because the v5 screen
 * *is* a live preview: every control sits beside the part of a real verse it drives. [sampleSong]
 * and [sampleVerse] stay null until the asset decode finishes (and if it fails), which the screen
 * renders as "Sample verse unavailable." rather than dropping the card.
 */
class SettingsViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = SettingsRepository.getInstance(application)
    private val songRepository = SongRepository.getInstance(application)

    val settings: StateFlow<AppSettings> = repository.settings

    private val _sampleSong = MutableStateFlow<Song?>(null)

    /** The full sample [Song] -- not a `ManifestEntry`: the shipped manifest carries only `Beng` +
     * `Latn` titles, so only the song itself can demo the Display-language setting in every script. */
    val sampleSong: StateFlow<Song?> = _sampleSong.asStateFlow()

    private val _sampleVerse = MutableStateFlow<Verse?>(null)

    /** The first verse carrying a `Beng` script *and* an `eng` gloss *and* an `eng` translation, so
     * every one of the four preview rows has something real to show. */
    val sampleVerse: StateFlow<Verse?> = _sampleVerse.asStateFlow()

    init {
        viewModelScope.launch {
            val song = songRepository.getSongByUid(SAMPLE_SONG_UID)
            _sampleSong.value = song
            _sampleVerse.value = song?.verses?.firstOrNull { verse ->
                verse.displayScripts.any { it.scriptCode == "Beng" } &&
                    verse.wordToWords.any { it.languageCode == "eng" } &&
                    verse.translations.any { it.languageCode == "eng" }
            }
        }
    }

    fun setDisplayScript(scriptCode: String) = repository.setDisplayScript(scriptCode)
    fun setTransliterationScript(scriptCode: String) = repository.setTransliterationScript(scriptCode)
    fun setRomanStandard(standard: String) = repository.setRomanStandard(standard)
    fun setShowWordToWord(show: Boolean) = repository.setShowWordToWord(show)
    fun setWordToWordLanguage(languageCode: String) = repository.setWordToWordLanguage(languageCode)
    fun setShowTranslation(show: Boolean) = repository.setShowTranslation(show)
    fun setTranslationLanguage(languageCode: String) = repository.setTranslationLanguage(languageCode)
    fun setListLanguage(scriptCode: String) = repository.setListLanguage(scriptCode)
    fun setTheme(theme: ThemePreference) = repository.setTheme(theme)
}
