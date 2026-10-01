import SwiftUI

struct HomeSectionHeading: View {
    let title: String

    var body: some View {
        Text(title)
            .font(.headline)
            .foregroundStyle(Color.primaryText)
            .fixedSize(horizontal: false, vertical: true)
            .accessibilityAddTraits(.isHeader)
    }
}

/// Editorial grouping: hierarchy comes from type and space, not a shell around every section.
struct HomeModule<Content: View>: View {
    let title: String
    let identifier: String
    var browseTitle: String?
    var category: LibraryViewModel.Category?
    private let content: Content

    init(title: String, identifier: String, browseTitle: String? = nil,
         category: LibraryViewModel.Category? = nil, @ViewBuilder content: () -> Content) {
        self.title = title
        self.identifier = identifier
        self.browseTitle = browseTitle
        self.category = category
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: HomeSpacing.md) {
            ViewThatFits(in: .horizontal) {
                HStack(alignment: .firstTextBaseline, spacing: HomeSpacing.md) {
                    HomeSectionHeading(title: title).fixedSize(horizontal: true, vertical: false)
                    Spacer(minLength: HomeSpacing.sm)
                    browseLink.fixedSize(horizontal: true, vertical: false)
                }
                VStack(alignment: .leading, spacing: HomeSpacing.xs) {
                    HomeSectionHeading(title: title)
                    browseLink
                }
            }
            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier(identifier)
    }

    @ViewBuilder
    private var browseLink: some View {
        if let browseTitle, let category {
            HomeBrowseLink(title: browseTitle, category: category)
        }
    }
}
