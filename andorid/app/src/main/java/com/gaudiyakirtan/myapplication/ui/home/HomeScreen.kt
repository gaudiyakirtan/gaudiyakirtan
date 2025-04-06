package com.gaudiyakirtan.myapplication.ui.home

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.gaudiyakirtan.myapplication.ui.components.VerseView
import com.gaudiyakirtan.myapplication.ui.sections.*

@Composable
fun HomeScreen(
    viewModel: HomeViewModel = viewModel()
) {
    val songs by viewModel.songs.collectAsState()
    val authors by viewModel.authors.collectAsState()
    val topics by viewModel.topics.collectAsState()
    val books by viewModel.books.collectAsState()
    val verses by viewModel.verses.collectAsState()

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            SongsSection(songs = songs)
            AuthorsSection(authors = authors)
            TopicsSection(topics = topics)
            BooksSection(books = books)
    
            // Current Song Section
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = "Featured Song",
                    style = MaterialTheme.typography.titleLarge,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                
                Text(
                    text = "Akrodha Paramānanda",
                    style = MaterialTheme.typography.headlineMedium,
                    color = MaterialTheme.colorScheme.primary
                )
    
                Text(
                    text = "Śrīla Locana Dāsa Ṭhākura",
                    style = MaterialTheme.typography.titleMedium
                )
    
                Surface(
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    shape = MaterialTheme.shapes.small
                ) {
                    Text(
                        text = "N9",
                        style = MaterialTheme.typography.labelSmall,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 2.dp)
                    )
                }
    
                verses.forEach { verse ->
                    VerseView(verse = verse)
                }
            }
            
            // Add padding at the bottom
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}