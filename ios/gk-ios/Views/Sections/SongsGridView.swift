// Views/Sections/SongsGridView.swift
import SwiftUI

struct SongsGridView: View {
    let songs: [Song]
    
    var body: some View {
        VStack(alignment: .leading) {
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 16) {
                ForEach(songs) { song in
                    SongCard(song: song)
                }
            }
        }
    }
}
