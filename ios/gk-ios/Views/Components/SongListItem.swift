import SwiftUI

/// Canonical row for Home, Search and Library. Layout expands instead of clipping reading scripts.
struct SongListItem: View {
    let entry: ManifestEntry
    @EnvironmentObject private var settings: ReaderSettings
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    private var title: String { entry.title(inScript: settings.listLanguage) }
    private var authorName: String {
        SongRepository.shared.authorDisplayName(forUid: entry.authorUid, inScript: settings.listLanguage)
    }

    var body: some View {
        NavigationLink(destination: SongDetailLoader(uid: entry.uid)) {
            VStack(alignment: .leading, spacing: HomeSpacing.xs) {
                ViewThatFits(in: .horizontal) {
                    HStack(alignment: .firstTextBaseline, spacing: HomeSpacing.sm) {
                        titleText.fixedSize(horizontal: true, vertical: false)
                        RowUidChip(uid: entry.uid)
                    }
                    VStack(alignment: .leading, spacing: HomeSpacing.xs) {
                        titleText
                        RowUidChip(uid: entry.uid)
                    }
                }
                HStack(alignment: .firstTextBaseline, spacing: HomeSpacing.sm) {
                    Text(authorName)
                        .font(.subheadline)
                        .foregroundStyle(Color.secondaryText)
                        .lineLimit(dynamicTypeSize.isAccessibilitySize ? nil : 2)
                        .fixedSize(horizontal: false, vertical: true)
                    if entry.audioAvailable {
                        Image(systemName: "music.note")
                            .font(.subheadline)
                            .foregroundStyle(Color.tertiaryText)
                    }
                }
            }
            .padding(.horizontal, HomeSpacing.md)
            .padding(.vertical, HomeSpacing.sm)
            .frame(maxWidth: .infinity, minHeight: 56, alignment: .leading)
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("\(title), \(entry.uid), \(authorName)")
            .accessibilityValue(entry.audioAvailable ? "Audio available" : "")
        }
        .buttonStyle(HomeControlStyle())
        .accessibilityIdentifier("song.\(entry.uid)")
    }

    private var titleText: some View {
        Text(title)
            .font(.body)
            .foregroundStyle(Color.primaryText)
            .lineLimit(dynamicTypeSize.isAccessibilitySize ? nil : 2)
            .fixedSize(horizontal: false, vertical: true)
    }
}
