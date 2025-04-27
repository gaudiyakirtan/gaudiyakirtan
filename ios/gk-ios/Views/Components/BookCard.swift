import SwiftUI

struct BookCard: View {
    let book: Book
    var compactSize: Bool = false
    
    var body: some View {
        ZStack {
            backgroundLayer
            gradientOverlays
            contentLayer
            
            // Metadata badges
            VStack {
                HStack {
                    Spacer()
                    VStack(alignment: .trailing, spacing: 6) {
                        // Song count badge
                        if let songCount = book.songCount, songCount > 0 {
                            Tag(
                                text: "\(songCount) songs",
                                variant: .highlight,
                                size: .custom(fontSize: 10, cornerRadius: 11, horizontalPadding: 10, verticalPadding: 4)
                            )
                        }
                        
                        // Year badge
                        if let year = book.year {
                            Tag(
                                text: year,
                                variant: .black,
                                size: .custom(fontSize: 10, cornerRadius: 11, horizontalPadding: 10, verticalPadding: 4)
                            )
                        }
                    }
                    .padding(12)
                }
                Spacer()
            }
        }
        .frame(width: 144, height: 192)
        .cornerRadius(8)
        .clipped()
    }
    
    private var backgroundLayer: some View {
        Group {
            if let imageUrl = book.image {
                AsyncImage(url: URL(string: imageUrl)) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Color.gray
                }
            }
        }
    }
    
    private var gradientOverlays: some View {
        ZStack {
            // Color Overlay Gradient
            LinearGradient(
                gradient: Gradient(colors: [getMediaColor(media: book.title), Color.white.opacity(0)]),
                startPoint: .bottom,
                endPoint: .top
            )
            
            // Vertical Bottom Gradient
            LinearGradient(
                gradient: Gradient(colors: [.black.opacity(0.5), .clear]),
                startPoint: .bottom,
                endPoint: .top
            )
            
            // Horizontal Left Gradient
            horizontalLeftGradient
        }
    }
    
    private var horizontalLeftGradient: some View {
        LinearGradient(
            gradient: Gradient(stops: [
                .init(color: Color.background, location: 0),
                .init(color: Color.background.opacity(0), location: 0.0258),
                .init(color: Color.background.opacity(0.5), location: 0.0515),
                .init(color: Color.background.opacity(0), location: 0.08),
                .init(color: Color.background.opacity(0), location: 1),
            ]),
            startPoint: .leading,
            endPoint: .trailing
        )
    }
    
    private var contentLayer: some View {
        VStack(alignment: .leading) {
            Spacer()
            VStack(alignment: .leading, spacing: 2) {
            Text(book.title)
                .font(.system(size: 18, weight: .black))
                .foregroundColor(.white)
                .lineSpacing(0)
                .lineLimit(3)
                .fixedSize(horizontal: false, vertical: true)
                .frame(maxWidth: 100, alignment: .leading)
            
                if let author = book.author {
                    Text(author)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.white)
                    .lineLimit(2)
                    .fixedSize(horizontal: false, vertical: true)
                    .frame(maxWidth: 100, alignment: .leading)
                }
            }
            .padding(.bottom, 24)
        }
    }
}
