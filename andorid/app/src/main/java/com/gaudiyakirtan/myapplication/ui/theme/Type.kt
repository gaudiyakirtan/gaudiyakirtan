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

/**
 * The expressive type scale (docs/screens/theme.md v2, "Typography").
 *
 * M3 Expressive asks for stronger *contrast* between roles than baseline M3 — headlines carry more
 * weight and size, labels get tighter and heavier — so that type participates in hierarchy
 * alongside color and shape rather than being uniformly mid-weight.
 *
 * Only the roles the app actually uses are overridden; everything else inherits the M3 baseline.
 * Body styles deliberately stay at normal weight and generous line height: they carry song text and
 * translations, which must remain comfortable to read for long stretches. Emphasis is spent on
 * headline/title/label, never on the reading surface.
 */
val Typography = Typography(
    // Headlines: the expressive end of the scale. Bold, tight-tracked.
    headlineMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 30.sp,
        lineHeight = 36.sp,
        letterSpacing = (-0.4).sp
    ),
    headlineSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 24.sp,
        lineHeight = 30.sp,
        letterSpacing = (-0.2).sp
    ),
    // Titles: section and row headings — semibold, one clear step below headline.
    titleLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.SemiBold,
        fontSize = 21.sp,
        lineHeight = 27.sp,
        letterSpacing = 0.sp
    ),
    titleMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.SemiBold,
        fontSize = 17.sp,
        lineHeight = 23.sp,
        letterSpacing = 0.1.sp
    ),
    titleSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.1.sp
    ),
    // Body: the reading surface. Normal weight, roomy leading — not an emphasis axis.
    bodyLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.5.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 21.sp,
        letterSpacing = 0.25.sp
    ),
    // Labels: metadata and controls — heavier and tighter so they read as UI, not prose.
    labelLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.SemiBold,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.1.sp
    ),
    labelMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.4.sp
    ),
    labelSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 11.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.5.sp
    )
)
