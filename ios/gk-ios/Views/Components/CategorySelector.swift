import SwiftUI

struct CategorySelector<T: Identifiable & RawRepresentable>: View where T.RawValue == String {
    @Binding var selection: T
    let categories: [T]
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(categories) { category in
                    Button(action: {
                        selection = category
                    }) {
                        Text(category.rawValue)
                            .font(.system(size: 14, weight: .medium))
                            .padding(.vertical, 8)
                            .padding(.horizontal, 16)
                            .background(selection == category ? Color.highlight : Color.backgroundOffset)
                            .foregroundColor(selection == category ? Color.background : Color.neutral)
                            .cornerRadius(16)
                    }
                }
            }
            .padding(.horizontal)
        }
    }
}
