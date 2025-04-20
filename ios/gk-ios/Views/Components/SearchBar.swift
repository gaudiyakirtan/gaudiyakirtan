import SwiftUI

struct SearchBar: View {
    @Binding var searchText: String
    var placeholder: String = "Search"
    
    var body: some View {
        // Search bar with icon
        HStack {
            TextField(placeholder, text: $searchText)
                .foregroundColor(Color("primaryText"))
                .font(.system(size: 16))
                .disableAutocorrection(true)
                .autocapitalization(.none)
                .padding(.leading, 4)
            
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
    }
}

#Preview {
    SearchBar(searchText: .constant(""), placeholder: "Search for something...")
}
