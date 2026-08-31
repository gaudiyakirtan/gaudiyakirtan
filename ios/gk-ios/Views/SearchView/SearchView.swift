import SwiftUI

/// The Search screen (docs/screens/search.md): a live, offline, diacritic-insensitive fuzzy lookup
/// over the Manifest (titles in every script + author). Results reuse the songs-list row
/// (`SongListItem`, title in `listLanguage` + author + audio badge); tapping one opens song-detail.
/// This is the destination the Search tab and the Home/Library search affordances all resolve to.
struct SearchView: View {
    /// Autofocus the field when the screen is the Search tab (search.md "autofocus on the Search tab").
    var autofocus: Bool = true
    @StateObject private var viewModel = SearchViewModel()
    @State private var searchPhase: SearchPhase = .idle

    var body: some View {
        VStack(spacing: 12) {
            SearchBar(
                searchText: $viewModel.query,
                placeholder: "Search songs or authors",
                autofocus: autofocus
            )
            .padding(.horizontal)
            .padding(.top, 8)

            if !viewModel.hasQuery {
                idleState
            } else if viewModel.results.isEmpty {
                noResultsState
            } else {
                ScrollView {
                    LazyVStack(spacing: 8) {
                        ForEach(viewModel.results) { entry in
                            SongListItem(entry: entry)
                        }
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 16)
                }
            }

            Spacer(minLength: 0)
        }
        .background(Color.background.edgesIgnoringSafeArea(.all))
        .navigationBarHidden(true)
        .onChange(of: viewModel.results.count) { _ in updateSearchPhase() }
        .onChange(of: viewModel.hasQuery) { _ in updateSearchPhase() }
    }

    /// Marks the moment a query stops matching anything. Search is incremental, so this fires on the
    /// transition into "no matches" rather than on every keystroke that stays there.
    private func updateSearchPhase() {
        let next = SearchHaptics.phase(
            queryIsBlank: !viewModel.hasQuery,
            resultCount: viewModel.results.count
        )
        if SearchHaptics.warns(from: searchPhase, to: next) {
            AppHaptics.shared.play(.warning)
        }
        searchPhase = next
    }

    // Before typing: a light prompt (search.md leaves recent/suggested deferred — empty is fine).
    private var idleState: some View {
        VStack(spacing: 8) {
            Spacer()
            Image(systemName: "magnifyingglass")
                .font(.system(size: 34))
                .foregroundColor(Color.neutral.opacity(0.6))
            Text("Search by song title or author")
                .font(.system(size: 15))
                .foregroundColor(Color.neutral)
            Spacer()
        }
        .frame(maxWidth: .infinity)
    }

    private var noResultsState: some View {
        VStack(spacing: 8) {
            Spacer()
            Text("No matches")
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(Color("primaryText"))
            Text("Try fewer or different words.")
                .font(.system(size: 14))
                .foregroundColor(Color.neutral)
            Spacer()
        }
        .frame(maxWidth: .infinity)
    }
}

/// A non-editable search-bar lookalike used as a `NavigationLink` label on Home/Library, so tapping
/// the "search bar" there expands into the full `SearchView` (search.md: the Home/Library search
/// affordances "navigate/expand into this screen"). A real editable field can't be a link label
/// (the `TextField` would swallow the tap), so this mirrors `SearchBar`'s look without editing.
struct SearchBarButton: View {
    var placeholder: String = "Search songs or authors"

    var body: some View {
        HStack {
            Text(placeholder)
                .foregroundColor(Color.neutral)
                .font(.system(size: 16))
                .padding(.leading, 4)
            Spacer()
            Image(systemName: "magnifyingglass")
                .foregroundColor(Color.neutral)
                .font(.system(size: 16))
                .padding(.trailing, 8)
        }
        .padding(10)
        .background(Color.backgroundOffset)
        .cornerRadius(20)
    }
}

#Preview {
    NavigationView {
        SearchView(autofocus: false)
            .environmentObject(ReaderSettings())
    }
}
