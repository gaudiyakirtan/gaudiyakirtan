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

    /// How far the live tab bar rises above the window's own bottom safe area, measured from UIKit
    /// (`TabBarOverhangReader`). Zero until the first layout, and zero on any OS where the lookup
    /// fails — which degrades to the previous overlapping layout rather than to a crash or a gap.
    @State private var tabBarOverhang: CGFloat = 0

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
                    // Re-assert the tab bar on the way back out of the reader. `SongView` hides it
                    // with `.toolbar(.hidden, for: .tabBar)` for its full-screen layout and has
                    // always claimed the modifier "restores automatically when this view is
                    // popped" — on iOS 26 it does not. Measured: open any song, tap Back, and the
                    // tab bar is gone for the rest of the session (`tabBars.count` 1 → 0, all four
                    // items gone from the screen and from the accessibility tree), and the bottom
                    // safe area collapses to the window, which then drops the mini-player on top of
                    // where the tab bar used to be. Stating `.visible` on the tab root makes the
                    // pop restore explicit instead of relying on that.
                    .toolbar(.visible, for: .tabBar)
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
                    .toolbar(.visible, for: .tabBar)
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
                    .toolbar(.visible, for: .tabBar)
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
                    .toolbar(.visible, for: .tabBar)
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
        // The gate does not include `hasActiveTrack`: as of player.md **v15** the slot is not
        // playback-gated, it keeps showing the last visited song when nothing is loaded ("The
        // mini-player is never empty"). Deciding between the two states — and rendering nothing at
        // all on a fresh install — belongs to `MiniPlayerView`/`resolveMiniPlayerSlot`, which have
        // the persisted uid; the empty case yields an `EmptyView` and so a zero-height inset.
        //
        // It is still hidden on song-detail (player.md v14 "The reader gets a pill, not a bar").
        // The inset is owned by this root `TabView`, so the reader screen can't remove it directly —
        // it records *its tab* on the shared player service and this gate compares that against the
        // selected tab. Playback is untouched either way.
        //
        // The comparison is what makes it correct across tab switches: song-detail suppresses only
        // the tab it is on, so switching away shows the bar and switching back hides it again with
        // nothing to clear and nothing to re-set. An earlier `Bool` had to be cleared on every tab
        // change, including the change *back*, which raced `SongView.onAppear` and could draw the
        // full-width bar over the verses.
        .safeAreaInset(edge: .bottom) {
            if audioPlayer.miniPlayerSuppressedByTab != selection.rawValue {
                MiniPlayerView(onOpenSong: { songToOpen = SongSheetTarget(id: $0) })
                    // Load-bearing, not cosmetic. A bottom `safeAreaInset` on a `TabView` is laid
                    // out against the *window's* safe area — the 34 pt home-indicator strip — and
                    // not above the tab bar, so without this the bar lands directly on top of it.
                    // Measured on iOS 26.5 / iPhone 17 Pro with the reader never opened (so the
                    // tab bar is definitely present): tab bar 791–874, bar 784–840. Offsetting by
                    // the bar's overhang above that safe area (49 pt here) lifts it clear.
                    .padding(.bottom, tabBarOverhang)
            }
        }
        // Measures the live tab bar for the offset above. Zero-size, non-interactive, and behind
        // everything, so it cannot affect layout or hit-testing.
        .background(TabBarOverhangReader(overhang: $tabBarOverhang))
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

/// Measures how far the live `UITabBar` rises above the window's own bottom safe area.
///
/// The mini-player needs this because a SwiftUI `safeAreaInset(edge: .bottom)` on a `TabView` is
/// laid out against the *window's* safe area, not against the tab bar — so without an explicit
/// offset the bar covers it. See the inset in `AppNavigation.body` for the measurements.
///
/// It reads the real bar rather than using a constant because the value is not one number: it
/// differs by device, by whether a home indicator exists, and by OS generation (iOS 26's floating
/// tab bar is not iOS 17's docked one). `frame.height` minus `safeAreaInsets.bottom` isolates the
/// part the inset does not already account for — 83 − 34 = 49 pt on an iPhone 17 Pro on iOS 26.5.
///
/// The framework's own answer to this is `tabViewBottomAccessory`, which is iOS 26-only and absent
/// from the iOS 18 SDK that CI builds against, so it is not an option here.
///
/// Failure is silent and safe: if no tab bar is found the overhang stays 0, which is exactly the
/// layout this app had before, rather than a crash or a floating gap.
private struct TabBarOverhangReader: UIViewRepresentable {
    @Binding var overhang: CGFloat

    func makeUIView(context: Context) -> ProbeView {
        let view = ProbeView()
        view.isUserInteractionEnabled = false
        view.onMeasure = { report($0) }
        return view
    }

    func updateUIView(_ view: ProbeView, context: Context) {
        // Rebind: `self` is a fresh struct on every update, so the closure captured in
        // `makeUIView` holds a stale `Binding`.
        view.onMeasure = { report($0) }
        view.measure()
    }

    private func report(_ measured: CGFloat) {
        // Guards the pre-layout zero, and no-op writes that would otherwise re-render the whole
        // tab tree on every layout pass.
        guard measured > 0, abs(measured - overhang) > 0.5 else { return }
        overhang = measured
    }

    /// Re-measures whenever it enters a window or is laid out, because the tab bar usually has no
    /// height yet the first time SwiftUI asks.
    final class ProbeView: UIView {
        var onMeasure: ((CGFloat) -> Void)?

        override func didMoveToWindow() {
            super.didMoveToWindow()
            measure()
        }

        override func layoutSubviews() {
            super.layoutSubviews()
            measure()
        }

        func measure() {
            // Deferred: during a layout pass the tab bar may not have its final frame, and writing
            // to a `@Binding` inside a SwiftUI update pass is a mutation-during-update.
            DispatchQueue.main.async { [weak self] in
                guard let self,
                      let tabBar = self.window?.rootViewController?.tabBarInHierarchy
                else { return }
                self.onMeasure?(tabBar.frame.height - tabBar.safeAreaInsets.bottom)
            }
        }
    }
}

private extension UIViewController {
    /// The tab bar of the first `UITabBarController` in this controller's subtree. Searched from
    /// the window root rather than up the responder chain, because SwiftUI hosts the probe outside
    /// the tab-bar controller — walking up from it never reaches one.
    var tabBarInHierarchy: UITabBar? {
        if let tabBarController = self as? UITabBarController { return tabBarController.tabBar }
        for child in children {
            if let found = child.tabBarInHierarchy { return found }
        }
        return presentedViewController?.tabBarInHierarchy
    }
}
