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
                            // Selected pill text sits on the `highlight` fill — use `onHighlight`
                            // (near-black in Shyam, white in Gaura), not the unrelated `background`
                            // token, per theme.md's on-accent contrast rule.
                            .foregroundColor(selection == category ? Color("onHighlight") : Color.neutral)
                            .cornerRadius(16)
                    }
                }
            }
            .padding(.horizontal)
        }
    }
}
