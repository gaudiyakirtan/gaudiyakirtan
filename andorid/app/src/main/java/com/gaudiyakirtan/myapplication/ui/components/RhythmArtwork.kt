package com.gaudiyakirtan.myapplication.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.scale
import androidx.compose.ui.semantics.clearAndSetSemantics

/**
 * Home's offline, silent vector master (components v7), in a 360 × 240 coordinate space.
 * Canvas is needed only for these paths; the surrounding composition uses ordinary surfaces.
 * No clock, audio state, pointer input or image loader participates in this drawing.
 */
@Composable
fun RhythmArtwork(modifier: Modifier = Modifier) {
    val colors = MaterialTheme.colorScheme
    // Fixed master geometry: build the paths once, not on every draw pass.
    val curveA = remember { Path().apply { moveTo(24f, 76f); cubicTo(116f, 12f, 240f, 16f, 338f, 90f) } }
    val curveB = remember { Path().apply { moveTo(12f, 112f); cubicTo(124f, 48f, 252f, 64f, 356f, 140f) } }
    Canvas(modifier.aspectRatio(3f / 2f).clipToBounds().clearAndSetSemantics { }) {
        drawRect(colors.surface)
        scale(size.width / 360f, size.height / 240f, pivot = Offset.Zero) {
            drawPath(
                curveA,
                colors.primary.copy(alpha = 0.18f),
                style = Stroke(width = 28f, cap = StrokeCap.Round)
            )
            drawPath(
                curveB,
                colors.onSurface.copy(alpha = 0.08f),
                style = Stroke(width = 18f, cap = StrokeCap.Round)
            )
            listOf(48f, 76f, 112f, 168f, 196f, 252f).forEach { x ->
                drawRoundRect(
                    colors.primary.copy(alpha = 0.55f),
                    topLeft = Offset(x, 180f),
                    size = Size(8f, 24f),
                    cornerRadius = CornerRadius(4f)
                )
            }
        }
    }
}
