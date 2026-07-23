package com.gaudiyakirtan.myapplication.ui.song

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModelProvider.AndroidViewModelFactory.Companion.APPLICATION_KEY
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.gaudiyakirtan.data.SettingsRepository
import com.gaudiyakirtan.data.SongRepository
import com.gaudiyakirtan.myapplication.models.AppSettings
import com.gaudiyakirtan.myapplication.models.DisplayNames
import com.gaudiyakirtan.myapplication.models.Song
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** Human-readable label for a script or gloss-language option surfaced in the "Aa" quick-picker. */
data class NamedOption(val code: String, val label: String)

/**
 * The subset of [AppSettings] the verse renderer needs, projected for the song-detail UI. It is a
 * live view of the persisted settings -- not independent state -- so the Settings screen and the
 * in-screen quick-toggles always agree.
 */
data class VerseDisplaySettings(
    val primaryScriptCode: String,
    val romanizationStandard: String,
    val showWordToWord: Boolean,
    val glossLanguageCode: String,
    val showTranslation: Boolean,
    val translationLanguageCode: String
)

private fun AppSettings.toVerseDisplaySettings() = VerseDisplaySettings(
    primaryScriptCode = displayScript,
    romanizationStandard = romanStandard,
    showWordToWord = showWordToWord,
    glossLanguageCode = wordToWordLanguage,
    showTranslation = showTranslation,
    translationLanguageCode = translationLanguage
)

/**
 * ViewModel for the Song Detail screen (docs/screens/song-detail.md: "state hoisted to a
 * SongViewModel"). Loads the full [Song] by uid from the offline [SongRepository].
 *
 * Display state (chosen script, word-to-word / translation toggles + languages, roman standard) is
 * NOT owned here -- it lives in the shared, persisted [SettingsRepository] (docs/screens/settings.md).
 * [settings] is a read-through view of it, and the quick-toggle methods write straight back to it, so
 * changes made here and on the Settings screen stay in sync and survive relaunch. Only the ephemeral,
 * per-screen hidden/collapse state is local.
 */
class SongViewModel(application: Application, private val songUid: String) : AndroidViewModel(application) {

    private val songRepository = SongRepository.getInstance(application)
    private val settingsRepository = SettingsRepository.getInstance(application)

    private val _song = MutableStateFlow<Song?>(null)
    val song: StateFlow<Song?> = _song.asStateFlow()

    private val _isLoading = MutableStateFlow(true)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    /** Live projection of the persisted settings; a script switch or toggle re-renders every verse. */
    val settings: StateFlow<VerseDisplaySettings> = settingsRepository.settings
        .map { it.toVerseDisplaySettings() }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.Eagerly,
            initialValue = settingsRepository.settings.value.toVerseDisplaySettings()
        )

    /** Whole-song collapse (hidden-song state): when true, verses render collapsed to their first line. */
    private val _isCollapsed = MutableStateFlow(false)
    val isCollapsed: StateFlow<Boolean> = _isCollapsed.asStateFlow()

    /** Verse indices the reader has individually expanded while [isCollapsed] is true. */
    private val _expandedVerses = MutableStateFlow<Set<Int>>(emptySet())
    val expandedVerses: StateFlow<Set<Int>> = _expandedVerses.asStateFlow()

    init {
        viewModelScope.launch {
            _isLoading.value = true
            _song.value = songRepository.getSongByUid(songUid)
            _isLoading.value = false
        }
    }

    // -- "Aa" quick-picker option lists, derived from the loaded song --
    // (Per settings.md, the chosen script/language is a *global* setting not filtered by song; these
    //  lists just populate the convenience picker. The corpus is uniform, so they cover all scripts.)

    val availableScripts: List<NamedOption>
        get() {
            val present = _song.value?.verses?.flatMap { it.displayScripts }?.map { it.scriptCode }?.toSet()
                ?: return emptyList()
            return DisplayNames.nativeScriptOptions
                .filter { it.code in present }
                .map { NamedOption(it.code, it.label) }
        }

    val availableGlossLanguages: List<NamedOption>
        get() {
            val langs = _song.value?.verses?.flatMap { it.wordToWords }?.map { it.languageCode }
                ?: return emptyList()
            return langs.distinct().map { NamedOption(it, DisplayNames.languageLabel(it)) }
        }

    val hasTranslations: Boolean
        get() = _song.value?.verses?.any { it.translations.isNotEmpty() } == true

    // -- Quick-toggles: write through to the shared persisted settings --

    fun setPrimaryScript(scriptCode: String) = settingsRepository.setDisplayScript(scriptCode)

    fun setGlossLanguage(languageCode: String) = settingsRepository.setWordToWordLanguage(languageCode)

    fun toggleWordToWord() =
        settingsRepository.setShowWordToWord(!settingsRepository.settings.value.showWordToWord)

    fun toggleTranslation() =
        settingsRepository.setShowTranslation(!settingsRepository.settings.value.showTranslation)

    // -- Local, per-screen collapse state --

    fun toggleCollapsed() {
        val next = !_isCollapsed.value
        _isCollapsed.value = next
        if (!next) _expandedVerses.value = emptySet()
    }

    fun toggleVerseExpanded(index: Int) {
        _expandedVerses.update { current ->
            if (index in current) current - index else current + index
        }
    }

    companion object {
        /** Compose [androidx.lifecycle.viewmodel.compose.viewModel] factory injecting the nav uid. */
        fun factory(songUid: String) = viewModelFactory {
            initializer {
                val application = this[APPLICATION_KEY] as Application
                SongViewModel(application, songUid)
            }
        }
    }
}
