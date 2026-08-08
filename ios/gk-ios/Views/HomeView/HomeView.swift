import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    @EnvironmentObject private var readerSettings: ReaderSettings

    var body: some View {
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

                    // Search affordance → the dedicated Search screen (search.md: the Home search
                    // bar "navigates/expands into this screen" rather than filtering in place).
                    NavigationLink(destination: SearchView(autofocus: true)) {
                        SearchBarButton()
                    }
                    .buttonStyle(PlainButtonStyle())
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

                // No topic/book data ships in the current corpus (browse.md "Empty groupings") — on
                // this overview screen, hide the section entirely rather than show a header over
                // nothing; they light up automatically once song_groups.json ships real data.
                if !filteredTopics.isEmpty {
                    TopicsScrollView(topics: filteredTopics)
                        .padding(.vertical, 8)
                }

                if !filteredBooks.isEmpty {
                    BooksScrollView(books: filteredBooks)
                        .padding(.vertical, 8)
                }

                // Featured verse section
                if let featuredSong = viewModel.featuredSong {
                    VStack(alignment: .center) {
                        VStack(alignment: .center, spacing: 4) {
                            Text(featuredSong.title)
                                .font(.system(size: 28))
                                .foregroundColor(Color.highlight)

                            Text(featuredSong.author)
                                .fontWeight(.regular)
                                .foregroundColor(Color("primaryText"))

                            Text(featuredSong.uid)
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

                        ForEach(featuredSong.verses) { verse in
                            VerseView(
                                verse: verse,
                                options: readerSettings.verseOptions(
                                    languageOfOrigin: featuredSong.languageOfOrigin
                                )
                            )
                                .padding(.vertical)
                                .padding(.horizontal)
                        }
                    }
                    .padding(.bottom)
                }
            }
        }
        // Settings (docs/screens/settings.md v5). `ReaderSettings` is passed explicitly rather than
        // relied on from the environment: a `.sheet` doesn't reliably inherit environment objects.
        .sheet(isPresented: $viewModel.showSettings) {
            SettingsView(settings: readerSettings)
        }
    }

    // Filtered data based on search text
    var filteredSongs: [ManifestEntry] {
        if viewModel.searchText.isEmpty {
            return viewModel.songs
        } else {
            return viewModel.songs.filter { entry in
                entry.displayTitle.localizedCaseInsensitiveContains(viewModel.searchText) ||
                SongRepository.shared.authorDisplayName(forUid: entry.authorUid)
                    .localizedCaseInsensitiveContains(viewModel.searchText)
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
