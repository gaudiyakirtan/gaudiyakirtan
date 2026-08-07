package com.gaudiyakirtan.myapplication.ui.theme

import androidx.compose.ui.unit.dp

/**
 * The spacing scale (docs/screens/theme.md v2, "Spacing").
 *
 * Material lays out on a **4dp grid**, and spacing is a hierarchy signal in exactly the way shape
 * and type are: the gap between two things says how related they are. Before this the app mixed
 * grid values (4/8/12/16/24/32/48) with off-grid one-offs (6, 10, 18, 22, 44), which produced
 * rhythms that read as accidental — a 10dp gap next to a 12dp gap is noise, not hierarchy.
 *
 * Use these names, not raw `dp`, for **spacing**: padding, `Arrangement.spacedBy`, and `Spacer`.
 * They are deliberately *not* for sizes — an icon's `size(24.dp)` or a stroke width is a dimension,
 * not a rhythm, and forcing it through this scale would be false precision.
 *
 * | Token | Value | Use |
 * |---|---|---|
 * | [xxs] | 2 | hairline separation inside a control |
 * | [xs] | 4 | tight pairs — a label and its chip |
 * | [sm] | 8 | related items in a row |
 * | [md] | 12 | list-row internals |
 * | [lg] | 16 | the default — screen gutters, card padding, between rows |
 * | [xl] | 24 | between groups of content |
 * | [xxl] | 32 | between major sections |
 * | [xxxl] | 48 | around a lone focal element (empty/error states) |
 */
object Spacing {
    val xxs = 2.dp
    val xs = 4.dp
    val sm = 8.dp
    val md = 12.dp
    val lg = 16.dp
    val xl = 24.dp
    val xxl = 32.dp
    val xxxl = 48.dp
}
