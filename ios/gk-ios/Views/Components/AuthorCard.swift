import SwiftUI

struct AuthorCard: View {
    let author: Author
    
    var body: some View {
        VStack {
            AsyncImage(url: URL(string: author.image)) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                // Themed placeholder (authors ship no imagery) — use the neutral token, not a fixed
                // system gray, so it follows Gaura/Shyam (theme.md: no hardcoded colors).
                Color.neutral.opacity(0.3)
            }
            .frame(width: 80, height: 80)
            .clipShape(Circle())
            
            Text(author.name)
                .font(.subheadline)
                .multilineTextAlignment(.center)
                .lineLimit(2)
        }
        .frame(width: 120)
    }
}