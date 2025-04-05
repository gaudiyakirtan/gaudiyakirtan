import SwiftUI

struct BooksScrollView: View {
    let books: [Book]
    
    var body: some View {
        VStack(alignment: .leading) {
            Text("Books")
                .font(.title2)
                .fontWeight(.bold)
                .padding()
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    Spacer().frame(width: 6)
                    ForEach(books) { book in
                        BookCard(book: book)
                    }
                }
            }
        }
    }
}
