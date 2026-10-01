import SwiftUI

struct SongsGridView: View {
    let songs: [ManifestEntry]
    let layout: HomeLayout

    var body: some View {
        if !songs.isEmpty {
            VStack(alignment: .leading, spacing: HomeSpacing.lg) {
                HStack(spacing: HomeSpacing.lg) {
                    HomeSectionHeading(title: "Songs")
                    Spacer(minLength: 0)
                    // iOS has no seasonal context. The static phrasing motif accompanies Songs
                    // without suggesting a calendar or reflecting playback.
                    if !layout.verticalShelves {
                        RhythmArtwork()
                            .frame(width: 96, height: 64)
                    }
                }
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: HomeSpacing.md,
                                                             alignment: .topLeading),
                                         count: layout.columnCount),
                          alignment: .leading, spacing: HomeSpacing.md) {
                    ForEach(songs) { entry in
                        SongCard(entry: entry)
                    }
                }
                .accessibilityIdentifier("home.songs")
            }
        }
    }
}
