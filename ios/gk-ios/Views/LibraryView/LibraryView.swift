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
            
            // Library keeps its own per-category in-place filter (search.md Interactions: do NOT
            // hijack a Library bar that already does real per-category filtering). Only decorative
            // bars — the Home bar and the Search tab — route to the global Search screen.
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
        // Index keyed to the stable `sectionKey` (manifest `first_letter`), so titles can render in
        // any `listLanguage` without the A–Z sections reshuffling (docs/screens/songs-list.md).
        AlphabeticalScrollView(
            scrollTarget: $viewModel.scrollTarget,
            items: viewModel.filteredSongs,
            sectionKeyPath: \.sectionKey
        ) { entry in
            SongListItem(entry: entry)
                .padding(.trailing, 20) // Reduced padding for list items
        }
    }

    private var authorsContent: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
            ForEach(viewModel.filteredAuthors) { author in
                // Tap an author → their filtered song list (songs-list.md "Library (Author)").
                NavigationLink(destination: AuthorSongsView(authorUid: author.uid)) {
                    AuthorCard(author: author)
                }
                .buttonStyle(PlainButtonStyle())
            }
        }
        .padding(.horizontal)
    }
    
    private var topicsContent: some View {
        Group {
            // 74 real topics ship in song_groups.json, so this empty state now only shows for a
            // search that matches nothing (browse.md "Empty groupings" — never fake rows).
            if viewModel.filteredTopics.isEmpty {
                EmptyStateView(
                    systemImage: "tag",
                    title: "No topics yet",
                    message: "Topic groupings will appear here once they're added to the corpus."
                )
            } else {
                ScrollView {
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                        ForEach(viewModel.filteredTopics) { topic in
                            TopicCard(
                                topic: topic,
                                songCount: topic.songUids.isEmpty ? topic.demoSongCount : topic.songUids.count,
                                action: { /* Handle topic selection */ }
                            )
                        }
                    }
                    .padding(.horizontal)
                }
            }
        }
    }

    private var booksContent: some View {
        Group {
            // 19 real books ship in song_groups.json, so this empty state now only shows for a
            // search that matches nothing (browse.md "Empty groupings" — never fake rows).
            if viewModel.filteredBooks.isEmpty {
                EmptyStateView(
                    systemImage: "book.closed",
                    title: "No books yet",
                    message: "Books will appear here once they're added to the corpus."
                )
            } else {
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
    }
}

#Preview {
    LibraryView()
}