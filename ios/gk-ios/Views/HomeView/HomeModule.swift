import SwiftUI

struct HomeSectionHeading: View {
    let title: String

    var body: some View {
        Text(title)
            .font(.subheadline.weight(.medium))
            .foregroundStyle(HomePalette.muted)
            .padding(.leading, 4)
            .accessibilityAddTraits(.isHeader)
    }
}

struct HomeModule<Content: View>: View {
    let title: String
    let identifier: String
    private let content: Content

    init(title: String, identifier: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.identifier = identifier
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HomeSectionHeading(title: title)
            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier(identifier)
    }
}
