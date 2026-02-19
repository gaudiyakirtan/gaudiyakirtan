import SwiftUI

struct SongView: View {
    let song: Song
    let verses: [Verse]
    @Environment(\.presentationMode) var presentationMode
    @State private var fontSize: CGFloat = 14
    @State private var showOriginal = true
    @State private var showTransliteration = true
    @State private var showWordToWord = true
    @State private var showTranslation = true
    @State private var showReaderSettings = false
    @State private var isBookmarked: Bool = false
    @State private var showQueue: Bool = false
    @State private var showShare: Bool = false

    private let bookmarkedSongIds = ["N3", "S1", "E4"]

    init(song: Song, verses: [Verse]? = nil) {
        self.song = song
        self.verses = verses ?? SampleData.versesForSong(uid: song.uid)
    }

    var body: some View {
        ZStack(alignment: .top) {
            Color.background.edgesIgnoringSafeArea(.all)

            VStack {
                // Top bar
                HStack {
                    Button(action: {
                        presentationMode.wrappedValue.dismiss()
                    }) {
                        HStack {
                            Image(systemName: "chevron.left")
                                .foregroundColor(Color.highlight)
                            Text("Back")
                                .foregroundColor(Color.highlight)
                        }
                        .padding(.leading, 16)
                        .padding(.top, 16)
                    }
                    Spacer()
                    HStack(spacing: 20) {
                        Button(action: { showQueue = true }) {
                            Image(systemName: "list.bullet")
                                .foregroundColor(Color.highlight)
                        }
                        Button(action: {
                            withAnimation(.easeInOut(duration: 0.2)) {
                                showReaderSettings.toggle()
                            }
                        }) {
                            Image(systemName: "textformat.size")
                                .foregroundColor(Color.highlight)
                        }
                        Button(action: {
                            isBookmarked.toggle()
                        }) {
                            Image(systemName: isBookmarked ? "bookmark.fill" : "bookmark")
                                .foregroundColor(Color.highlight)
                        }
                        Button(action: { showShare = true }) {
                            Image(systemName: "square.and.arrow.up")
                                .foregroundColor(Color.highlight)
                        }
                    }
                    .padding(.trailing, 16)
                    .padding(.top, 16)
                }

                ScrollView {
                    VStack(spacing: 20) {
                        // Header
                        VStack(spacing: 8) {
                            Text(song.title)
                                .font(.system(size: 34, weight: .bold))
                                .foregroundColor(Color.highlight)
                                .multilineTextAlignment(.center)
                                .frame(maxWidth: .infinity, alignment: .center)

                            Text(song.author)
                                .font(.system(size: 18, weight: .regular))
                                .foregroundColor(Color("primaryText"))
                                .multilineTextAlignment(.center)
                                .frame(maxWidth: .infinity, alignment: .center)
                        }
                        .padding(.horizontal)

                        // Verses
                        VStack(alignment: .leading, spacing: 40) {
                            ForEach(Array(verses.enumerated()), id: \.element.id) { index, verse in
                                VerseView(
                                    verse: verse,
                                    verseNumber: index + 1,
                                    fontSize: fontSize,
                                    showOriginal: showOriginal,
                                    showTransliteration: showTransliteration,
                                    showWordToWord: showWordToWord,
                                    showTranslation: showTranslation
                                )
                                .padding(.horizontal)
                            }
                        }

                        Spacer(minLength: 50)
                    }
                    .padding(.top, 20)
                }
                .padding(.top, 10)
            }

            // Reader settings dropdown overlay
            if showReaderSettings {
                Color.black.opacity(0.01)
                    .edgesIgnoringSafeArea(.all)
                    .onTapGesture {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            showReaderSettings = false
                        }
                    }

                VStack {
                    HStack {
                        Spacer()
                        ReaderSettingsView(
                            fontSize: $fontSize,
                            showOriginal: $showOriginal,
                            showTransliteration: $showTransliteration,
                            showWordToWord: $showWordToWord,
                            showTranslation: $showTranslation
                        )
                        .background(Color.background)
                        .cornerRadius(12)
                        .shadow(color: Color.black.opacity(0.15), radius: 12, x: 0, y: 4)
                        .padding(.trailing, 16)
                    }
                    .padding(.top, 52)
                    Spacer()
                }
            }
        }
        .navigationBarHidden(true)
        .toolbar(.hidden, for: .tabBar)
        .onAppear {
            isBookmarked = bookmarkedSongIds.contains(song.uid)
        }
        .sheet(isPresented: $showQueue) {
            QueueSheetView(song: song)
        }
        .sheet(isPresented: $showShare) {
            ShareSheetView(text: "\(song.title) by \(song.author)\nhttps://gaudiyakirtan.com/songs/\(song.uid)")
        }
    }
}

// MARK: - Reader Settings Popover
struct ReaderSettingsView: View {
    @Binding var fontSize: CGFloat
    @Binding var showOriginal: Bool
    @Binding var showTransliteration: Bool
    @Binding var showWordToWord: Bool
    @Binding var showTranslation: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Font Size
            VStack(alignment: .leading, spacing: 8) {
                Text("Font Size")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(Color.neutral)
                HStack(spacing: 12) {
                    Text("A")
                        .font(.system(size: 12))
                        .foregroundColor(Color.neutral)
                    Slider(value: $fontSize, in: 10...22, step: 1)
                        .tint(Color.highlight)
                    Text("A")
                        .font(.system(size: 20))
                        .foregroundColor(Color.neutral)
                }
            }

            Divider()

            // Display toggles
            VStack(alignment: .leading, spacing: 4) {
                Text("Display")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(Color.neutral)
                Toggle("Original Script", isOn: $showOriginal)
                    .tint(Color.highlight)
                Toggle("Transliteration", isOn: $showTransliteration)
                    .tint(Color.highlight)
                Toggle("Synonyms", isOn: $showWordToWord)
                    .tint(Color.highlight)
                Toggle("Translation", isOn: $showTranslation)
                    .tint(Color.highlight)
            }
            .font(.system(size: 15))
        }
        .padding(16)
        .frame(width: 280)
    }
}

// MARK: - Queue Sheet
struct QueueSheetView: View {
    let song: Song
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationView {
            VStack {
                if song.audio {
                    List {
                        Text("Track 1")
                            .foregroundColor(Color("primaryText"))
                        Text("Track 2")
                            .foregroundColor(Color("primaryText"))
                    }
                    .listStyle(.plain)
                } else {
                    VStack(spacing: 16) {
                        Spacer()
                        Image(systemName: "music.note.list")
                            .font(.system(size: 40))
                            .foregroundColor(Color.neutral)
                        Text("No audio tracks available")
                            .foregroundColor(Color.neutral)
                        Spacer()
                    }
                }
            }
            .navigationTitle("Tracks")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                        .foregroundColor(Color.highlight)
                }
            }
        }
    }
}

// MARK: - Share Sheet
struct ShareSheetView: UIViewControllerRepresentable {
    let text: String

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: [text], applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
