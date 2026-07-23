import SwiftUI

struct SongCard: View {
    let entry: ManifestEntry
    /// App-wide settings (injected at the app root). Read here so the card title honors the
    /// `listLanguage` setting (settings.md — "which script titles appear in lists").
    @EnvironmentObject private var settings: ReaderSettings

    private var authorName: String {
        SongRepository.shared.authorDisplayName(forUid: entry.authorUid)
    }

    var body: some View {
        // Use NavigationLink with isActive for better control
        NavigationLink(destination: SongDetailLoader(uid: entry.uid)) {
            HStack {
                // Main content
                VStack(alignment: .leading, spacing: 4) {
                    // Title and UID row
                    HStack(alignment: .center) {
                        Text(entry.title(inScript: settings.listLanguage))
                            .font(.system(size: 14))
                            .foregroundColor(Color("primaryText"))
                            .lineLimit(1)
                            .layoutPriority(1)

                        Text(entry.uid)
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(Color.neutral)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 2)
                            .background(Color.neutral.opacity(0.25))
                            .cornerRadius(11)
                            .lineLimit(1)
                            .fixedSize()
                    }

                    // Author and audio icon
                    HStack(spacing: 6) {
                        Text(authorName)
                            .font(.system(size: 14))
                            .foregroundColor(Color.neutral)
                            .lineLimit(1)

                        if entry.audioAvailable {
                            Image(systemName: "music.note")
                                .font(.system(size: 12))
                                .foregroundColor(Color.neutral)
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .frame(height: 56)
            .padding(.horizontal, 10)
            .background(Color.backgroundOffset)
            .cornerRadius(12)
        }
        .buttonStyle(PlainButtonStyle())
    }
}
