package com.gaudiyakirtan.myapplication.ui.theme

import androidx.compose.ui.graphics.Color

// Light theme colors (Gaur)
val GaurPrimary = Color(0xFF1A1A1A)
val GaurSecondary = Color(0xFF3A3A3A)
val GaurTertiary = Color(0xFF1A1A1A)
val GaurAccent = Color(0xFFB36B00)
val GaurHighlight = Color(0xFFB36B00)
val GaurBackground = Color(0xFFFFF4E8)
val GaurBackgroundOffset = Color(0xFFF6E5D1)
val GaurBorder = Color(0xFFE6D7C3)
val GaurNeutral = Color(0xFF6E6E6E)

// Dark theme colors (Shyam)
val ShyamPrimary = Color(0xFFE0E0E0)
val ShyamSecondary = Color(0xFFB8B8B8)
val ShyamTertiary = Color(0xFF9B9B9B)
val ShyamAccent = Color(0xFF8CB4FF)
val ShyamHighlight = Color(0xFF8CB4FF)
val ShyamBackground = Color(0xFF191919)
val ShyamBackgroundOffset = Color(0xFF202020)
val ShyamBorder = Color(0xFF333333)
val ShyamNeutral = Color(0xFF9B9B9B)

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