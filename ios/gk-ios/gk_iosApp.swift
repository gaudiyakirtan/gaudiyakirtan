// gk_iosApp.swift
import SwiftUI
import SwiftData

@main
struct gk_iosApp: App {
    @State private var deepLinkSong: Song? = nil

    var body: some Scene {
        WindowGroup {
            AppNavigation()
                .onOpenURL { url in
                    handleDeepLink(url)
                }
                .sheet(item: $deepLinkSong) { song in
                    NavigationView {
                        SongView(song: song)
                    }
                }
        }
        .modelContainer(for: [
            PersistentSong.self,
            PersistentAuthor.self,
            PersistentTopic.self,
            PersistentBook.self
        ])
    }

    private func handleDeepLink(_ url: URL) {
        guard let host = url.host,
              host == "gaudiyakirtan.com" else { return }

        let pathComponents = url.pathComponents
        guard pathComponents.count >= 3,
              pathComponents[1] == "songs" else { return }

        let songUid = pathComponents[2]
        if let song = SampleData.songs.first(where: { $0.uid == songUid }) {
            deepLinkSong = song
        }
    }
}
