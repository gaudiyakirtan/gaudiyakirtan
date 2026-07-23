package com.gaudiyakirtan.myapplication.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.gaudiyakirtan.myapplication.R

/**
 * The brand display face (5th Avenue), matching web's `--font-display`.
 *
 * Branding only — the wordmark and the Home welcome heading. Deliberately NOT used for song text:
 * it is a decorative Latin script with no Indic coverage, so verses in Bengali/Devanagari must stay
 * on the system font. Ships Regular only, so never ask for a bold weight from it — Compose would
 * synthesize one and smear the script.
 *
 * (The resource is `fifth_avenue.ttf`, not `5thAvenue.ttf`: Android resource names must be
 * lowercase and cannot start with a digit.)
 */
val DisplayFontFamily = FontFamily(Font(R.font.fifth_avenue, FontWeight.Normal))

// Set of Material typography styles to start with
val Typography = Typography(
    bodyLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.5.sp
    )
    /* Other default text styles to override
    titleLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 22.sp,
        lineHeight = 28.sp,
        letterSpacing = 0.sp
    ),
    labelSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 11.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.5.sp
    )
    */
)