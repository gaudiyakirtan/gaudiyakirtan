package com.gaudiyakirtan.myapplication.ui.collections

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.gaudiyakirtan.myapplication.ui.components.CategorySelector
import com.gaudiyakirtan.myapplication.ui.components.CollectionCard
import com.gaudiyakirtan.myapplication.ui.components.LibrarySearchBar

/**
 * Collections screen with categories for Bookmarks and Playlists
 * Reuses CategorySelector and search components from the Library screen
 */
@Composable
fun CollectionsScreen(
    viewModel: CollectionsViewModel = viewModel()
) {
    val categories = remember { CollectionsViewModel.Category.values().toList() }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Category selector (moved to top)
        CategorySelector(
            categories = categories,
            selectedCategory = viewModel.selectedCategory,
            onCategorySelected = { viewModel.setCategory(it) },
            categoryToString = { it.title },
            modifier = Modifier.padding(top = 8.dp)
        )
        
        // Search bar
        LibrarySearchBar(
            searchText = viewModel.searchText,
            onSearchTextChange = { viewModel.updateSearchText(it) },
            placeholder = viewModel.getSearchPlaceholder(),
            modifier = Modifier.padding(16.dp)
        )
        
        // Collections grid
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            contentPadding = PaddingValues(16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(viewModel.filteredCollections) { collection ->
                // Count songs in this collection
                val songCount = collection.songIds.size
                
                CollectionCard(
                    collection = collection,
                    songCount = songCount,
                    onClick = { /* Handle collection selection */ }
                )
            }
        }
    }
}