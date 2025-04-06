package com.gaudiyakirtan.myapplication.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

/**
 * Dark color scheme (Shyam) for the Gaudiya Kirtan application
 */
private val DarkColorScheme = darkColorScheme(
    primary = ShyamPrimary,
    onPrimary = Color.Black,
    secondary = ShyamSecondary,
    onSecondary = Color.Black,
    tertiary = ShyamTertiary,
    onTertiary = Color.Black,
    background = ShyamBackground,
    onBackground = ShyamPrimary,
    surface = ShyamBackgroundOffset,
    onSurface = ShyamPrimary,
    outline = ShyamBorder,
    surfaceVariant = ShyamHighlight,
    onSurfaceVariant = Color.Black
)

/**
 * Light color scheme (Gaur) for the Gaudiya Kirtan application
 */
private val LightColorScheme = lightColorScheme(
    primary = GaurPrimary,
    onPrimary = Color.White,
    secondary = GaurSecondary,
    onSecondary = Color.White,
    tertiary = GaurTertiary,
    onTertiary = Color.White,
    background = GaurBackground,
    onBackground = GaurPrimary,
    surface = GaurBackgroundOffset,
    onSurface = GaurPrimary,
    outline = GaurBorder,
    surfaceVariant = GaurHighlight,
    onSurfaceVariant = Color.White
)

/**
 * Applies the Gaudiya Kirtan theme to the application
 * Uses light (Gaur) and dark (Shyam) color schemes based on system settings or user preference
 */
@Composable
fun GaudiyaKirtanTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    // Dynamic color is available on Android 12+
    dynamicColor: Boolean = false, // Disabled by default to maintain consistent branding
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    // Apply status bar color
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
//            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}

// For backward compatibility
@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    GaudiyaKirtanTheme(
        darkTheme = darkTheme,
        dynamicColor = dynamicColor,
        content = content
    )
}