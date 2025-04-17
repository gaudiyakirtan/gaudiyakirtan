package com.gaudiyakirtan.myapplication.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.vectorResource
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.R
import com.gaudiyakirtan.myapplication.ui.components.icons.MusicNote

/**
 * Search bar component with mridanga icon and settings button
 * Based on the iOS and web implementation
 */
@Composable
fun SearchBar(
    searchText: String,
    onSearchTextChange: (String) -> Unit,
    onSettingsClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Mridanga icon
        Box(
            modifier = Modifier
                .size(28.dp),
            contentAlignment = Alignment.Center
        ) {
            MusicNote(
                color = MaterialTheme.colorScheme.primary,
                size = 28.dp
            )
        }
        
        // Search field
        Box(
            modifier = Modifier
                .weight(1f)
                .height(40.dp)
                .clip(RoundedCornerShape(20.dp))
                .background(MaterialTheme.colorScheme.surface)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                BasicTextField(
                    value = searchText,
                    onValueChange = onSearchTextChange,
                    modifier = Modifier
                        .weight(1f)
                        .padding(vertical = 8.dp),
                    singleLine = true,
                    textStyle = MaterialTheme.typography.bodyMedium.copy(
                        color = MaterialTheme.colorScheme.onSurface
                    ),
                    decorationBox = { innerTextField ->
                        if (searchText.isEmpty()) {
                            Text(
                                text = "Search",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.tertiary
                            )
                        }
                        innerTextField()
                    }
                )
                
                // Clear button (only shows when text is not empty)
                if (searchText.isNotEmpty()) {
                    Box(
                        modifier = Modifier.size(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Clear,
                            contentDescription = "Clear search",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                            modifier = Modifier
                                .size(16.dp)
                                .clickable { onSearchTextChange("") }
                        )
                    }
                }
                
                // Search icon
                Icon(
                    imageVector = ImageVector.vectorResource(id = R.drawable.ic_search),
                    contentDescription = "Search",
                    tint = MaterialTheme.colorScheme.tertiary,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
        
        // Settings button
        Box(
            modifier = Modifier.size(28.dp),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = ImageVector.vectorResource(id = R.drawable.ic_settings),
                contentDescription = "Settings",
                tint = MaterialTheme.colorScheme.tertiary,
                modifier = Modifier
                    .size(24.dp)
                    .clickable { onSettingsClick() }
            )
        }
    }
}