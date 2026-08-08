import SwiftUI

/// The identity of the tab a view is currently living inside, published down the tree by
/// `AppNavigation`.
///
/// It exists for one job: song-detail must suppress the root `TabView`'s mini-player inset
/// (docs/screens/player.md v14 / song-detail.md v7), and a pushed screen cannot remove a *parent's*
/// inset — so it publishes the intent onto `AudioPlayerService` instead. Recording *which* tab is
/// suppressing turns the gate into a comparison against the selected tab, which needs no clearing
/// and therefore has no ordering to race. A pushed view has no other way to learn its tab.
private struct CurrentTabIDKey: EnvironmentKey {
    /// `nil` outside the tab bar — previews, or any surface presented over the whole app.
    static let defaultValue: String? = nil
}

extension EnvironmentValues {
    var currentTabID: String? {
        get { self[CurrentTabIDKey.self] }
        set { self[CurrentTabIDKey.self] = newValue }
    }
}
