import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    
    var body: some View {
        ZStack {
            Color.background.edgesIgnoringSafeArea(.all)
            ScrollView {
            // Use custom spacing for different sections
            VStack(spacing: 0) {
                // Header with mridanga icon, search bar, and settings button
                HStack(spacing: 12) {
                    // Mridanga SVG icon
                    Image("mridanga")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 28, height: 28)
                        .foregroundColor(Color("highlight"))
                    
                    // Search bar
                    SearchBar(searchText: $viewModel.searchText)
                        .frame(maxWidth: .infinity)
                    
                    // Settings button
                    Button(action: {
                        viewModel.showSettings = true
                    }) {
                        Image(systemName: "gearshape.fill")
                            .foregroundColor(Color.neutral)
                            .font(.system(size: 20))
                    }
                }
                .padding(.horizontal)
                .padding(.top, 8)
                .padding(.bottom, 12)
                
                // Songs section with no bottom padding
                SongsGridView(songs: filteredSongs)
                    .padding(.horizontal)
                    .padding(.bottom, 8) // Reduced padding between songs and authors
                
                // Other sections with consistent spacing
                AuthorsScrollView(authors: filteredAuthors)
                    .padding(.vertical, 8)
                
                TopicsScrollView(topics: filteredTopics, songs: viewModel.songs)
                    .padding(.vertical, 8)
                
                BooksScrollView(books: filteredBooks)
                    .padding(.vertical, 8)

                // Verse section
                VStack(alignment: .center) {
                    VStack(alignment: .center, spacing: 4) {
                        Text("Akrodha Paramānanda")
                            .font(.system(size: 28))
                            .foregroundColor(Color.highlight)
                        
                        Text("Śrīla Locana Dāsa Ṭhākura")
                            .fontWeight(.regular)
                            .foregroundColor(Color("primaryText"))
                    
                        Text("N9")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(Color.neutral)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 2)
                            .background(Color.neutral.opacity(0.25))
                            .cornerRadius(11)
                            .lineLimit(1)
                            .fixedSize()
                    }
                    .padding(.top, 16)

                    ForEach(viewModel.verses) { verse in
                        VerseView(verse: verse)
                            .padding(.vertical)
                    }
                }
                .padding(.bottom)
            }
        }
        }
        .sheet(isPresented: $viewModel.showSettings) {
            SettingsSheet(isPresented: $viewModel.showSettings)
        }
    }
    
    // Filtered data based on search text
    var filteredSongs: [Song] {
        if viewModel.searchText.isEmpty {
            return viewModel.songs
        } else {
            return viewModel.songs.filter { song in
                song.title.localizedCaseInsensitiveContains(viewModel.searchText) ||
                song.author.localizedCaseInsensitiveContains(viewModel.searchText) ||
                song.tags.contains { $0.localizedCaseInsensitiveContains(viewModel.searchText) }
            }
        }
    }
    
    var filteredAuthors: [Author] {
        if viewModel.searchText.isEmpty {
            return viewModel.authors
        } else {
            return viewModel.authors.filter { author in
                author.name.localizedCaseInsensitiveContains(viewModel.searchText)
            }
        }
    }
    
    var filteredTopics: [Topic] {
        if viewModel.searchText.isEmpty {
            return viewModel.topics
        } else {
            return viewModel.topics.filter { topic in
                topic.name.localizedCaseInsensitiveContains(viewModel.searchText)
            }
        }
    }
    
    var filteredBooks: [Book] {
        if viewModel.searchText.isEmpty {
            return viewModel.books
        } else {
            return viewModel.books.filter { book in
                book.title.localizedCaseInsensitiveContains(viewModel.searchText) ||
                (book.author?.localizedCaseInsensitiveContains(viewModel.searchText) ?? false)
            }
        }
    }
}
