import SwiftUI

struct SongView: View {
    let song: Song
    let verses: [Verse]
    @Environment(\.presentationMode) var presentationMode
    
    init(song: Song, verses: [Verse] = SampleData.verses) {
        self.song = song
        self.verses = verses
    }
    
    var body: some View {
        ZStack(alignment: .top) {
            // Background color
            Color.background.edgesIgnoringSafeArea(.all)
            
            // Custom back button
            VStack {
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
                        Button(action: { }) {
                            Image(systemName: "list.bullet")
                                .foregroundColor(Color.highlight)
                        }
                        Button(action: { }) {
                            Image(systemName: "textformat.size")
                                .foregroundColor(Color.highlight)
                        }
                        Button(action: { }) {
                            Image(systemName: "bookmark")
                                .foregroundColor(Color.highlight)
                        }
                        Button(action: { }) {
                            Image(systemName: "square.and.arrow.up")
                                .foregroundColor(Color.highlight)
                        }
                    }
                    .padding(.trailing, 16)
                    .padding(.top, 16)
                }

                ScrollView {
                    VStack(spacing: 20) {
                        // Header with song info
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
                                VerseView(verse: verse, verseNumber: index + 1)
                                    .padding(.horizontal)
                            }
                        }
                        
                        Spacer(minLength: 50)
                    }
                    .padding(.top, 20)
                }
                .padding(.top, 10) // Add some space below the back button
            }
        }
        .navigationBarHidden(true)
        .toolbar(.hidden, for: .tabBar)
    }
}