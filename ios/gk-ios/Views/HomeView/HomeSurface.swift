import SwiftUI

struct HomeCard<Content: View>: View {
    private let content: Content
    private let surface: Color
    private let border: Color
    @Environment(\.colorScheme) private var colorScheme

    init(surface: Color = HomePalette.card, border: Color = HomePalette.line,
         @ViewBuilder content: () -> Content) {
        self.surface = surface
        self.border = border
        self.content = content()
    }

    var body: some View {
        content
            .padding(22)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(surface, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .strokeBorder(border, lineWidth: 1)
            }
            .shadow(color: .black.opacity(colorScheme == .dark ? 0.18 : 0.045), radius: 18, y: 10)
    }
}

struct HomeBrowseLink: View {
    let title: String
    let category: LibraryViewModel.Category
    var foreground: Color = HomePalette.ink

    var body: some View {
        NavigationLink(destination: LibraryView(initialCategory: category)) {
            HStack(spacing: 8) {
                Text(title).underline()
                    .fixedSize(horizontal: false, vertical: true)
                Image(systemName: "arrow.right").accessibilityHidden(true)
            }
            .font(.subheadline.weight(.medium))
            .foregroundStyle(foreground)
            .padding(.horizontal, 8)
            .frame(minWidth: 44, minHeight: 44, alignment: .leading)
        }
        .buttonStyle(HomeControlStyle(surface: .clear, bordered: false))
        .accessibilityIdentifier("home.browse.\(category.rawValue.lowercased())")
    }
}
