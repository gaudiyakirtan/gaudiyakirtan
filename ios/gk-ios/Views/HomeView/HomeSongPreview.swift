import SwiftUI

struct HomeSongPreview: View {
    let songs: [ManifestEntry]
    let catalogCount: Int
    @EnvironmentObject private var settings: ReaderSettings

    var body: some View {
        HomeModule(title: "Songs", identifier: "home.songs") {
            HomeCard {
                VStack(alignment: .leading, spacing: 12) {
                    Text("A place to begin")
                        .font(.headline.weight(.medium))
                        .foregroundStyle(HomePalette.ink)
                        .accessibilityAddTraits(.isHeader)
                    ForEach(songs) { entry in
                        songRow(entry)
                        if entry.id != songs.last?.id {
                            Rectangle().fill(HomePalette.line).frame(height: 1).accessibilityHidden(true)
                        }
                    }
                    HomeBrowseLink(title: "Browse all \(catalogCount) songs", category: .songs)
                }
            }
        }
    }

    private func songRow(_ entry: ManifestEntry) -> some View {
        let title = entry.title(inScript: settings.listLanguage)
        let author = SongRepository.shared.authorDisplayName(forUid: entry.authorUid, inScript: settings.listLanguage)
        return NavigationLink(destination: SongDetailLoader(uid: entry.uid)) {
            HStack(alignment: .center, spacing: 12) {
                VStack(alignment: .leading, spacing: 5) {
                    Text(title)
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(HomePalette.ink)
                    Text(author)
                        .font(.caption)
                        .foregroundStyle(HomePalette.muted)
                }
                .fixedSize(horizontal: false, vertical: true)
                .frame(maxWidth: .infinity, alignment: .leading)
                Image(systemName: "arrow.up.right")
                    .font(.caption)
                    .foregroundStyle(HomePalette.muted)
                    .accessibilityHidden(true)
            }
            .padding(.vertical, 6)
            .padding(.horizontal, 4)
            .frame(maxWidth: .infinity, minHeight: 56, alignment: .leading)
        }
        .buttonStyle(HomeControlStyle(surface: .clear, bordered: false))
        .accessibilityLabel("\(title), \(entry.uid), \(author)")
        .accessibilityValue(entry.audioAvailable ? "Audio available" : "")
        .accessibilityIdentifier("home.song.\(entry.uid)")
    }
}
