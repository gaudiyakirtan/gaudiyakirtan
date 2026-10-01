import SwiftUI

struct HomeBrowseLink: View {
    let title: String
    let category: LibraryViewModel.Category

    var body: some View {
        NavigationLink(destination: LibraryView(initialCategory: category)) {
            HStack(spacing: HomeSpacing.sm) {
                Text(title).underline()
                    .fixedSize(horizontal: false, vertical: true)
                HomeBrowseArrow()
            }
            .font(.subheadline)
            .foregroundStyle(Color.secondaryText)
            .padding(.horizontal, HomeSpacing.xs)
            .frame(minWidth: 44, minHeight: 44, alignment: .leading)
        }
        .buttonStyle(HomeControlStyle(surface: .clear, bordered: false))
        .accessibilityIdentifier("home.browse.\(category.rawValue.lowercased())")
    }
}
