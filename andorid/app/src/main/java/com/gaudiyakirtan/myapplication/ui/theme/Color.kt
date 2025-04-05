package com.gaudiyakirtan.myapplication.ui.theme

import androidx.compose.ui.graphics.Color

val Purple80 = Color(0xFFD0BCFF)
val PurpleGrey80 = Color(0xFFCCC2DC)
val Pink80 = Color(0xFFEFB8C8)

val Purple40 = Color(0xFF6650a4)
val PurpleGrey40 = Color(0xFF625b71)
val Pink40 = Color(0xFF7D5260)

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

fun getMediaColor(media: String): Color {
    val colorIndex = media.length % mediaColors.size
    return mediaColors[colorIndex]
}