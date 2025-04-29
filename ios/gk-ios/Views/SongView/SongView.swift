import SwiftUI

struct SongView: View {
    let song: Song
    let verses: [Verse]
    @Environment(\.presentationMode) var presentationMode
    
    init(song: Song, verses: [Verse] = SampleData.verses) {
        self.song = song
        // Filter verses that would be associated with this song
        // In a real app, this would come from a relationship or the API
        self.verses = verses
        
        // Hide the tab bar when this view appears
        UITabBar.appearance().isHidden = true
    }
    
    // On disappear, show the tab bar again
    private func showTabBar() {
        UITabBar.appearance().isHidden = false
    }
    
    var body: some View {
        ZStack(alignment: .top) {
            // Background color
            Color.background.edgesIgnoringSafeArea(.all)
            
            // Custom back button
            VStack {
                HStack {
                    Button(action: {
                        // Show tab bar before dismissing
                        UITabBar.appearance().isHidden = false
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
                }
                
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        // Header with song info
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text(song.title)
                                    .font(.title)
                                    .fontWeight(.bold)
                                    .foregroundColor(Color("primaryText"))
                                
                                Spacer()
                                
                                Text(song.uid)
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(Color.neutral)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 4)
                                    .background(Color.neutral.opacity(0.25))
                                    .cornerRadius(11)
                            }
                            
                            HStack {
                                Text(song.author)
                                    .font(.headline)
                                    .foregroundColor(Color.neutral)
                                
                                if song.audio {
                                    Image(systemName: "music.note")
                                        .foregroundColor(Color.highlight)
                                        .font(.system(size: 14))
                                }
                                
                                Spacer()
                            }
                            
                            // Tags
                            if !song.tags.isEmpty {
                                ScrollView(.horizontal, showsIndicators: false) {
                                    HStack {
                                        ForEach(song.tags, id: \.self) { tag in
                                            Text(tag)
                                                .font(.system(size: 14))
                                                .foregroundColor(Color.neutral)
                                                .padding(.horizontal, 10)
                                                .padding(.vertical, 4)
                                                .background(Color.neutral.opacity(0.25))
                                                .cornerRadius(10)
                                        }
                                    }
                                }
                            }
                        }
                        .padding(.horizontal)
                        
                        Divider()
                            .padding(.horizontal)
                        
                        // Verses
                        VStack(alignment: .leading, spacing: 30) {
                            ForEach(verses) { verse in
                                VerseView(verse: verse)
                                    .padding(.horizontal)
                                    .padding(.vertical, 10)
                                    .background(Color.backgroundOffset)
                                    .cornerRadius(12)
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
        .onDisappear {
            // Ensure tab bar is shown when navigating back
            UITabBar.appearance().isHidden = false
        }
    }
}