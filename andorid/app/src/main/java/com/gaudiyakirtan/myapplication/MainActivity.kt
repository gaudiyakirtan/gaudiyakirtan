package com.gaudiyakirtan.myapplication

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.gaudiyakirtan.data.SettingsRepository
import com.gaudiyakirtan.myapplication.models.ThemePreference
import com.gaudiyakirtan.myapplication.ui.theme.GaudiyaKirtanTheme
import com.gaudiyakirtan.navigation.AppNavigation

/**
 * Main entry point for the Gaudiya Kirtan Android application.
 * Reads the persisted `theme` setting (docs/screens/settings.md) and drives the existing
 * light (Gaura) / dark (Shyam) Material scheme; a change on the Settings screen repaints the app.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val settings by SettingsRepository.getInstance(this).settings.collectAsState()
            val darkTheme = when (settings.theme) {
                ThemePreference.GAURA -> false
                ThemePreference.SHYAM -> true
                ThemePreference.SYSTEM -> isSystemInDarkTheme()
            }
            GaudiyaKirtanTheme(darkTheme = darkTheme) {
                AppNavigation()
            }
        }
    }
}
