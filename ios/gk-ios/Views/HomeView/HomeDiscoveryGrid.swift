import SwiftUI
import UIKit

struct HomeBooksCard: View {
    let books: [Book]
    let layout: HomeLayout

    var body: some View {
        HomeModule(title: "Books", identifier: "home.books") {
            HomeCard {
                VStack(alignment: .leading, spacing: 24) {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("A library made for singing")
                            .font(.brandDisplay(size: 32, relativeTo: .largeTitle))
                            .foregroundStyle(HomePalette.ink)
                            .accessibilityAddTraits(.isHeader)
                        Text("Open a songbook and follow its original sequence.")
                            .font(.subheadline)
                            .foregroundStyle(HomePalette.muted)
                    }
                    .fixedSize(horizontal: false, vertical: true)

                    if layout.verticalShelves {
                        VStack(alignment: .leading, spacing: 24) {
                            ForEach(books) { book in bookLink(book, aspect: 3.0 / 4.0) }
                        }
                    } else {
                        // Two unequal stacks echo Web's cover collage, with captions outside art.
                        HStack(alignment: .top, spacing: 16) {
                            VStack(spacing: 20) {
                                ForEach(Array(books.prefix(2).enumerated()), id: \.element.id) { index, book in
                                    bookLink(book, aspect: index == 0 ? 0.75 : 1.15)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            VStack(spacing: 20) {
                                ForEach(Array(books.dropFirst(2).enumerated()), id: \.element.id) { index, book in
                                    bookLink(book, aspect: index == 0 ? 1.15 : 0.75)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.top, 24)
                        }
                    }
                    HomeBrowseLink(title: "Browse all books", category: .books)
                }
            }
        }
    }

    private func bookLink(_ book: Book, aspect: CGFloat) -> some View {
        NavigationLink(destination: SongGroupSongsView(groupUid: book.uid, kind: .book, title: book.title)) {
            VStack(alignment: .leading, spacing: 10) {
                HomeBookCover(book: book)
                    .aspectRatio(aspect, contentMode: .fit)
                    .frame(maxWidth: layout.verticalShelves ? 220 : .infinity)
                Text(book.title)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(HomePalette.ink)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
        }
        .buttonStyle(HomeControlStyle(cornerRadius: 16, surface: .clear, bordered: false))
        .accessibilityLabel(book.title)
        .accessibilityValue(book.songCount.map { $0 == 1 ? "1 song" : "\($0) songs" } ?? "")
        .accessibilityIdentifier("home.book.\(book.uid)")
    }
}

struct HomeBookCover: View {
    let book: Book

    var body: some View {
        HomePalette.mutedSurface
            .overlay {
                if let image = UIImage(named: ImageConfig.bundledBookCoverName(forUid: book.uid)) {
                    Image(uiImage: image).resizable().scaledToFit()
                } else {
                    // Unknown/new books keep a contained fallback; reading never needs a network.
                    Image(systemName: "book.closed")
                        .font(.largeTitle)
                        .foregroundStyle(HomePalette.muted)
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .accessibilityHidden(true)
    }
}

struct HomeAuthorsCard: View {
    let authors: [Author]
    let songCount: (Author) -> Int

    var body: some View {
        HomeModule(title: "Authors", identifier: "home.authors") {
            HomeCard {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Voices in the library")
                        .font(.headline.weight(.medium))
                        .foregroundStyle(HomePalette.ink)
                        .fixedSize(horizontal: false, vertical: true)
                        .accessibilityAddTraits(.isHeader)
                    ForEach(Array(authors.enumerated()), id: \.element.id) { index, author in
                        HomeAuthorRow(author: author, count: songCount(author), index: index)
                            .accessibilityIdentifier("home.author.\(author.uid)")
                    }
                    HomeBrowseLink(title: "Browse all authors", category: .authors)
                }
            }
        }
    }
}

struct HomeAuthorRow: View {
    let author: Author
    let count: Int
    let index: Int
    @EnvironmentObject private var settings: ReaderSettings
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    var body: some View {
        let name = author.name(inScript: settings.listLanguage)
        NavigationLink(destination: AuthorSongsView(authorUid: author.uid)) {
            HStack(spacing: 12) {
                if !dynamicTypeSize.isAccessibilitySize {
                    Text(String(name.prefix(1)))
                        .font(.title3)
                        .foregroundStyle(.white)
                        .frame(width: 42, height: 42)
                        .background(HomePalette.swatch(index), in: RoundedRectangle(cornerRadius: 13))
                        .accessibilityHidden(true)
                }
                VStack(alignment: .leading, spacing: 4) {
                    Text(name).font(.subheadline.weight(.medium)).foregroundStyle(HomePalette.ink)
                    Text(count == 1 ? "1 song" : "\(count) songs")
                        .font(.caption).foregroundStyle(HomePalette.muted)
                }
                .fixedSize(horizontal: false, vertical: true)
            }
            .padding(6)
            .frame(maxWidth: .infinity, minHeight: 60, alignment: .leading)
            .accessibilityElement(children: .combine)
        }
        .buttonStyle(HomeControlStyle(cornerRadius: 14, surface: .clear, bordered: false))
    }
}

struct HomeTopicsGrid: View {
    let topics: [Topic]
    let layout: HomeLayout

    var body: some View {
        HomeModule(title: "Explore", identifier: "home.topics") {
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 12, alignment: .top),
                                     count: layout.topicColumns), alignment: .leading, spacing: 12) {
                ForEach(Array(topics.enumerated()), id: \.element.id) { index, topic in
                    HomeTopicTile(topic: topic, index: index)
                        .accessibilityIdentifier("home.topic.\(topic.id)")
                }
            }
            HomeBrowseLink(title: "Browse all topics", category: .topics)
        }
    }
}

struct HomeTopicTile: View {
    let topic: Topic
    let index: Int

    var body: some View {
        NavigationLink(destination: SongGroupSongsView(groupUid: topic.id, kind: .topic, title: topic.name)) {
            VStack(alignment: .leading, spacing: 12) {
                Text(topic.name).font(.subheadline.weight(.medium))
                Text(topic.songUids.count == 1 ? "1 song" : "\(topic.songUids.count) songs")
                    .font(.caption)
            }
            .foregroundStyle(HomePalette.topicInk(index))
            .fixedSize(horizontal: false, vertical: true)
            .padding(16)
            .frame(maxWidth: .infinity, minHeight: 106, alignment: .leading)
            .accessibilityElement(children: .combine)
        }
        .buttonStyle(HomeControlStyle(cornerRadius: 22, surface: HomePalette.topic(index), bordered: false))
    }
}
