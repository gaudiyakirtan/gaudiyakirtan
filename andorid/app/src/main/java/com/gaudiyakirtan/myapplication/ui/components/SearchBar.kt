package com.gaudiyakirtan.myapplication.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.interaction.*
import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.vectorResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.R
import com.gaudiyakirtan.myapplication.ui.theme.Spacing

/** Home search and settings destinations. The decorative brand mark belongs to the page heading. */
@OptIn(ExperimentalMaterial3ExpressiveApi::class)
@Composable
fun SearchBar(
    searchText: String,
    onSearchTextChange: (String) -> Unit,
    onSettingsClick: () -> Unit,
    modifier: Modifier = Modifier,
    onSearchClick: (() -> Unit)? = null
) {
    Row(modifier.fillMaxWidth().padding(vertical = Spacing.sm),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(Spacing.md)) {
        if (onSearchClick != null) {
            val interactions = remember { MutableInteractionSource() }
            val focused by interactions.collectIsFocusedAsState()
            val pressed by interactions.collectIsPressedAsState()
            val hovered by interactions.collectIsHoveredAsState()
            val ink by animateColorAsState(
                if (focused || pressed || hovered) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant,
                MaterialTheme.motionScheme.fastEffectsSpec(), label = "search-ink")
            NavigationSurface(onSearchClick,
                Modifier.weight(1f).heightIn(min = 48.dp).semantics { contentDescription = "Search" },
                shape = MaterialTheme.shapes.small, interactionSource = interactions) {
                Row(Modifier.padding(horizontal = Spacing.md, vertical = Spacing.md),
                    verticalAlignment = Alignment.CenterVertically) {
                    Text("Search", Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Icon(ImageVector.vectorResource(R.drawable.ic_search), null, Modifier.size(24.dp),
                        tint = ink)
                }
            }
        } else {
            BasicTextField(searchText, onSearchTextChange,
                modifier = Modifier.weight(1f).heightIn(min = 48.dp)
                    .semantics { contentDescription = "Search" },
                textStyle = MaterialTheme.typography.bodyLarge.copy(color = MaterialTheme.colorScheme.onSurface),
                singleLine = true)
            if (searchText.isNotEmpty()) {
                IconButton(onClick = { onSearchTextChange("") }, modifier = Modifier.size(48.dp)) {
                    Icon(Icons.Default.Clear, "Clear search")
                }
            }
        }
        NavigationSurface(onSettingsClick,
            Modifier.size(48.dp).semantics { contentDescription = "Settings" },
            shape = MaterialTheme.shapes.small) {
            Box(contentAlignment = Alignment.Center) {
                Icon(ImageVector.vectorResource(R.drawable.ic_settings), null, Modifier.size(24.dp),
                    tint = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}
