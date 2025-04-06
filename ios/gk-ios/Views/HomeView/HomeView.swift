import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    
    var body: some View {
        ScrollView {
            // Use custom spacing for different sections
            VStack(spacing: 0) {
                // Songs section with no bottom padding
                SongsGridView(songs: viewModel.songs)
                    .padding(.horizontal)
                    .padding(.top)
                    .padding(.bottom, 8) // Reduced padding between songs and authors
                
                // Other sections with consistent spacing
                AuthorsScrollView(authors: viewModel.authors)
                    .padding(.vertical, 8)
                
                TopicsScrollView(topics: viewModel.topics)
                    .padding(.vertical, 8)
                
                BooksScrollView(books: viewModel.books)
                    .padding(.vertical, 8)

                // Verse section
                VStack(alignment: .center) {
                    VStack(alignment: .center, spacing: 4) {
                        Text("Akrodha Paramānanda")
                            .font(.system(size: 28))
                            .foregroundColor(Color.highlight)
                        
                        Text("Śrīla Locana Dāsa Ṭhākura")
                            .fontWeight(.regular)
                            .foregroundColor(Color.primary)
                    
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
}
