import SwiftUI

/// Cards share the canonical row's anatomy, semantics and interaction states.
struct SongCard: View {
    let entry: ManifestEntry

    var body: some View {
        SongListItem(entry: entry)
    }
}
