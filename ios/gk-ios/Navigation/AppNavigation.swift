import SwiftUI
import Foundation

struct AppNavigation: View {
    @State private var selection: Tab = .home

    /// App-wide reading preferences (chosen script + word-to-word/translation toggles), shared by the
    /// Song Detail screen and Settings. Injected into the whole view tree so `SongView`/`VerseView`
    /// and the settings sheet read and mutate the same source (docs/screens/song-detail.md).
    @StateObject private var readerSettings = ReaderSettings()

    /// The shared, app-wide playback service (docs/screens/player.md "a global playback service,
    /// not per-screen state"). Injected here — the one place that outlives every pushed/tabbed
    /// screen — so the mini-player and Now Playing sheet below survive navigation.
    @StateObject private var audioPlayer = AudioPlayerService.shared

    /// The persisted last visited song (docs/screens/player.md **v15** — key
    /// `player.lastVisitedSongUid`). Owned here for the same reason as the two above: `SongView`
    /// writes it and the mini-player reads it, and both must see the same instance.
    @StateObject private var lastVisitedSong = LastVisitedSongStore()

    /// The song the mini-player's resting state asked to open (player.md v15 — a song with no audio
    /// "still occupies the slot ... but the play affordance is replaced by an open-song chevron").
    ///
    /// Presented from the root rather than from `MiniPlayerView` because the reader suppresses the
    /// bar on appear (v14), which removes `MiniPlayerView` from the tree — a sheet owned by that
    /// view would be dismissed the instant its content appeared.
    @State private var songToOpen: SongSheetTarget?

    /// `Identifiable` box around a song uid so `.sheet(item:)` can be driven by a plain `String`.
    private struct SongSheetTarget: Identifiable {
        let id: String
    }

    enum Tab {
        case home, library, collection, search

        var iconName: String {
            switch self {
            case .home: return "home"
            case .library: return "library"
            case .collection: return "stack"
            case .search: return "search"
            }
        }

        var filledIconName: String {
            switch self {
            case .home: return "home-filled"
            case .library: return "library-filled"
            case .collection: return "stack-filled"
            case .search: return "search-filled"
            }
        }
    }

    let gradient: LinearGradient = LinearGradient(
        colors: [
            Color.background.opacity(0),
            Color.background,
            Color.background
        ],
        startPoint: .top,
        endPoint: .bottom
    )

