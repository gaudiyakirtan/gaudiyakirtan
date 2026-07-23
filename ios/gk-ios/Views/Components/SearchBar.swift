import SwiftUI

struct SearchBar: View {
    @Binding var searchText: String
    var placeholder: String = "Search"
    /// When true, the field takes keyboard focus shortly after appearing (docs/screens/search.md —
    /// "autofocus on the Search tab"). Off by default so decorative/embedded uses don't grab focus.
    var autofocus: Bool = false
    @FocusState private var isFocused: Bool

    var body: some View {
        // Search bar with icon
        HStack {
            TextField(placeholder, text: $searchText)
                .foregroundColor(Color("primaryText"))
                .font(.system(size: 16))
                .disableAutocorrection(true)
                .autocapitalization(.none)
                .padding(.leading, 4)
                .focused($isFocused)

            Spacer()
            
            if !searchText.isEmpty {
                Button(action: {
                    searchText = ""
                }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(Color.neutral)
                        .font(.system(size: 16))
                }
                .padding(.trailing, 4)
            }
            
            Image(systemName: "magnifyingglass")
                .foregroundColor(Color.neutral)
                .font(.system(size: 16))
                .padding(.trailing, 8)
        }
        .padding(10)
        .background(Color.backgroundOffset)
        .cornerRadius(20)  // Fully rounded corners
        .onAppear {
            if autofocus {
                // Small delay so the field is in the hierarchy before requesting focus.
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) { isFocused = true }
            }
        }
    }
}

#Preview {
    SearchBar(searchText: .constant(""), placeholder: "Search for something...")
}
