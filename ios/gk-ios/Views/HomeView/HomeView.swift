import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                SongsGridView(songs: viewModel.songs)
                    .padding()
                AuthorsScrollView(authors: viewModel.authors)
                TopicsScrollView(topics: viewModel.topics)
                BooksScrollView(books: viewModel.books)

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

                       ForEach(viewModel.verses) { verse in
                           VerseView(verse: verse)
                               .padding(.vertical)
                       }
                   }
                   
            }
        }
    }
}
