// gk_iosApp.swift
import SwiftUI

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
    }

    private func handleDeepLink(_ url: URL) {
        // Handle URLs like https://gaudiyakirtan.com/songs/N3
        guard let host = url.host,
              host == "gaudiyakirtan.com" else { return }

        let pathComponents = url.pathComponents
        // pathComponents = ["/", "songs", "N3"]
        guard pathComponents.count >= 3,
              pathComponents[1] == "songs" else { return }

        let songUid = pathComponents[2]
        if let song = SampleData.songs.first(where: { $0.uid == songUid }) {
            deepLinkSong = song
        }
    }
}
