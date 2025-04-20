package com.gaudiyakirtan.myapplication.ui.library

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import com.gaudiyakirtan.data.SampleData
import com.gaudiyakirtan.myapplication.models.Author
import com.gaudiyakirtan.myapplication.models.Book
import com.gaudiyakirtan.myapplication.models.Song
import com.gaudiyakirtan.myapplication.models.Topic
import com.gaudiyakirtan.myapplication.utils.StringUtils

/**
 * ViewModel for the Library screen
 * Manages data and state for different categories (Songs, Authors, Topics, Books)
 */
class LibraryViewModel : ViewModel() {
    
    // Categories
    enum class Category(val title: String) {
        SONGS("Songs"),
        AUTHORS("Authors"),
        TOPICS("Topics"),
        BOOKS("Books")
    }
    
    // State
    var selectedCategory by mutableStateOf(Category.SONGS)
        private set
    
    var searchText by mutableStateOf("")
        private set
    
    // Data
    val songs = SampleData.songs
    val authors = SampleData.authors
    val topics = SampleData.topics
    val books = SampleData.books
    
    // Filtered data based on search text
    val filteredSongs: List<Song>
        get() {
            return if (searchText.isEmpty()) {
                songs
            } else {
                songs.filter { song ->
                    song.title.contains(searchText, ignoreCase = true) ||
                    song.author.contains(searchText, ignoreCase = true) ||
                    song.tags.any { it.contains(searchText, ignoreCase = true) }
                }
            }
        }
    
    val filteredAuthors: List<Author>
        get() {
            return if (searchText.isEmpty()) {
                authors
            } else {
                authors.filter { it.name.contains(searchText, ignoreCase = true) }
            }
        }
    
    val filteredTopics: List<Topic>
        get() {
            return if (searchText.isEmpty()) {
                topics
            } else {
                topics.filter { it.name.contains(searchText, ignoreCase = true) }
            }
        }
    
    val filteredBooks: List<Book>
        get() {
            return if (searchText.isEmpty()) {
                books
            } else {
                books.filter { book ->
                    book.title.contains(searchText, ignoreCase = true) || 
                    book.author?.contains(searchText, ignoreCase = true) == true
                }
            }
        }
    
    // Creates a map of first letters to their positions for alphabetical scrolling
    fun createSectionMap(items: List<Any>, keySelector: (Any) -> String): Map<String, Int> {
        val result = mutableMapOf<String, Int>()
        val grouped = items.groupBy { StringUtils.firstNormalizedLetter(keySelector(it)) }
        
        var index = 0
        grouped.keys.sorted().forEach { letter ->
            result[letter] = index
            index += grouped[letter]?.size ?: 0
        }
        
        return result
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