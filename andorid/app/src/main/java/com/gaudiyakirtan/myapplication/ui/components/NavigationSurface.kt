package com.gaudiyakirtan.myapplication.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.layout.sizeIn
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.drawOutline
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.translate
import androidx.compose.ui.unit.dp

/**
 * Stock Material indication owns press/release/hover under MaterialTheme.motionScheme. Targets
 * never scale or move. The additional focus outline appears instantly, also with animations off.
 * Owners leave 4dp of scrollable space around the target so its outline remains visible.
 */
@Composable
fun NavigationSurface(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    shape: Shape = MaterialTheme.shapes.medium,
    border: BorderStroke? = null,
    content: @Composable () -> Unit
) {
    val interactions = remember { MutableInteractionSource() }
    val focused by interactions.collectIsFocusedAsState()
    val focusColor = MaterialTheme.colorScheme.primary
    Surface(
        onClick = onClick,
        modifier = modifier.sizeIn(minWidth = 48.dp, minHeight = 48.dp).drawWithContent {
            drawContent()
            if (focused) {
                // 2dp stroke separated from the target by 2dp of its owning surface.
                val outset = 3.dp.toPx()
                val outline = shape.createOutline(
                    Size(size.width + outset * 2, size.height + outset * 2), layoutDirection, this
                )
                translate(-outset, -outset) {
                    drawOutline(outline, focusColor, style = Stroke(2.dp.toPx()))
                }
            }
        },
        shape = shape,
        color = MaterialTheme.colorScheme.surface,
        contentColor = MaterialTheme.colorScheme.onSurface,
        border = border,
        interactionSource = interactions,
        content = content
    )
}
