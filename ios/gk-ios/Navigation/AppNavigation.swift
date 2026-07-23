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
        // than overlapping it, and only occupies space once a track is loaded.
        .safeAreaInset(edge: .bottom) {
            if audioPlayer.hasActiveTrack {
                MiniPlayerView()
            }
        }
        // Now Playing (player.md "song-detail play button → ... open/raise the player"; mini-player
        // "tappable to expand to Now Playing"). Raised/lowered from anywhere via
        // `audioPlayer.isExpanded` on the shared instance — collapsing keeps playback running.
        .sheet(isPresented: $audioPlayer.isExpanded) {
            PlayerView()
                .environmentObject(audioPlayer)
                .environmentObject(readerSettings)
        }
        .environmentObject(readerSettings)
        .environmentObject(audioPlayer)
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
