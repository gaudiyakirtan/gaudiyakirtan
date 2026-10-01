import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    @EnvironmentObject private var readerSettings: ReaderSettings
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    var body: some View {
        GeometryReader { geometry in
            let layout = HomeLayout(availableWidth: geometry.size.width,
                                    accessibilitySize: dynamicTypeSize >= .xxxLarge)
            ScrollView {
                LazyVStack(alignment: .leading, spacing: layout.moduleGap) {
                    header(layout: layout)
                    primaryModules(layout: layout)
                    discoveryModules(layout: layout)
                    if !viewModel.previewTopics.isEmpty {
                        HomeTopicsGrid(topics: viewModel.previewTopics, layout: layout)
                    }
                    if let song = viewModel.featuredSong {
                        featuredReading(song)
                    }
                }
                .frame(width: layout.contentWidth)
                .padding(.horizontal, layout.gutter)
                .frame(maxWidth: .infinity)
                .padding(.top, HomeSpacing.xl)
                // AppNavigation's safeAreaInset measures the player; TabView reserves native
                // navigation. Add clearance inside that unobscured viewport, not a guessed bar height.
                .padding(.bottom, HomeSpacing.xl + HomeSpacing.lg)
            }
            .accessibilityIdentifier("home.scroll")
        }
        .background(HomePalette.canvas.ignoresSafeArea())
        .sheet(isPresented: $viewModel.showSettings) {
            SettingsSheet(isPresented: $viewModel.showSettings, settings: readerSettings)
        }
    }

    @ViewBuilder
    private func primaryModules(layout: HomeLayout) -> some View {
        if layout.stackedModules {
            HomeListenCard(fallbackSong: viewModel.listeningSong)
            songPreview
        } else {
            HStack(alignment: .top, spacing: layout.moduleGap) {
                HomeListenCard(fallbackSong: viewModel.listeningSong)
                    .frame(width: (layout.contentWidth - layout.moduleGap) * 0.44)
                songPreview.padding(.top, 20)
            }
        }
    }

    @ViewBuilder
    private var songPreview: some View {
        if !viewModel.previewSongs.isEmpty {
            HomeSongPreview(songs: viewModel.previewSongs, catalogCount: viewModel.songs.count)
        }
    }

    @ViewBuilder
    private func discoveryModules(layout: HomeLayout) -> some View {
        let hasBooks = !viewModel.previewBooks.isEmpty
        let hasAuthors = !viewModel.previewAuthors.isEmpty
        if !layout.stackedModules && hasBooks && hasAuthors {
            HStack(alignment: .top, spacing: layout.moduleGap) {
                HomeBooksCard(books: viewModel.previewBooks, layout: layout)
                    .frame(width: (layout.contentWidth - layout.moduleGap) * 0.58)
                HomeAuthorsCard(authors: viewModel.previewAuthors, songCount: viewModel.songCount(for:))
                    .padding(.top, 32)
            }
        } else {
            if hasBooks { HomeBooksCard(books: viewModel.previewBooks, layout: layout) }
            if hasAuthors { HomeAuthorsCard(authors: viewModel.previewAuthors, songCount: viewModel.songCount(for:)) }
        }
    }

    private func header(layout: HomeLayout) -> some View {
        VStack(alignment: .leading, spacing: HomeSpacing.lg) {
            ViewThatFits(in: .horizontal) {
                HStack(spacing: HomeSpacing.md) {
                    brandTitle(expanded: layout.isExpanded)
                        .fixedSize(horizontal: true, vertical: false)
                    // The existing multi-colour artwork; template rendering would flatten it.
                    Image("mridanga")
                        .resizable()
                        .scaledToFit()
                        .frame(width: (layout.isExpanded ? 40 : 36) * 745.0 / 490.0,
                               height: layout.isExpanded ? 40 : 36)
                        .accessibilityHidden(true)
                        .allowsHitTesting(false)
                }
                // Hide the mark before compressing the heading. No clipping or synthetic bold.
                brandTitle(expanded: layout.isExpanded)
            }
            .padding(HomeSpacing.xs) // The display face's ink extends beyond its em box.
            .accessibilityIdentifier("home.brand")

            HStack(alignment: .top, spacing: HomeSpacing.md) {
                NavigationLink(destination: SearchView(autofocus: true)) {
                    HStack(spacing: HomeSpacing.md) {
                        Image(systemName: "magnifyingglass")
                            .foregroundStyle(Color.primaryText)
                            .accessibilityHidden(true)
                        Text("Search songs or authors")
                            .foregroundStyle(Color.primaryText)
                            .fixedSize(horizontal: false, vertical: true)
                        Spacer(minLength: 0)
                    }
                    .font(.body)
                    .padding(.horizontal, HomeSpacing.md)
                    .padding(.vertical, HomeSpacing.sm)
                    .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
                }
                .buttonStyle(HomeControlStyle(cornerRadius: 16, surface: HomePalette.card, outlined: true))
                .accessibilityIdentifier("home.search")

                Button { viewModel.showSettings = true } label: {
                    Image(systemName: "gearshape")
                        .font(.title3)
                        .foregroundStyle(HomePalette.ink)
                        .frame(minWidth: 44, minHeight: 44)
                }
                // Named lookup: `AccentColor` and `accent` assets would both generate `Color.accent`.
                .buttonStyle(HomeControlStyle(cornerRadius: 16, surface: HomePalette.mutedSurface, bordered: false))
                .accessibilityLabel("Settings")
                .accessibilityIdentifier("home.settings")
            }
        }
    }

    private func brandTitle(expanded: Bool) -> some View {
        Text("Śrī Gaudiya Kirtan")
            .font(.brandDisplay(size: expanded ? 34 : 28,
                                relativeTo: expanded ? .largeTitle : .title))
            .foregroundStyle(Color.primaryText)
            .fixedSize(horizontal: false, vertical: true)
            .accessibilityAddTraits(.isHeader)
    }

    private func featuredReading(_ song: Song) -> some View {
        VStack(alignment: .leading, spacing: HomeSpacing.lg) {
            HomeSectionHeading(title: "Featured reading")
            VStack(spacing: HomeSpacing.xs) {
                Text(song.title(inScript: readerSettings.scriptCode))
                    .font(.title2.weight(.semibold))
                    .foregroundStyle(Color.primaryText)
                    .accessibilityAddTraits(.isHeader)
                Text(song.author(inScript: readerSettings.scriptCode))
                    .font(.subheadline)
                    .foregroundStyle(Color.secondaryText)
                RowUidChip(uid: song.uid)
            }
            .multilineTextAlignment(.center)
            .frame(maxWidth: .infinity)

            ForEach(song.verses) { verse in
                VerseView(verse: verse, options: readerSettings.verseOptions(), homeReading: true)
                    .padding(.vertical, HomeSpacing.sm)
                    .accessibilityIdentifier("home.featured.verse.\(verse.id)")
            }
        }
        .frame(maxWidth: 680)
        .frame(maxWidth: .infinity)
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("home.featured")
    }
}
