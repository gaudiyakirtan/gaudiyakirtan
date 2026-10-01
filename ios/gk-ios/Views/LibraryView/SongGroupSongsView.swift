import SwiftUI

/// Topic/book destination over the existing repository. Ordered membership is never alphabetized.
struct SongGroupSongsView: View {
    let groupUid: String
    let kind: SongGroupKind
    let title: String
    @State private var songs: [ManifestEntry] = []
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(alignment: .leading, spacing: HomeSpacing.lg) {
            Button { dismiss() } label: {
                Label("Back", systemImage: "chevron.left")
                    .font(.body)
                    .foregroundStyle(Color.primaryText)
                    .padding(.horizontal, HomeSpacing.md)
                    .frame(minWidth: 44, minHeight: 44)
            }
            .buttonStyle(HomeControlStyle(surface: .background, outlined: true))

            Text(title)
                .font(.title2.weight(.semibold))
                .foregroundStyle(Color.primaryText)
                .accessibilityAddTraits(.isHeader)
            ScrollView {
                LazyVStack(spacing: HomeSpacing.md) {
                    if songs.isEmpty {
                        Text("No songs in this group.")
                            .foregroundStyle(Color.secondaryText)
                    }
                    ForEach(songs) { entry in
                        SongListItem(entry: entry)
                    }
                }
                .padding(HomeSpacing.xs)
                .padding(.bottom, HomeSpacing.lg)
            }
        }
        .padding(HomeSpacing.lg)
        .background(Color.background.ignoresSafeArea())
        .navigationBarHidden(true)
        .accessibilityIdentifier("group.\(groupUid)")
        .onAppear {
            let repository = SongRepository.shared
            let group = repository.songGroups(kind: kind).first { $0.uid == groupUid }
            songs = repository.manifestEntries(forUids: group?.songUids ?? [])
        }
    }
}
