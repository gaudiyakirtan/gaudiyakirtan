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
                Color.gray.opacity(0.3)
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