package com.gaudiyakirtan.myapplication.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

/**
 * The expressive shape scale (docs/screens/theme.md v2, "Shape").
 *
 * Before the expressive migration the app carried eight ad-hoc corner radii -- 4, 8, 10, 11, 12,
 * 16, 20 and 22.dp -- several of which (11, 22) were plainly accidents rather than decisions.
 * Shape is one of the axes M3 Expressive uses to carry hierarchy, so it has to be a scale with
 * named steps, not a set of one-off numbers.
 *
 * The mapping from the old radii:
 * - 4 -> [Shapes.extraSmall]  (tags, chips, small indicators)
 * - 8, 10, 11 -> [Shapes.small]  (list rows, compact cards)
 * - 12, 16 -> [Shapes.medium]  (standard cards -- the app's default container)
 * - 20, 22 -> [Shapes.large]  (sheets, prominent cards)
 *
 * `largeIncreased` / `extraLargeIncreased` are the expressive additions: they exist so a *selected*
 * or *active* container can step up one level without inventing a radius. Use them only for that.
 */
val GaudiyaShapes = Shapes(
    extraSmall = RoundedCornerShape(4.dp),
    small = RoundedCornerShape(10.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(22.dp),
    largeIncreased = RoundedCornerShape(28.dp),
    extraLarge = RoundedCornerShape(32.dp),
    extraLargeIncreased = RoundedCornerShape(40.dp)
)
