import SwiftUI

/// The author-filtered Song List (docs/screens/songs-list.md — the "Library (Author)" variant):
/// the same manifest-driven list, filtered to a single `author_uid`, with a header naming the
/// author. This is the destination that unlocks song-detail's deferred author-tap navigation
/// ("Tap author → authors filtered") as well as tapping an author card in the Library.
///
/// Reads only the bundled Manifest (never full songs) and resolves the author's display name via the
/// same derived catalog the Library uses (`SongRepository.authorDisplayName(forUid:)`), so the name
/// shown here matches the Authors list. Fully offline.
struct AuthorSongsView: View {
    let authorUid: String
    @Environment(\.presentationMode) private var presentationMode

    private var authorName: String {
        SongRepository.shared.authorDisplayName(forUid: authorUid)
    }

    /// This author's songs from the Manifest, sorted by the stable Latin `primary_title` so the A–Z
    /// sections read alphabetically (matching the main Song List; songs-list.md sort key).
    private var songs: [ManifestEntry] {
        SongRepository.shared.manifest
            .filter { $0.authorUid == authorUid }
            .sorted { $0.displayTitle.localizedCaseInsensitiveCompare($1.displayTitle) == .orderedAscending }
    }

    var body: some View {
        ZStack(alignment: .top) {
            Color.background.edgesIgnoringSafeArea(.all)

            VStack(spacing: 12) {
                backButton
                header

                if songs.isEmpty {
                    // Only the author-filtered view can be empty (unknown author) — songs-list.md.
                    emptyState
                } else {
                    AlphabeticalScrollView(
                        scrollTarget: $scrollTarget,
                        items: songs,
                        sectionKeyPath: \.sectionKey
                    ) { entry in
                        SongListItem(entry: entry)
                            .padding(.trailing, 20)
                    }
                    .padding(.horizontal)
                }

                Spacer(minLength: 0)
            }
        }
        .navigationBarHidden(true)
    }

    // The A–Z scrubber writes its jump target here (local to this screen).
    @State private var scrollTarget: String? = nil

    private var backButton: some View {
        HStack {
            Button(action: { presentationMode.wrappedValue.dismiss() }) {
                HStack(spacing: 2) {
                    Image(systemName: "chevron.left")
                    Text("Back")
                }
                .foregroundColor(Color.highlight)
                .padding(.leading, 16)
                .padding(.top, 12)
            }
            Spacer()
        }
    }

    private var header: some View {
        VStack(spacing: 4) {
            Text(authorName)
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(Color.highlight)
                .multilineTextAlignment(.center)

            Text(songs.count == 1 ? "1 song" : "\(songs.count) songs")
                .font(.system(size: 14))
                .foregroundColor(Color.neutral)
        }
        .padding(.horizontal)
    }

    private var emptyState: some View {
        VStack {
            Spacer()
            Text("No songs found for this author.")
                .foregroundColor(Color.neutral)
            Spacer()
        }
        .frame(maxWidth: .infinity)
    }
}

#Preview {
    NavigationView {
        AuthorSongsView(authorUid: "ldt")
            .environmentObject(ReaderSettings())
    }
}
