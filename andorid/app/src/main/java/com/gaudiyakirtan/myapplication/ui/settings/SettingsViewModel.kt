package com.gaudiyakirtan.myapplication.ui.settings

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import com.gaudiyakirtan.data.SettingsRepository
import com.gaudiyakirtan.myapplication.models.AppSettings
import com.gaudiyakirtan.myapplication.models.ThemePreference
import kotlinx.coroutines.flow.StateFlow

/**
 * ViewModel for the Settings screen (docs/screens/settings.md). A thin, reactive layer over the
 * shared [SettingsRepository]: it re-exposes the persisted [AppSettings] flow and forwards each
 * control's change straight to the repository, which writes through to storage immediately. Because
 * the same repository backs the song-detail quick-toggles, edits here are reflected there live.
 */
class SettingsViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = SettingsRepository.getInstance(application)

    val settings: StateFlow<AppSettings> = repository.settings

    fun setDisplayScript(scriptCode: String) = repository.setDisplayScript(scriptCode)
    fun setRomanStandard(standard: String) = repository.setRomanStandard(standard)
    fun setShowWordToWord(show: Boolean) = repository.setShowWordToWord(show)
    fun setWordToWordLanguage(languageCode: String) = repository.setWordToWordLanguage(languageCode)
    fun setShowTranslation(show: Boolean) = repository.setShowTranslation(show)
    fun setTranslationLanguage(languageCode: String) = repository.setTranslationLanguage(languageCode)
    fun setListLanguage(scriptCode: String) = repository.setListLanguage(scriptCode)
    fun setTheme(theme: ThemePreference) = repository.setTheme(theme)
}
