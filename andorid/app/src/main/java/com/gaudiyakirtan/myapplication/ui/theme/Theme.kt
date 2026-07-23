package com.gaudiyakirtan.myapplication.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButtonColors
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.material3.SwitchColors
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

/**
 * Gaura (light) color scheme -- maps the docs/theme/colors.md semantic tokens onto Material scheme
 * slots EXACTLY as that spec's Compose example specifies. The brand accent (`highlight`) lives in
 * [ColorScheme.surfaceVariant]; the `neutral` token (muted text) has no Material slot and is provided
 * via [neutral] below.
 *
 * `onPrimary`/`onSecondary`/`onTertiary`/`onSurfaceVariant` all use [GaurOnHighlight] (never a
 * hardcoded `Color.White`/`Color.Black`) per the theme spec's "no hardcoded white/black on accent
 * surfaces" rule -- this is safe because `primary`/`secondary`/`tertiary`/`surfaceVariant` all flip
 * light/dark together with their `onHighlight` counterpart.
 */
private val LightColorScheme = lightColorScheme(
    primary = GaurPrimary,               // #1A1A1A
    onPrimary = GaurOnHighlight,
    secondary = GaurSecondary,           // #3A3A3A
    onSecondary = GaurOnHighlight,
    tertiary = GaurTertiary,             // #5A5A5A
    onTertiary = GaurOnHighlight,
    background = GaurBackground,          // #FFF4E8
    onBackground = GaurPrimary,           // #1A1A1A
    surface = GaurBackgroundOffset,       // #F6E5D1
    onSurface = GaurPrimary,              // #1A1A1A
    outline = GaurBorder,                 // #E6D7C3
    surfaceVariant = GaurHighlight,       // #B36B00 (accent)
    onSurfaceVariant = GaurOnHighlight    // #FFFFFF (onHighlight)
)

/** Shyam (dark) color scheme -- exact per docs/theme/colors.md. Same `onHighlight` rule as above. */
private val DarkColorScheme = darkColorScheme(
    primary = ShyamPrimary,              // #E0E0E0
    onPrimary = ShyamOnHighlight,
    secondary = ShyamSecondary,          // #B8B8B8
    onSecondary = ShyamOnHighlight,
    tertiary = ShyamTertiary,            // #9B9B9B
    onTertiary = ShyamOnHighlight,
    background = ShyamBackground,         // #191919
    onBackground = ShyamPrimary,          // #E0E0E0
    surface = ShyamBackgroundOffset,      // #202020
    onSurface = ShyamPrimary,             // #E0E0E0
    outline = ShyamBorder,                // #333333
    surfaceVariant = ShyamHighlight,      // #8CB4FF (accent)
    onSurfaceVariant = ShyamOnHighlight   // #1A1A1A (onHighlight)
)

/**
 * The `neutral` semantic token (docs/theme/colors.md: #6E6E6E Gaura / #9B9B9B Shyam) for muted,
 * less-important text. Material's [ColorScheme] has no neutral slot, so it is carried on this
 * CompositionLocal and exposed as [ColorScheme.neutral] for ergonomic
 * `MaterialTheme.colorScheme.neutral` access. Provided per active palette by [GaudiyaKirtanTheme].
 */
val LocalNeutralColor = staticCompositionLocalOf { GaurNeutral }

/** Muted/less-important-text color for the active palette (docs/theme/colors.md `neutral`). */
val ColorScheme.neutral: Color
    @Composable @ReadOnlyComposable
    get() = LocalNeutralColor.current

/**
 * Accent-tinted [SwitchColors] (docs/screens/theme.md "Interactive controls"): the checked/on state
 * must render in `highlight`/`accent` (`surfaceVariant`), not Material's default fallback to
 * `primary` -- which, under this token scheme, is the *text* color and renders gray/unfinished.
 * Every [androidx.compose.material3.Switch] in the app should pass `colors = accentSwitchColors()`.
 */
@Composable
fun accentSwitchColors(): SwitchColors = SwitchDefaults.colors(
    checkedThumbColor = MaterialTheme.colorScheme.onSurfaceVariant,
    checkedTrackColor = MaterialTheme.colorScheme.surfaceVariant,
    checkedBorderColor = Color.Transparent,
    checkedIconColor = MaterialTheme.colorScheme.surfaceVariant,
    uncheckedThumbColor = MaterialTheme.colorScheme.neutral,
    uncheckedTrackColor = MaterialTheme.colorScheme.surface,
    uncheckedBorderColor = MaterialTheme.colorScheme.outline
)

/**
 * Accent-tinted [RadioButtonColors] -- same rationale as [accentSwitchColors]: the selected state
 * must be `surfaceVariant` (accent), not the default `primary` (text color). Every
 * [androidx.compose.material3.RadioButton] in the app should pass `colors = accentRadioButtonColors()`.
 */
@Composable
fun accentRadioButtonColors(): RadioButtonColors = RadioButtonDefaults.colors(
    selectedColor = MaterialTheme.colorScheme.surfaceVariant,
    unselectedColor = MaterialTheme.colorScheme.outline
)

/**
 * Applies the Gaudiya Kirtan theme. The `theme` setting drives the choice upstream in MainActivity:
 * `gaura` → light (Gaura), `shyam` → dark (Shyam), `system` → device. Dynamic color is intentionally
 * NOT supported so the two named palettes are always the exact colors.md values.
 */
@Composable
fun GaudiyaKirtanTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val neutral = if (darkTheme) ShyamNeutral else GaurNeutral

    // Keep status-bar icon contrast in step with the active palette.
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    CompositionLocalProvider(LocalNeutralColor provides neutral) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = Typography,
            content = content
        )
    }
}

// For backward compatibility
@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    GaudiyaKirtanTheme(darkTheme = darkTheme, content = content)
}
