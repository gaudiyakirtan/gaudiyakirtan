import SwiftUI

/// A tasteful placeholder for a browse surface with no data (docs/screens/browse.md "Empty
/// groupings": the corpus ships no books/topics/collections, so those sections must render
/// **nothing or a tasteful empty state — never placeholder/fake rows**). Used by the Library
/// Topics/Books tabs and Collections, which are destinations the reader explicitly navigates to
/// (unlike Home, where an empty section is hidden outright rather than shown with this).
///
/// Purely themed via `neutral`/`primaryText` tokens so it repaints correctly under Gaura/Shyam.
struct EmptyStateView: View {
    let systemImage: String
    let title: String
    var message: String? = nil

    var body: some View {
        VStack(spacing: 8) {
            Spacer()
            Image(systemName: systemImage)
                .font(.system(size: 34))
                .foregroundColor(Color.neutral.opacity(0.6))
            Text(title)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(Color("primaryText"))
            if let message {
                Text(message)
                    .font(.system(size: 13))
                    .foregroundColor(Color.neutral)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }
            Spacer()
        }
        .frame(maxWidth: .infinity, minHeight: 200)
    }
}

#Preview {
    EmptyStateView(
        systemImage: "tag",
        title: "No topics yet",
        message: "Topic groupings will appear here once they're added to the corpus."
    )
}
