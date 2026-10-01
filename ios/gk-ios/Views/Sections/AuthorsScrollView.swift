import SwiftUI

struct AuthorsScrollView: View {
    let authors: [Author]
    let layout: HomeLayout
    @EnvironmentObject private var settings: ReaderSettings

    var body: some View {
        HomeShelf(title: "Authors", items: authors, itemWidth: 208, layout: layout) { author in
            let name = author.name(inScript: settings.listLanguage)
            NavigationLink(destination: AuthorSongsView(authorUid: author.uid)) {
                HStack(alignment: .center, spacing: HomeSpacing.md) {
                    // The corpus has no author portraits. Initials identify the existing fallback.
                    Text(initials(name))
                        .font(.subheadline.weight(.medium))
                        .dynamicTypeSize(.large) // Decorative portrait; the adjacent name scales fully.
                        .foregroundStyle(Color.secondaryText)
                        .frame(width: 48, height: 48)
                        .background(Color.neutral.opacity(0.20), in: Circle())
                        .accessibilityHidden(true)
                    Text(name)
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(Color.primaryText)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding(HomeSpacing.lg)
                .frame(maxWidth: .infinity, minHeight: 88, alignment: .leading)
                .accessibilityElement(children: .combine)
            }
            .buttonStyle(HomeControlStyle(cornerRadius: HomeShape.medium))
            .accessibilityIdentifier("home.author.\(author.uid)")
        }
    }

    private func initials(_ name: String) -> String {
        name.split(whereSeparator: { $0.isWhitespace }).prefix(2)
            .compactMap { $0.first.map(String.init) }.joined().uppercased()
    }
}
