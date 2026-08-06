package com.gaudiyakirtan.myapplication.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.ExperimentalMaterial3ExpressiveApi
import androidx.compose.material3.MaterialExpressiveTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MotionScheme
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
 * Gaura (light) color scheme -- docs/screens/theme.md **v2**.
 *
 * ## The v2 remap
 *
 * v1 mapped the brand accent onto [ColorScheme.surfaceVariant] and the *primary text* color onto
 * [ColorScheme.primary]. That inverted Material's own semantics: every Material component treats
 * `primary` as the brand container color, so components rendered gray/unfinished by default and
 * each one needed a bespoke `colors()` override to look right (v1 shipped two such helpers, for
 * Switch and RadioButton).
 *
 * v2 puts each token in the Material slot that *means* that thing:
 * - `accent`/`highlight` -> [ColorScheme.primary] (+ `onHighlight` -> [ColorScheme.onPrimary])
 * - `backgroundOffset`   -> [ColorScheme.surface] and [ColorScheme.surfaceVariant] (card surfaces)
 * - primary text         -> [ColorScheme.onBackground] / [ColorScheme.onSurface]
 * - `border`             -> [ColorScheme.outline]
 *
 * The consequence is the point of the migration: expressive components are correct *by default*,
 * so the per-component color overrides are gone rather than multiplied.
 *
 * The repo's text-hierarchy tokens (`primary`/`secondary`/`tertiary` in docs/theme/colors.md are
 * text colors, not brand colors) have no Material slot once the accent takes `primary`. They are
 * carried as [ColorScheme] extensions below, the same mechanism v1 already used for `neutral`.
 */
private val LightColorScheme = lightColorScheme(
    primary = GaurAccent,                    // #B36B00 -- accent/highlight
    onPrimary = GaurOnHighlight,             // #FFFFFF
    primaryContainer = GaurAccent,
    onPrimaryContainer = GaurOnHighlight,
    secondary = GaurAccent,
    onSecondary = GaurOnHighlight,
    tertiary = GaurAccent,
    onTertiary = GaurOnHighlight,
    background = GaurBackground,             // #FFF4E8
    onBackground = GaurPrimary,              // #1A1A1A -- primary text
    surface = GaurBackgroundOffset,          // #F6E5D1 -- cards/offset surfaces
    onSurface = GaurPrimary,                 // #1A1A1A
    surfaceVariant = GaurBackgroundOffset,   // a real surface variant now, not the accent
    onSurfaceVariant = GaurSecondary,        // #3A3A3A -- secondary text on offset surfaces
    outline = GaurBorder,                    // #E6D7C3
    outlineVariant = GaurBorder
)

/** Shyam (dark) scheme -- same v2 remap, values per docs/theme/colors.md. */
private val DarkColorScheme = darkColorScheme(
    primary = ShyamAccent,                   // #8CB4FF
    onPrimary = ShyamOnHighlight,            // #1A1A1A
    primaryContainer = ShyamAccent,
    onPrimaryContainer = ShyamOnHighlight,
    secondary = ShyamAccent,
    onSecondary = ShyamOnHighlight,
    tertiary = ShyamAccent,
    onTertiary = ShyamOnHighlight,
    background = ShyamBackground,            // #191919
    onBackground = ShyamPrimary,             // #E0E0E0
    surface = ShyamBackgroundOffset,         // #202020
    onSurface = ShyamPrimary,                // #E0E0E0
    surfaceVariant = ShyamBackgroundOffset,
    onSurfaceVariant = ShyamSecondary,       // #B8B8B8
    outline = ShyamBorder,                   // #333333
    outlineVariant = ShyamBorder
)

/**
 * The `neutral` semantic token (docs/theme/colors.md: #6E6E6E Gaura / #9B9B9B Shyam) for muted,
 * less-important text. Material's [ColorScheme] has no neutral slot, so it rides a CompositionLocal.
 */
val LocalNeutralColor = staticCompositionLocalOf { GaurNeutral }

/**
 * The `tertiary` *text* token (#5A5A5A Gaura / #9B9B9B Shyam). Not to be confused with
 * [ColorScheme.tertiary], which after the v2 remap is a Material brand slot.
 */
val LocalTertiaryTextColor = staticCompositionLocalOf { GaurTertiary }

/** Muted/less-important-text color for the active palette (docs/theme/colors.md `neutral`). */
val ColorScheme.neutral: Color
    @Composable @ReadOnlyComposable
    get() = LocalNeutralColor.current

/** Tertiary *text* color for the active palette (docs/theme/colors.md `tertiary`). */
val ColorScheme.tertiaryText: Color
    @Composable @ReadOnlyComposable
    get() = LocalTertiaryTextColor.current

/**
 * Applies the Gaudiya Kirtan theme.
 *
 * Uses [MaterialExpressiveTheme] rather than [MaterialTheme]: it is the same M3 theme with an
 * expressive [MotionScheme] wired in, which is what gives components their physics-based (spatial /
 * effects) motion specs instead of the standard easing curves. Shape comes from [GaudiyaShapes].
 *
 * Dynamic color is still intentionally NOT supported, so the two named palettes are always the
 * exact colors.md values.
 */
@OptIn(ExperimentalMaterial3ExpressiveApi::class)
@Composable
fun GaudiyaKirtanTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val neutral = if (darkTheme) ShyamNeutral else GaurNeutral
    val tertiaryText = if (darkTheme) ShyamTertiary else GaurTertiary

    // Keep status-bar icon contrast in step with the active palette.
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    CompositionLocalProvider(
        LocalNeutralColor provides neutral,
        LocalTertiaryTextColor provides tertiaryText
    ) {
        MaterialExpressiveTheme(
            colorScheme = colorScheme,
            motionScheme = MotionScheme.expressive(),
            shapes = GaudiyaShapes,
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
