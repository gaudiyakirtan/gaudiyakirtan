import SwiftUI

struct SongListItem: View {
    let song: Song
    
    var body: some View {
        // Use NavigationLink for navigation
        NavigationLink(destination: SongView(song: song)) {
            HStack {
                // Main content
                VStack(alignment: .leading, spacing: 4) {
                    // Title and UID row
                    HStack(alignment: .center, spacing: 8) {
                        Text(song.title)
                            .font(.system(size: 14))
                            .foregroundColor(Color("primaryText"))
                            .lineLimit(1)
                        
                        Text(song.uid)
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(Color.neutral)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 2)
                            .background(Color.neutral.opacity(0.25))
                            .cornerRadius(11)
                            .lineLimit(1)
                            .fixedSize()
                        
                        Spacer()
                    }
                    
                    // Author and audio icon
                    HStack(spacing: 6) {
                        Text(song.author)
                            .font(.system(size: 14))
                            .foregroundColor(Color.neutral)
                            .lineLimit(1)
                        
                        if song.audio {
                            Image(systemName: "music.note")
                                .font(.system(size: 12))
                                .foregroundColor(Color.neutral)
                        }
                        
                        Spacer()
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .frame(height: 56)
            .padding(.horizontal, 10)
            .background(Color.backgroundOffset)
            .cornerRadius(12)
        }
        .buttonStyle(PlainButtonStyle())
    }
}
