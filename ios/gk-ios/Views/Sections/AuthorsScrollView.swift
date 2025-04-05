// Views/Sections/AuthorsScrollView.swift
import SwiftUI

struct AuthorsScrollView: View {
    let authors: [Author]
    
    var body: some View {
        VStack(alignment: .leading) {
            Text("Authors")
                .font(.title2)
                .fontWeight(.bold)
                .padding()
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(authors) { author in
                        AuthorCard(author: author)
                    }
                }
            }
        }
    }
}
