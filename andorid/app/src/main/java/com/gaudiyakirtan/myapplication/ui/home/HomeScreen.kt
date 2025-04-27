package com.gaudiyakirtan.myapplication.ui.home

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.background
import androidx.lifecycle.viewmodel.compose.viewModel
import com.gaudiyakirtan.myapplication.ui.components.SearchBar
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
    val searchQuery by viewModel.searchQuery.collectAsState()

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
        ) {
            // Add the search bar at the top
            SearchBar(
                searchText = searchQuery,
                onSearchTextChange = { viewModel.updateSearchQuery(it) },
                onSettingsClick = { viewModel.openSettings() },
                modifier = Modifier.padding(top = 8.dp)
            )
            
            // Main content with scroll
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(24.dp)
            ) {
                SongsSection(songs = songs.take(4))
                AuthorsSection(authors = authors)
                TopicsSection(topics = topics, songs = songs)
                BooksSection(books = books)
        
                // Featured Song Section - Exactly like iOS
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(4.dp),
                        modifier = Modifier.padding(top = 16.dp)
                    ) {
                        Text(
                            text = "Akrodha Paramānanda",
                            fontSize = 28.sp,
                            color = MaterialTheme.colorScheme.surfaceVariant, // Highlight color
                            textAlign = TextAlign.Center
                        )
                        
                        Text(
                            text = "Śrīla Locana Dāsa Ṭhākura",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Normal,
                            color = MaterialTheme.colorScheme.primary, // Primary text color
                            textAlign = TextAlign.Center
                        )
                    
                        Text(
                            text = "N9",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.tertiary,
                            modifier = Modifier
                                .clip(MaterialTheme.shapes.small)
                                .background(MaterialTheme.colorScheme.tertiary.copy(alpha = 0.25f))
                                .padding(horizontal = 10.dp, vertical = 2.dp)
                        )
                    }

                    // Verses
                    verses.forEach { verse ->
                        Box(modifier = Modifier.padding(vertical = 8.dp)) {
                            VerseView(verse = verse)
                        }
                    }
                }
                
                // Add padding at the bottom
                Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }
}