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
            ScrollView {
                VStack(spacing: 16) {
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
                }
                .padding(.bottom, 16)
            }
            
            Spacer()
        }
        .background(Color.background)
    }
    
    // MARK: - Category Content Views
    
    private var songsContent: some View {
        VStack(spacing: 16) {
            ForEach(viewModel.filteredSongs) { song in
                SongListItem(song: song)
            }
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
                TopicCard(topic: topic)
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