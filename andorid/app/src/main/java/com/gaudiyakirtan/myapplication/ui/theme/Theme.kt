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
    // The container ramp MUST be filled. Material components read these directly -- an unchecked
    // Switch track is `surfaceContainerHighest` -- and any slot left unset falls back to the M3
    // *baseline* palette (Neutral90 = #E6E0E9, a lilac gray) which would paint stock Material
    // colors onto the Gaura cream. Leaving them unset was the bug that removing the per-component
    // colors() overrides exposed.
    surfaceContainerLowest = GaurBackground,
    surfaceContainerLow = GaurBackground,
    surfaceContainer = GaurBackgroundOffset,
    surfaceContainerHigh = GaurBackgroundOffset,
    surfaceContainerHighest = GaurBackgroundOffset,
    surfaceDim = GaurBackgroundOffset,
    surfaceBright = GaurBackground,
    inverseSurface = GaurPrimary,
    inverseOnSurface = GaurBackground,
    // `outline` is Material's *higher-contrast* boundary role (control borders, an unchecked switch
    // thumb); `outlineVariant` is the subtle divider. Mapping `border` to both left the switch thumb
    // #E6D7C3 on an #F6E5D1 track -- effectively invisible. `neutral` is the token that actually
    // matches Material's intent for `outline`.
    outline = GaurNeutral,                   // #6E6E6E
    outlineVariant = GaurBorder              // #E6D7C3
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
    surfaceContainerLowest = ShyamBackground,
    surfaceContainerLow = ShyamBackground,
    surfaceContainer = ShyamBackgroundOffset,
    surfaceContainerHigh = ShyamBackgroundOffset,
    surfaceContainerHighest = ShyamBackgroundOffset,
    surfaceDim = ShyamBackground,
    surfaceBright = ShyamBackgroundOffset,
    inverseSurface = ShyamPrimary,
    inverseOnSurface = ShyamBackground,
    outline = ShyamNeutral,                  // #9B9B9B
    outlineVariant = ShyamBorder             // #333333
)

/**
 * The `neutral` semantic token (docs/theme/colors.md: #6E6E6E Gaura / #9B9B9B Shyam) for muted,
 * less-important text. Material's [ColorScheme] has no neutral slot, so it rides a CompositionLocal.
 */
val LocalNeutralColor = staticCompositionLocalOf { GaurNeutral }

/** Muted/less-important-text color for the active palette (docs/theme/colors.md `neutral`). */
val ColorScheme.neutral: Color
    @Composable @ReadOnlyComposable
    get() = LocalNeutralColor.current

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

    // Keep status-bar icon contrast in step with the active palette.
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    CompositionLocalProvider(LocalNeutralColor provides neutral) {
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
