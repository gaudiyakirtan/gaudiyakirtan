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

    /// `.regular` where `NavigationView` lays out two columns (iPad, the largest iPhones in
    /// landscape). There song-detail is a detail column beside the list, not a full-screen push
    /// — see `tabBarVisibility(for:)`.
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass

    /// `Identifiable` box around a song uid so `.sheet(item:)` can be driven by a plain `String`.
    private struct SongSheetTarget: Identifiable {
        let id: String
    }

    enum Tab: String {
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
                    .toolbar(tabBarVisibility(for: .home), for: .tabBar)
                    .navigationBarHidden(true)
            }
            .safeAreaInset(edge: .bottom) { miniPlayer(in: .home) }
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
                    .toolbar(tabBarVisibility(for: .library), for: .tabBar)
                    .navigationBarHidden(true)
            }
            .safeAreaInset(edge: .bottom) { miniPlayer(in: .library) }
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
                    .toolbar(tabBarVisibility(for: .collection), for: .tabBar)
                    .navigationBarHidden(true)
            }
            .safeAreaInset(edge: .bottom) { miniPlayer(in: .collection) }
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
                    .toolbar(tabBarVisibility(for: .search), for: .tabBar)
            }
            .safeAreaInset(edge: .bottom) { miniPlayer(in: .search) }
            .tag(Tab.search)
            .tabItem {
                Image(selection == .search ? Tab.search.filledIconName : Tab.search.iconName)
                    .renderingMode(.template)
                    .foregroundColor(selection == .search ? Color.highlight : Color.neutral)
                Text("Search")
                    .foregroundColor(selection == .search ? Color.highlight : Color.neutral)
            }
        }
        // Every pushed screen learns which tab it is in, so song-detail can name its own tab above.
        .environment(\.currentTabID, selection.rawValue)
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
        // `TabView`: two `.sheet` modifiers applied to the same view are historically unreliable
        // (this was written against a 15.6 deployment target), and giving each presentation its
        // own host keeps them independent of one another. Environment objects are injected
        // explicitly, as the Now Playing sheet above already does — sheet content does not
        // reliably inherit them.
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

    // MARK: - The bottom edge of a tab

    /// The mini-player for one tab (player.md "Track"/"trailingIcon2_" — "a compact bar ... that
    /// can sit above the tab bar").
    ///
    /// **Mounted on each tab's `NavigationView`, not once on the `TabView` — the placement is the
    /// layout.** A bottom `safeAreaInset` on the `TabView` itself is laid out against the
    /// *window's* safe area (the home-indicator strip), so it drew the bar straight over the tab
    /// bar — iPhone 17 Pro / iOS 26.5: tab bar 791–874, bar 784–840; the same on iOS 18.5. A tab's
    /// own stack has the tab bar in its safe area, so the same inset there sits on top of it with
    /// no offset and no device constant, and because that safe area also follows the keyboard, the
    /// bar sits flush on the keyboard on Search rather than floating above it.
    ///
    /// The gate does not include `hasActiveTrack`: as of player.md **v15** the slot is not
    /// playback-gated, it keeps showing the last visited song when nothing is loaded ("The
    /// mini-player is never empty"). Deciding between the two states — and rendering nothing at
    /// all on a fresh install — belongs to `MiniPlayerView`/`resolveMiniPlayerSlot`, which have the
    /// persisted uid; the empty case yields an `EmptyView` and so a zero-height inset.
    ///
    /// It is hidden while song-detail is on screen in *this* tab (player.md v14 "The reader gets a
    /// pill, not a bar"). The reader records its tab on the shared player service, and comparing
    /// against the tab — rather than clearing a flag — is what keeps tab switches race-free:
    /// switching away shows the bar and switching back hides it again with nothing to clear and
    /// nothing to re-set. Playback is untouched either way.
    @ViewBuilder
    private func miniPlayer(in tab: Tab) -> some View {
        if audioPlayer.miniPlayerSuppressedByTab != tab.rawValue {
            MiniPlayerView(onOpenSong: { songToOpen = SongSheetTarget(id: $0) })
        }
    }

    /// Whether a tab shows the tab bar: hidden exactly while song-detail is on screen in that tab
    /// (song-detail.md v2 — "full-screen reader with the top toolbar and NO bottom tab bar"),
    /// visible otherwise.
    ///
    /// Owned by the tab root rather than left to `SongView`'s own
    /// `.toolbar(.hidden, for: .tabBar)`, because that pushed-view modifier does not restore on pop
    /// — measured on iOS 18.5 and 26.5: one visit to the reader removed the tab bar for the rest of
    /// the session (`tabBars.count` 1 → 0; reproduced on `mono` too). A constant `.visible` here
    /// restores it, but the root's value also wins while the reader is pushed, which put the tab
    /// bar back under the verses. Binding it to the same record that gates the mini-player makes
    /// the two agree: hidden while the reader is up, visible once the reader's `onDisappear`
    /// releases the tab.
    ///
    /// Only in compact width. In a two-column layout the reader sits in the detail column and is
    /// never popped, so hiding the tab bar there strands the app without its primary navigation
    /// for the rest of the session — measured on an iPad Pro 11" simulator, where one tap on a
    /// song removed iPadOS 26's top tab bar for good (on `mono` too). The spec's "no bottom tab
    /// bar" is the phone's full-screen reader; there it still applies.
    private func tabBarVisibility(for tab: Tab) -> Visibility {
        guard horizontalSizeClass != .regular else { return .visible }
        return audioPlayer.miniPlayerSuppressedByTab == tab.rawValue ? .hidden : .visible
    }
}
