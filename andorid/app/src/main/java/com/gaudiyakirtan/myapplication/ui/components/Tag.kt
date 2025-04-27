package com.gaudiyakirtan.myapplication.ui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gaudiyakirtan.myapplication.ui.theme.GaurNeutral
import com.gaudiyakirtan.myapplication.ui.theme.ShyamNeutral

/**
 * Tag component for consistent badge/tag/pill styling across the application
 *
 * @param text Text to display inside the tag
 * @param variant Color variant of the tag (default, highlight, primary, black)
 * @param size Size variant of the tag (small or normal)
 * @param uppercase Whether to display the text in uppercase
 * @param onClick Optional click handler
 * @param modifier Optional modifier for additional styling
 */
@Composable
fun Tag(
    text: String,
    variant: TagVariant = TagVariant.Default,
    size: TagSize = TagSize.Normal,
    uppercase: Boolean = false,
    onClick: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    // Get colors based on variant
    val backgroundColor: Color
    val textColor: Color
    
    when (variant) {
        TagVariant.Default -> {
            val neutralColor = MaterialTheme.colorScheme.tertiary
            backgroundColor = neutralColor.copy(alpha = 0.2f)
            textColor = neutralColor
        }
        TagVariant.Highlight -> {
            val highlightColor = MaterialTheme.colorScheme.surfaceVariant
            backgroundColor = highlightColor.copy(alpha = 0.8f)
            textColor = Color.White
        }
        TagVariant.Primary -> {
            val primaryColor = MaterialTheme.colorScheme.primary
            backgroundColor = primaryColor.copy(alpha = 0.2f)
            textColor = primaryColor
        }
        TagVariant.Black -> {
            backgroundColor = Color.Black.copy(alpha = 0.3f)
            textColor = Color.White
        }
    }
    
    // Get size properties based on the TagSize
    val fontSize = when (size) {
        TagSize.Small -> 10.sp
        TagSize.Normal -> 12.sp
    }
    
    val cornerRadius = when (size) {
        TagSize.Small -> 11.dp
        TagSize.Normal -> 10.dp
    }
    
    val horizontalPadding = 10.dp
    val verticalPadding = 1.dp
    
    // Apply the tag styling
    Surface(
        color = backgroundColor,
        shape = RoundedCornerShape(cornerRadius),
        onClick = onClick ?: {},
        enabled = onClick != null,
        modifier = modifier
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier.padding(horizontal = horizontalPadding, vertical = verticalPadding)
        ) {
            Text(
                text = if (uppercase) text.uppercase() else text,
                fontSize = fontSize,
                fontWeight = FontWeight.Medium,
                color = textColor,
                textAlign = TextAlign.Center,
                maxLines = 1
            )
        }
    }
}

enum class TagVariant {
    Default, Highlight, Primary, Black
}

enum class TagSize {
    Small, Normal
}