    var body: some View {
        TabView(selection: $selection) {
            NavigationView {
                HomeView()
                    .navigationBarHidden(true)
            }
            .tag(Tab.home)
            .tabItem {
                Image(selection == .home ? Tab.home.filledIconName : Tab.home.iconName)
                    .renderingMode(.template)
                    .foregroundColor(selection == .home ? Color.highlight : Color.neutral)
                Text("Home")
                    .foregroundColor(selection == .home ? Color.highlight : Color.neutral)
            }
            .background(Color.background)

            NavigationView {
                LibraryView()
                    .navigationBarHidden(true)
            }
            .tag(Tab.library)
            .tabItem {
                Image(selection == .library ? Tab.library.filledIconName : Tab.library.iconName)
                    .renderingMode(.template)
                    .foregroundColor(selection == .library ? Color.highlight : Color.neutral)
                Text("Library")
                    .foregroundColor(selection == .library ? Color.highlight : Color.neutral)
            }
            .background(Color.background)

            NavigationView {
                CollectionsView()
                    .navigationBarHidden(true)
            }
            .tag(Tab.collection)
            .tabItem {
                Image(
                    selection == .collection
                        ? Tab.collection.filledIconName : Tab.collection.iconName
                )
                .renderingMode(.template)
                .foregroundColor(selection == .collection ? Color.highlight : Color.neutral)
                Text("Collections")
                    .foregroundColor(selection == .collection ? Color.highlight : Color.neutral)
            }

            NavigationView {
                SearchView(autofocus: true)
            }
            .tag(Tab.search)
            .tabItem {
                Image(selection == .search ? Tab.search.filledIconName : Tab.search.iconName)
                    .renderingMode(.template)
                    .foregroundColor(selection == .search ? Color.highlight : Color.neutral)
                Text("Search")
                    .foregroundColor(selection == .search ? Color.highlight : Color.neutral)
            }
        }
        // Mini-player (player.md "Track"/"trailingIcon2_" — "a compact bar ... that can sit above
        // the tab bar"): inserted as a bottom safe-area inset so it pushes the tab bar up rather
        // than overlapping it.
        //
        // The gate no longer includes `hasActiveTrack`: as of player.md **v15** the slot is not
        // playback-gated, it keeps showing the last visited song when nothing is loaded ("The
        // mini-player is never empty"). Deciding between the two states — and rendering nothing at
        // all on a fresh install — belongs to `MiniPlayerView`/`resolveMiniPlayerSlot`, which have
        // the persisted uid; the empty case yields an `EmptyView` and so a zero-height inset,
        // exactly as the old `false` branch did.
        //
        // `isMiniPlayerSuppressed` still hides it on song-detail (player.md v14 "The reader gets a
        // pill, not a bar"). The inset is owned by this root `TabView`, so the reader screen can't
        // remove it directly — it publishes the intent on the shared player service and this gate
        // honors it. Playback is untouched either way.
        .safeAreaInset(edge: .bottom) {
            if !audioPlayer.isMiniPlayerSuppressed {
                MiniPlayerView(onOpenSong: { songToOpen = SongSheetTarget(id: $0) })
            }
        }
        // Belt-and-suspenders for the "leaving by tab switch" case in song-detail.md v7: SwiftUI
        // does not reliably fire `onDisappear` for a pushed view when its tab is switched away
        // from, and a stuck suppression flag would leave every *other* tab without a mini-player.
        // Switching tabs always clears it; returning to song-detail re-sets it via `onAppear`.
        .onChange(of: selection) { _ in
            audioPlayer.isMiniPlayerSuppressed = false
        }
        // Now Playing (player.md "song-detail play button → ... open/raise the player"; mini-player
        // "tappable to expand to Now Playing"). Raised/lowered from anywhere via
        // `audioPlayer.isExpanded` on the shared instance — collapsing keeps playback running.
        .sheet(isPresented: $audioPlayer.isExpanded) {
            PlayerView()
                .environmentObject(audioPlayer)
                .environmentObject(readerSettings)
        }
        // The resting mini-player's open-song chevron (player.md v15 — a last visited song with no
        // audio "still occupies the slot ... but the play affordance is replaced by an open-song
        // chevron"). Hosted on a zero-size background view rather than chained straight onto this
        // `TabView`: two `.sheet` modifiers applied to the same view are historically unreliable on
        // the deployment target (15.6), and giving each presentation its own host keeps them
        // independent of one another. Environment objects are injected explicitly, as the Now
        // Playing sheet above already does — sheet content does not reliably inherit them.
        .background(
            Color.clear
                .frame(width: 0, height: 0)
                .sheet(item: $songToOpen) { target in
                    NavigationView {
                        SongDetailLoader(uid: target.id)
                    }
                    .environmentObject(readerSettings)
                    .environmentObject(audioPlayer)
                    .environmentObject(lastVisitedSong)
                }
        )
        .environmentObject(readerSettings)
        .environmentObject(audioPlayer)
        .environmentObject(lastVisitedSong)
        // Active tab uses the accent/highlight token (browse.md "Navigation: active state uses the
        // accent"; theme.md "interactive/selection controls must be tinted to highlight/accent
        // explicitly, not the platform default"). `.tint` covers the native selected-item chrome;
        // the per-tabItem ternaries above are the explicit belt-and-suspenders since SwiftUI's
        // TabView/UITabBarController bridging doesn't always honor inline modifiers for custom
        // Image/Text tabItem content across OS versions.
        .tint(Color.highlight)
        // Apply the persisted theme app-wide (settings.md `theme`). Maps to a light/dark color scheme
        // for now; the full Gaura/Shyam two-palette repaint is a later dedicated slice.
        .preferredColorScheme(readerSettings.theme.colorScheme)
        .onAppear() {
            UITabBar.appearance().backgroundColor = UIColor(Color.background)
            // UIKit-level fallback so the unselected tabs render in `neutral` even if the SwiftUI
            // `.tint`/per-item foregroundColor above doesn't win on a given OS version — the selected
            // tab's color comes from `.tint(Color.highlight)`.
            UITabBar.appearance().unselectedItemTintColor = UIColor(Color.neutral)

            // Configure NavigationBar appearance to be hidden by default
            let appearance = UINavigationBarAppearance()
            appearance.configureWithTransparentBackground()
            UINavigationBar.appearance().standardAppearance = appearance
            UINavigationBar.appearance().compactAppearance = appearance
            UINavigationBar.appearance().scrollEdgeAppearance = appearance
        }
    }
}
