package com.gaudiyakirtan.myapplication.ui.theme

import androidx.compose.ui.graphics.Color

// Light theme colors (Gaur) - Matching iOS color assets
val GaurPrimary = Color(0xFF1A1A1A)      // Match iOS "primary" - Dark text/selected items
val GaurSecondary = Color(0xFF3A3A3A)    // Secondary text
val GaurTertiary = Color(0xFF6E6E6E)     // Match iOS "neutral" - Less prominent text
val GaurAccent = Color(0xFFB36B00)       // Match iOS "highlight" - Accent color
val GaurHighlight = Color(0xFFB36B00)    // Match iOS "highlight" - Golden accent
val GaurBackground = Color(0xFFFFF4E8)   // Match iOS "background" - Warm cream
val GaurBackgroundOffset = Color(0xFFF6E5D1) // Match iOS "backgroundOffset" - Warm beige
val GaurBorder = Color(0xFFE6D7C3)       // Border color
val GaurNeutral = Color(0xFF6E6E6E)      // Match iOS "neutral" - Neutral text
val GaurOnHighlight = Color(0xFFFFFFFF)  // White text on highlight

// Dark theme colors (Shyam) - Matching iOS color assets
val ShyamPrimary = Color(0xFFE0E0E0)     // Match iOS "primary" (dark) - Light text/selected items
val ShyamSecondary = Color(0xFFB8B8B8)   // Secondary text
val ShyamTertiary = Color(0xFF9B9B9B)    // Match iOS "neutral" (dark) - Less prominent text
val ShyamAccent = Color(0xFF8CB4FF)      // Match iOS "highlight" (dark) - Accent color
val ShyamHighlight = Color(0xFF8CB4FF)   // Match iOS "highlight" (dark) - Blue accent 
val ShyamBackground = Color(0xFF191919)  // Match iOS "background" (dark) - Dark background
val ShyamBackgroundOffset = Color(0xFF202020) // Match iOS "backgroundOffset" (dark) - Darker background
val ShyamBorder = Color(0xFF4F4A40)      // Border color
val ShyamNeutral = Color(0xFF9B9B9B)     // Match iOS "neutral" (dark) - Neutral text
val ShyamOnHighlight = Color(0xFFFFFFFF) // White text on highlight

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