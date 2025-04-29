import SwiftUI

struct SongCard: View {
    let song: Song
    private let smBreakpoint: CGFloat = 640
    
    var body: some View {
        // Use NavigationLink with isActive for better control
        NavigationLink(destination: SongView(song: song)) {
            GeometryReader { geometry in
                HStack {
                    // Main content
                    VStack(alignment: .leading, spacing: 4) {
                        // Title and UID row
                        HStack(alignment: .center) {
                            Text(song.title)
                                .font(.system(size: 14))
                                .foregroundColor(Color("primaryText"))
                                .lineLimit(1)
                                .layoutPriority(1)
                            
                            Text(song.uid)
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(Color.neutral)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 2)
                                .background(Color.neutral.opacity(0.25))
                                .cornerRadius(11)
                                .lineLimit(1)
                                .fixedSize()
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
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    
                    // Tags - Only show when width > smBreakpoint
                    if geometry.size.width > smBreakpoint {
                        HStack(spacing: 4) {
                            ForEach(song.tags.reversed(), id: \.self) { tag in
                                Text(tag)
                                    .font(.system(size: 12))
                                    .foregroundColor(Color.neutral)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 4)
                                    .background(Color.neutral.opacity(0.25))
                                    .cornerRadius(10)
                            }
                        }
                        .layoutPriority(0)
                    }
                }
                .frame(height: 56)
                .padding(.horizontal, 10)
                .background(Color.backgroundOffset)
                .cornerRadius(12)
            }
            .frame(height: 56)
        }
        .buttonStyle(PlainButtonStyle())
    }
}
