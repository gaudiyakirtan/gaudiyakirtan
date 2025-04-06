package com.gaudiyakirtan.myapplication.ui.home

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import com.gaudiyakirtan.data.SampleData
import com.gaudiyakirtan.myapplication.models.*

/**
 * ViewModel for the Home screen
 * Provides data for various sections of the Home screen
 */
class HomeViewModel : ViewModel() {
    private val _songs = MutableStateFlow<List<Song>>(emptyList())
    private val _authors = MutableStateFlow<List<Author>>(emptyList())
    private val _topics = MutableStateFlow<List<Topic>>(emptyList())
    private val _books = MutableStateFlow<List<Book>>(emptyList())
    private val _verses = MutableStateFlow<List<Verse>>(emptyList())

    val songs: StateFlow<List<Song>> = _songs
    val authors: StateFlow<List<Author>> = _authors
    val topics: StateFlow<List<Topic>> = _topics
    val books: StateFlow<List<Book>> = _books
    val verses: StateFlow<List<Verse>> = _verses

    init {
        loadData()
    }

    /**
     * Loads sample data into the view model from the SampleData object
     */
    private fun loadData() {
        _authors.value = SampleData.authors
        _topics.value = SampleData.topics
        _books.value = SampleData.books
        _songs.value = SampleData.songs
        _verses.value = SampleData.verses
    }
    
    /**
     * In a real app, this would fetch data from a repository
     */
    fun refreshData() {
        // In a production app, this would fetch fresh data from the repository
        loadData()
    }
}