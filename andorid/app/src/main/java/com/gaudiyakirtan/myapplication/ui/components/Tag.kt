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
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gaudiyakirtan.myapplication.ui.theme.GaurNeutral
import com.gaudiyakirtan.myapplication.ui.theme.ShyamNeutral

enum class TagVariant {
    Default, Highlight, Primary, Black, Custom
}

enum class TagSize {
    Small, Normal, Custom
}

/**
 * Tag component for consistent badge/tag/pill styling across the application
 *
 * @param text Text to display inside the tag
 * @param variant Color variant of the tag (default, highlight, primary, black, custom)
 * @param size Size variant of the tag (small, normal, custom)
 * @param uppercase Whether to display the text in uppercase
 * @param customBackgroundColor Optional custom background color (only used with TagVariant.Custom)
 * @param customTextColor Optional custom text color (only used with TagVariant.Custom)
 * @param customFontSize Optional custom font size (only used with TagSize.Custom)
 * @param customCornerRadius Optional custom corner radius (overrides default from size)
 * @param customHorizontalPadding Optional custom horizontal padding
 * @param customVerticalPadding Optional custom vertical padding
 * @param onClick Optional click handler
 * @param modifier Optional modifier for additional styling
 */
@Composable
fun Tag(
    text: String,
    variant: TagVariant = TagVariant.Default,
    size: TagSize = TagSize.Normal,
    uppercase: Boolean = false,
    customBackgroundColor: Color? = null,
    customTextColor: Color? = null,
    customFontSize: Dp? = null,
    customCornerRadius: Dp? = null,
    customHorizontalPadding: Dp? = null,
    customVerticalPadding: Dp? = null,
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
        TagVariant.Custom -> {
            backgroundColor = customBackgroundColor ?: Color.Gray.copy(alpha = 0.2f)
            textColor = customTextColor ?: Color.Gray
        }
    }
    
    // Get size properties based on the TagSize
    val fontSize = when (size) {
        TagSize.Small -> 10.sp
        TagSize.Normal -> 12.sp
        TagSize.Custom -> customFontSize?.let { it.value.sp } ?: 12.sp
    }
    
    val cornerRadius = customCornerRadius ?: when (size) {
        TagSize.Small -> 11.dp
        TagSize.Normal -> 10.dp
        TagSize.Custom -> 10.dp
    }
    
    val horizontalPadding = customHorizontalPadding ?: 10.dp
    val verticalPadding = customVerticalPadding ?: 1.dp
    
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

/**
 * Container for organizing multiple tags with consistent spacing
 *
 * @param content The tag content to display
 * @param modifier Optional modifier for styling
 * @param horizontal Whether to display tags horizontally or vertically
 * @param spacing Space between tags
 * @param wrap Whether to wrap tags to the next line (only applies when horizontal=true)
 */
@Composable
fun TagsContainer(
    content: @Composable () -> Unit,
    modifier: Modifier = Modifier,
    horizontal: Boolean = true,
    spacing: Dp = 4.dp,
    wrap: Boolean = true
) {
    // Implementation would use either a Row or Column with appropriate spacers
    // and Modifier.wrapContentSize() if wrap is true
    if (horizontal) {
        androidx.compose.foundation.layout.Row(
            modifier = modifier,
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(spacing)
        ) {
            content()
        }
    } else {
        androidx.compose.foundation.layout.Column(
            modifier = modifier,
            horizontalAlignment = Alignment.Start,
            verticalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(spacing)
        ) {
            content()
        }
    }
}