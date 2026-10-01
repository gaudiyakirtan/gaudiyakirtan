import SwiftUI

struct BooksScrollView: View {
    let books: [Book]
    let layout: HomeLayout

    var body: some View {
        HomeShelf(title: "Books", items: books, itemWidth: layout.bookWidth, layout: layout) { book in
            NavigationLink(destination: SongGroupSongsView(groupUid: book.uid, kind: .book, title: book.title)) {
                VStack(alignment: .leading, spacing: HomeSpacing.md) {
                    cover(book)
                        .frame(maxWidth: layout.bookWidth)
                        .frame(maxWidth: .infinity)
                    VStack(alignment: .leading, spacing: HomeSpacing.xs) {
                        Text(book.title)
                            .font(.subheadline.weight(.medium))
                            .foregroundStyle(Color.primaryText)
                        if let author = book.author {
                            Text(author)
                                .font(.subheadline)
                                .foregroundStyle(Color.secondaryText)
                        }
                        if let count = book.songCount {
                            Text(count == 1 ? "1 song" : "\(count) songs")
                                .font(.subheadline)
                                .foregroundStyle(Color.tertiaryText)
                        }
                    }
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.horizontal, HomeSpacing.md)
                    .padding(.bottom, HomeSpacing.md)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .accessibilityElement(children: .combine)
            }
            .buttonStyle(HomeControlStyle(cornerRadius: HomeShape.medium))
            .accessibilityIdentifier("home.book.\(book.uid)")
        }
    }

    private func cover(_ book: Book) -> some View {
        Color.clear
            .aspectRatio(3.0 / 4.0, contentMode: .fit)
            .overlay {
                AsyncImage(url: book.image.flatMap(URL.init(string:))) { phase in
                    if let image = phase.image {
                        image.resizable().scaledToFit()
                    } else {
                        // A quiet contained-cover fallback, including loading/failed requests.
                        ZStack {
                            Color.accent.opacity(0.08)
                            Image(systemName: "book.closed")
                                .font(.largeTitle)
                                .foregroundStyle(Color.accent)
                        }
                    }
                }
                .padding(HomeSpacing.md)
            }
            .accessibilityHidden(true)
    }
}
