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
                            .background(selection == category ? Color.primary : Color.backgroundOffset)
                            .foregroundColor(selection == category ? Color.background : Color.neutral)
                            .cornerRadius(16)
                    }
                }
            }
            .padding(.horizontal)
        }
    }
}

#Preview {
    struct PreviewCategory: Identifiable, RawRepresentable {
        var id: String { rawValue }
        var rawValue: String
        
        init(rawValue: String) {
            self.rawValue = rawValue
        }
        
        static let category1 = PreviewCategory(rawValue: "Category 1")
        static let category2 = PreviewCategory(rawValue: "Category 2")
        static let category3 = PreviewCategory(rawValue: "Category 3")
    }
    
    return CategorySelector(
        selection: .constant(PreviewCategory.category1),
        categories: [
            PreviewCategory.category1,
            PreviewCategory.category2,
            PreviewCategory.category3
        ]
    )
    .previewLayout(.sizeThatFits)
}