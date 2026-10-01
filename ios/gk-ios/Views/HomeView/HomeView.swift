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
                    header
                    HomeListenCard(fallbackSong: viewModel.listeningSong)
                    HomeBooksRail(books: viewModel.previewBooks, layout: layout)
                    songPreview
                    HomeAuthorsList(authors: viewModel.previewAuthors, songCount: viewModel.songCount(for:))
                    if !viewModel.previewTopics.isEmpty {
                        HomeTopicsLinks(topics: viewModel.previewTopics)
                    }
                    if let song = viewModel.featuredSong {
                        featuredReading(song)
                    }
                }
                .frame(width: layout.contentWidth)
                .padding(.horizontal, layout.gutter)
                .frame(maxWidth: .infinity)
                .padding(.top, HomeSpacing.lg)
                // AppNavigation's safeAreaInset measures the player; TabView reserves native
                // navigation. Add clearance inside that unobscured viewport, not a guessed bar height.
                .padding(.bottom, HomeSpacing.xl + HomeSpacing.lg)
            }
            .accessibilityIdentifier("home.scroll")
        }
        .background(Color.background.ignoresSafeArea())
        .sheet(isPresented: $viewModel.showSettings) {
            SettingsSheet(isPresented: $viewModel.showSettings, settings: readerSettings)
        }
    }

    @ViewBuilder
    private var songPreview: some View {
        if !viewModel.previewSongs.isEmpty {
            HomeSongPreview(songs: viewModel.previewSongs)
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: HomeSpacing.md) {
            brandTitle
                .padding(HomeSpacing.xs) // Keep the display face's ink clear of its em box.
                .accessibilityIdentifier("home.brand")

            HStack(alignment: .top, spacing: HomeSpacing.md) {
                NavigationLink(destination: SearchView(autofocus: true)) {
                    HStack(spacing: HomeSpacing.md) {
                        HomeSearchSymbol()
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
                .buttonStyle(HomeControlStyle(surface: .clear, outlined: true))
                .accessibilityIdentifier("home.search")

                Button { viewModel.showSettings = true } label: {
                    Image(systemName: "gearshape")
                        .font(.title3)
                        .foregroundStyle(Color.primaryText)
                        .frame(minWidth: 44, minHeight: 44)
                }
                .buttonStyle(HomeControlStyle(surface: .clear, bordered: false, standalone: true))
                .accessibilityLabel("Settings")
                .accessibilityIdentifier("home.settings")
            }
        }
    }

    private var brandTitle: some View {
        Text("Śrī Gaudiya Kirtan")
            .font(.brandDisplay(size: 28, relativeTo: .title))
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
