import SwiftUI

struct LibraryView: View {
    @StateObject private var viewModel = LibraryViewModel()
    
    var body: some View {
        VStack(spacing: 16) {
            // Category selector
            CategorySelector(
                selection: $viewModel.selectedCategory,
                categories: LibraryViewModel.Category.allCases
            )
            .padding(.top, 8)
            
            // Search bar
            SearchBar(
                searchText: $viewModel.searchText,
                placeholder: viewModel.searchPlaceholder
            )
            .padding(.horizontal)
            
            // Content based on selected category
            switch viewModel.selectedCategory {
            case .songs:
                songsContent
                    .padding(.horizontal)
            case .authors:
                authorsContent
            case .topics:
                topicsContent
            case .books:
                booksContent
            }
            
            Spacer(minLength: 0)
        }
        .background(Color.background)
    }
    
    // MARK: - Category Content Views
    
    private var songsContent: some View {
        AlphabeticalScrollView(
            scrollTarget: $viewModel.scrollTarget,
            items: viewModel.filteredSongs,
            sectionKeyPath: \.title
        ) { song in
            SongListItem(song: song)
                .padding(.trailing, 32) // Increase padding to create more space between list and index
        }
    }
    
    private var authorsContent: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
            ForEach(viewModel.filteredAuthors) { author in
                AuthorCard(author: author)
            }
        }
        .padding(.horizontal)
    }
    
    private var topicsContent: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
            ForEach(viewModel.filteredTopics) { topic in
                // Count songs for this topic (matching by topic name to any tag)
                let songCount = viewModel.songs.filter { song in
                    song.tags.contains(where: { $0.lowercased() == topic.name.lowercased() })
                }.count
                
                TopicCard(
                    topic: topic,
                    songCount: songCount,
                    action: { /* Handle topic selection */ }
                )
            }
        }
        .padding(.horizontal)
    }
    
    private var booksContent: some View {
        ScrollView {
            LazyVGrid(
                columns: [
                    GridItem(.adaptive(minimum: 150, maximum: 160), spacing: 16)
                ],
                spacing: 16
            ) {
                ForEach(viewModel.filteredBooks) { book in
                    BookCard(book: book)
                        .frame(height: 192)
                }
            }
            .padding(.horizontal)
        }
    }
}

#Preview {
    LibraryView()
}