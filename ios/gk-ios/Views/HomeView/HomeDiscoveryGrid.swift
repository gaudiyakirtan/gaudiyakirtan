import SwiftUI
import UIKit

struct HomeBooksRail: View {
    let books: [Book]
    let layout: HomeLayout

    var body: some View {
        if !books.isEmpty {
            HomeModule(title: "Books", identifier: "home.books", browseTitle: "All books", category: .books) {
                ScrollView(.horizontal) {
                    HStack(alignment: .top, spacing: HomeSpacing.md) {
                        ForEach(books) { book in
                            bookLink(book).frame(width: layout.bookWidth)
                        }
                    }
                    // Reserve space inside the scroll clip for the external native focus ring.
                    .padding(HomeSpacing.xs)
                }
                .padding(-HomeSpacing.xs)
                .accessibilityIdentifier("home.books.rail")
            }
        }
    }

    private func bookLink(_ book: Book) -> some View {
        NavigationLink(destination: SongGroupSongsView(groupUid: book.uid, kind: .book, title: book.title)) {
            VStack(alignment: .leading, spacing: HomeSpacing.sm) {
                HomeBookCover(book: book, height: layout.bookWidth * 1.4)
                Text(book.title)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(Color.primaryText)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
        }
        .buttonStyle(HomeControlStyle(surface: .clear, bordered: false))
        .accessibilityLabel(book.title)
        .accessibilityValue(book.songCount.map { $0 == 1 ? "1 song" : "\($0) songs" } ?? "")
        .accessibilityIdentifier("home.book.\(book.uid)")
    }
}

struct HomeBookCover: View {
    let book: Book
    let height: CGFloat

    var body: some View {
        Group {
            if let image = UIImage(named: ImageConfig.bundledBookCoverName(forUid: book.uid)) {
                // Every original cover is complete, including its edges, regardless of aspect ratio.
                Image(uiImage: image).resizable().scaledToFit()
                    .frame(height: height)
            } else {
                Text(book.title)
                    .font(.subheadline)
                    .foregroundStyle(Color.secondaryText)
                    .multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(HomeSpacing.md)
                    .frame(maxWidth: .infinity, minHeight: height)
                    .background(Color.backgroundOffset,
                                in: RoundedRectangle(cornerRadius: HomeShape.small, style: .continuous))
            }
        }
        .frame(maxWidth: .infinity, alignment: .bottomLeading)
        // The adjacent visible title names the whole book link, including its offline fallback.
        .accessibilityHidden(true)
    }
}

struct HomeAuthorsList: View {
    let authors: [Author]
    let songCount: (Author) -> Int

    var body: some View {
        if !authors.isEmpty {
            HomeModule(title: "Authors", identifier: "home.authors",
                       browseTitle: "All authors", category: .authors) {
                VStack(spacing: HomeSpacing.xs) {
                    ForEach(authors) { author in
                        HomeAuthorRow(author: author, count: songCount(author))
                            .accessibilityIdentifier("home.author.\(author.uid)")
                        if author.id != authors.last?.id {
                            Divider().overlay(Color.border).accessibilityHidden(true)
                        }
                    }
                }
            }
        }
    }
}

struct HomeAuthorRow: View {
    let author: Author
    let count: Int
    @EnvironmentObject private var settings: ReaderSettings
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    var body: some View {
        let name = author.name(inScript: settings.listLanguage)
        NavigationLink(destination: AuthorSongsView(authorUid: author.uid)) {
            let layout = dynamicTypeSize.isAccessibilitySize
                ? AnyLayout(VStackLayout(alignment: .leading, spacing: HomeSpacing.xs))
                : AnyLayout(HStackLayout(alignment: .firstTextBaseline, spacing: HomeSpacing.md))
            layout {
                Text(name)
                    .font(.body)
                    .foregroundStyle(Color.primaryText)
                    .frame(maxWidth: .infinity, alignment: .leading)
                Text(count == 1 ? "1 song" : "\(count) songs")
                    .font(.caption)
                    .foregroundStyle(Color.secondaryText)
            }
            .fixedSize(horizontal: false, vertical: true)
            .padding(.horizontal, HomeSpacing.md)
            .padding(.vertical, HomeSpacing.sm)
            .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
        }
        .buttonStyle(HomeControlStyle(surface: .clear, bordered: false))
        .accessibilityLabel("\(name), \(count == 1 ? "1 song" : "\(count) songs")")
    }
}

struct HomeTopicsLinks: View {
    let topics: [Topic]

    var body: some View {
        if !topics.isEmpty {
            HomeModule(title: "Topics", identifier: "home.topics",
                       browseTitle: "All topics", category: .topics) {
                HomeTopicFlow(spacing: HomeSpacing.sm) {
                    ForEach(topics) { topic in
                        NavigationLink(destination: SongGroupSongsView(groupUid: topic.id, kind: .topic, title: topic.name)) {
                            (Text(topic.name).foregroundColor(.primaryText)
                             + Text("  \(topic.songUids.count)").foregroundColor(.secondaryText))
                                .font(.subheadline)
                                .fixedSize(horizontal: false, vertical: true)
                                .padding(.horizontal, HomeSpacing.md)
                                .padding(.vertical, HomeSpacing.sm)
                                .frame(minWidth: 44, minHeight: 44, alignment: .leading)
                        }
                        .buttonStyle(HomeControlStyle(surface: .clear, outlined: true))
                        .accessibilityLabel("\(topic.name), \(topic.songUids.count == 1 ? "1 song" : "\(topic.songUids.count) songs")")
                        .accessibilityIdentifier("home.topic.\(topic.id)")
                    }
                }
            }
        }
    }
}

/// Intrinsic-width chips wrap in source order. A long label receives the full available width
/// and wraps internally, so accessibility text sizes never create a horizontal page overflow.
private struct HomeTopicFlow: Layout {
    let spacing: CGFloat

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        arrangement(width: proposal.width, subviews: subviews).size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrangement(width: bounds.width, subviews: subviews)
        for (index, item) in result.items.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + item.origin.x, y: bounds.minY + item.origin.y),
                                  anchor: .topLeading,
                                  proposal: ProposedViewSize(width: item.width, height: item.height))
        }
    }

    private func arrangement(width: CGFloat?, subviews: Subviews) -> (size: CGSize, items: [CGRect]) {
        let limit = max(0, width ?? subviews.reduce(0) { $0 + $1.sizeThatFits(.unspecified).width + spacing })
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0
        var usedWidth: CGFloat = 0
        var items: [CGRect] = []
        for subview in subviews {
            let size = subview.sizeThatFits(ProposedViewSize(width: limit, height: nil))
            if x > 0 && x + size.width > limit {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            items.append(CGRect(origin: CGPoint(x: x, y: y), size: size))
            usedWidth = max(usedWidth, x + size.width)
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
        }
        return (CGSize(width: width ?? usedWidth, height: y + rowHeight), items)
    }
}
