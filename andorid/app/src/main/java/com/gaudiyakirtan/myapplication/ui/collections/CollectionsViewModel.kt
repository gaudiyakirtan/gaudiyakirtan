package com.gaudiyakirtan.myapplication.ui.collections

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import com.gaudiyakirtan.myapplication.models.Collection
import com.gaudiyakirtan.myapplication.models.CollectionType

/**
 * ViewModel for the Collections screen
 * Manages collections data and state for different collection types
 *
 * NOTE: user bookmarks/playlists are a mobile-only concept, not part of the docs/data canon (see
 * docs/data/collections.md's platform note: mobile "Library / Collections" reconciliation with the
 * canonical SongGroup model is tracked on the roadmap, not specced yet). There is also no local
 * persistence layer for user collections yet, so this starts empty rather than the old hardcoded
 * sample bookmarks/playlists (which referenced song uids that don't all exist in the real corpus).
 */
class CollectionsViewModel : ViewModel() {
    
    // State
    var selectedCategory by mutableStateOf(Category.BOOKMARKS)
        private set
    
    var searchText by mutableStateOf("")
        private set
    
    // Categories of collections
    enum class Category(val title: String) {
        BOOKMARKS("Bookmarks"),
        PLAYLISTS("Playlists")
    }
    
    // Data (no local persistence layer yet -- see class doc comment)
    val collections: List<Collection> = emptyList()
    
    // Filtered collections based on category and search text
    val filteredCollections: List<Collection>
        get() {
            val typeFilter = when (selectedCategory) {
                Category.BOOKMARKS -> CollectionType.BOOKMARK
                Category.PLAYLISTS -> CollectionType.PLAYLIST
            }
            
            val categoryFiltered = collections.filter { it.type == typeFilter }
            
            return if (searchText.isEmpty()) {
                categoryFiltered
            } else {
                categoryFiltered.filter { collection ->
                    collection.name.contains(searchText, ignoreCase = true)
                }
            }
        }
    
    // State changing methods
    fun setCategory(category: Category) {
        selectedCategory = category
    }
    
    fun updateSearchText(text: String) {
        searchText = text
    }
    
    // Helper for getting the appropriate search placeholder
    fun getSearchPlaceholder(): String {
        return "Search ${selectedCategory.title}"
    }
}