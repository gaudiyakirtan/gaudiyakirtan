import SwiftUI

struct SongView: View {
    let song: Song
    let verses: [Verse]
    @Environment(\.presentationMode) var presentationMode
    @State private var fontSizeLevel: Int = 1
    @State private var isBookmarked: Bool = false
    @State private var showQueue: Bool = false
    @State private var showShare: Bool = false

    private let fontSizes: [CGFloat] = [12, 14, 16]
    private let bookmarkedSongIds = ["N3", "S1", "E4"]

    init(song: Song, verses: [Verse] = SampleData.verses) {
        self.song = song
        self.verses = verses
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
                            fontSizeLevel = (fontSizeLevel + 1) % 3
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
                                VerseView(verse: verse, verseNumber: index + 1, fontSize: fontSizes[fontSizeLevel])
                                    .padding(.horizontal)
                            }
                        }

                        Spacer(minLength: 50)
                    }
                    .padding(.top, 20)
                }
                .padding(.top, 10)
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
