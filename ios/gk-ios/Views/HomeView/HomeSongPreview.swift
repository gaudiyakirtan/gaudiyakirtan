import SwiftUI

struct HomeSongPreview: View {
    let songs: [ManifestEntry]

    var body: some View {
        if !songs.isEmpty {
            HomeModule(title: "Songs", identifier: "home.songs",
                       browseTitle: "All songs", category: .songs) {
                VStack(spacing: HomeSpacing.xs) {
                    ForEach(songs) { entry in
                        SongListItem(entry: entry, surface: .clear, bordered: false)
                            .accessibilityIdentifier("home.song.\(entry.uid)")
                        if entry.id != songs.last?.id {
                            Divider().overlay(Color.border).accessibilityHidden(true)
                        }
                    }
                }
            }
        }
    }
}
