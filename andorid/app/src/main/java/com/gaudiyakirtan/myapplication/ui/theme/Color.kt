package com.gaudiyakirtan.myapplication.ui.theme

import androidx.compose.ui.graphics.Color

// Gaura (light) palette -- values are authoritative per docs/theme/colors.md.
val GaurPrimary = Color(0xFF1A1A1A)      // primary  -- primary text / important content
val GaurSecondary = Color(0xFF3A3A3A)    // secondary
val GaurTertiary = Color(0xFF5A5A5A)     // tertiary -- tertiary text/content (colors.md: corrected from #1A1A1A)
val GaurAccent = Color(0xFFB36B00)       // accent   -- interactive elements (gold)
val GaurHighlight = Color(0xFFB36B00)    // highlight -- links/important (gold)
val GaurBackground = Color(0xFFFFF4E8)   // background -- warm cream
val GaurBackgroundOffset = Color(0xFFF6E5D1) // backgroundOffset -- cards/UI surfaces
val GaurBorder = Color(0xFFE6D7C3)       // border
val GaurNeutral = Color(0xFF6E6E6E)      // neutral  -- muted/less-important text
val GaurOnHighlight = Color(0xFFFFFFFF)  // white text on highlight

// Shyam (dark) palette -- values are authoritative per docs/theme/colors.md.
val ShyamPrimary = Color(0xFFE0E0E0)     // primary
val ShyamSecondary = Color(0xFFB8B8B8)   // secondary
val ShyamTertiary = Color(0xFF9B9B9B)    // tertiary (colors.md: #9B9B9B)
val ShyamAccent = Color(0xFF8CB4FF)      // accent (blue)
val ShyamHighlight = Color(0xFF8CB4FF)   // highlight (blue)
val ShyamBackground = Color(0xFF191919)  // background
val ShyamBackgroundOffset = Color(0xFF202020) // backgroundOffset
val ShyamBorder = Color(0xFF333333)      // border (colors.md: #333333)
val ShyamNeutral = Color(0xFF9B9B9B)     // neutral
val ShyamOnHighlight = Color(0xFF1A1A1A) // near-black text on highlight (Shyam's accent is light blue)

// Media colors (used for identifying media items)
private val mediaColors = listOf(
    Color(0xFF1E3264),    // blue
    Color(0xFFBA5D07),    // orange
    Color(0xFF8D67AB),    // purple
    Color(0xFF148A08),    // green
    Color(0xFFD84000),    // red-orange
    Color(0xFF503750),    // dark-purple
    Color(0xFF006450),    // dark-green
    Color(0xFFE91429),    // red
    Color(0xFF537AA1),    // light-blue
    Color(0xFF2D46B9),    // royal-blue
    Color(0xFF777777)     // gray
)

/**
 * Gets a consistent color for a given string, matching iOS and web implementations
 */
fun getMediaColor(input: String): Color {
    val colorIndex = input.length % mediaColors.size
    return mediaColors[colorIndex]
}

/**
 * Parses a `SongGroup.color` hex string (docs/data/collections.md, e.g. `"#B36B00"`) into a Compose
 * [Color]. Returns `null` for a missing/malformed value so callers fall back to [getMediaColor]
 * rather than crashing -- `color` is documented as optional (`no`) on `SongGroup`.
 */
fun parseHexColor(hex: String?): Color? {
    if (hex.isNullOrBlank()) return null
    return try {
        Color(android.graphics.Color.parseColor(hex))
    } catch (e: IllegalArgumentException) {
        null
    }
}