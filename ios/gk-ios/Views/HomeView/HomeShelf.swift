import SwiftUI

struct HomeSectionHeading: View {
    let title: String

    var body: some View {
        Text(title)
            .font(.title3.weight(.semibold))
            .foregroundStyle(Color.primaryText)
            .accessibilityAddTraits(.isHeader)
    }
}

/// Native shelves need no extra paging controls. At accessibility sizes every item reflows into
/// the page's single vertical scroll; horizontal and vertical modes receive exactly the same set.
struct HomeShelf<Item: Identifiable, Content: View>: View {
    let title: String
    let items: [Item]
    let itemWidth: CGFloat
    let layout: HomeLayout
    let content: (Item) -> Content

    init(title: String, items: [Item], itemWidth: CGFloat, layout: HomeLayout,
         @ViewBuilder content: @escaping (Item) -> Content) {
        self.title = title
        self.items = items
        self.itemWidth = itemWidth
        self.layout = layout
        self.content = content
    }

    var body: some View {
        if !items.isEmpty {
            VStack(alignment: .leading, spacing: HomeSpacing.lg) {
                HomeSectionHeading(title: title)
                if layout.verticalShelves {
                    LazyVStack(alignment: .leading, spacing: HomeSpacing.md) {
                        ForEach(items) { item in
                            content(item).frame(maxWidth: .infinity, alignment: .leading)
                        }
                    }
                } else {
                    ScrollView(.horizontal) {
                        HStack(alignment: .top, spacing: HomeSpacing.md) {
                            ForEach(items) { item in
                                content(item).frame(width: itemWidth, alignment: .leading)
                            }
                        }
                        // Keep the entire immediate focus ring inside the shelf's clip bounds.
                        .padding(HomeSpacing.xs)
                    }
                    .scrollIndicators(.hidden)
                    .accessibilityLabel(title)
                }
            }
            .accessibilityIdentifier("home.\(title.lowercased())")
        }
    }
}
