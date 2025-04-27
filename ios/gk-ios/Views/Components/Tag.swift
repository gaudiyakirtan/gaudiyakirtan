import SwiftUI

enum TagVariant {
    case `default`
    case highlight
    case primary
    case black
    case custom(background: Color, text: Color)
    
    func backgroundColor() -> Color {
        switch self {
        case .default:
            return Color.neutral.opacity(0.2)
        case .highlight:
            return Color.highlight.opacity(0.8)
        case .primary:
            return Color.primary.opacity(0.2)
        case .black:
            return Color.black.opacity(0.3)
        case .custom(let background, _):
            return background
        }
    }
    
    func textColor() -> Color {
        switch self {
        case .default:
            return Color.neutral
        case .highlight, .black:
            return Color.white
        case .primary:
            return Color.primary
        case .custom(_, let text):
            return text
        }
    }
}

enum TagSize {
    case small
    case normal
    case custom(fontSize: CGFloat, cornerRadius: CGFloat, horizontalPadding: CGFloat, verticalPadding: CGFloat)
    
    var fontSize: CGFloat {
        switch self {
        case .small: return 10
        case .normal: return 12
        case .custom(let fontSize, _, _, _): return fontSize
        }
    }
    
    var cornerRadius: CGFloat {
        switch self {
        case .small: return 11
        case .normal: return 10
        case .custom(_, let cornerRadius, _, _): return cornerRadius
        }
    }
    
    var horizontalPadding: CGFloat {
        switch self {
        case .small, .normal: return 10
        case .custom(_, _, let horizontalPadding, _): return horizontalPadding
        }
    }
    
    var verticalPadding: CGFloat {
        switch self {
        case .small, .normal: return 1
        case .custom(_, _, _, let verticalPadding): return verticalPadding
        }
    }
}

struct Tag: View {
    let text: String
    var variant: TagVariant = .default
    var size: TagSize = .normal
    var uppercase: Bool = false
    var customCornerRadius: CGFloat? = nil
    var action: (() -> Void)? = nil
    
    var body: some View {
        let displayText = uppercase ? text.uppercased() : text
        
        Text(displayText)
            .font(.system(size: size.fontSize, weight: .medium))
            .foregroundColor(variant.textColor())
            .padding(.horizontal, size.horizontalPadding)
            .padding(.vertical, size.verticalPadding)
            .background(variant.backgroundColor())
            .cornerRadius(customCornerRadius ?? size.cornerRadius)
            .lineLimit(1)
            .onTapGesture {
                if let action = action {
                    action()
                }
            }
    }
}

struct TagsContainer<Content: View>: View {
    let content: Content
    var spacing: CGFloat = 4
    var direction: Axis.Set = .horizontal
    var alignment: Alignment = .topLeading
    var wrap: Bool = true
    
    init(spacing: CGFloat = 4, 
         direction: Axis.Set = .horizontal, 
         alignment: Alignment = .topLeading,
         wrap: Bool = true,
         @ViewBuilder content: () -> Content) {
        self.content = content()
        self.spacing = spacing
        self.direction = direction
        self.alignment = alignment
        self.wrap = wrap
    }
    
    var body: some View {
        if direction == .horizontal {
            HStack(alignment: .center, spacing: spacing) {
                content
            }
            .fixedSize(horizontal: !wrap, vertical: true)
        } else {
            VStack(alignment: .leading, spacing: spacing) {
                content
            }
        }
    }
}

struct Tag_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 20) {
            // Default tags
            TagsContainer {
                Tag(text: "Default small", size: .small)
                Tag(text: "Default normal")
            }
            
            // Highlight tags
            TagsContainer {
                Tag(text: "Highlight small", variant: .highlight, size: .small)
                Tag(text: "Highlight normal", variant: .highlight)
            }
            
            // Primary tags
            TagsContainer {
                Tag(text: "Primary small", variant: .primary, size: .small)
                Tag(text: "Primary normal", variant: .primary)
            }
            
            // Black tags
            TagsContainer {
                Tag(text: "Black small", variant: .black, size: .small)
                Tag(text: "Black normal", variant: .black)
            }
            
            // Custom tags
            TagsContainer {
                Tag(text: "Custom", variant: .custom(background: .purple.opacity(0.2), text: .purple))
                Tag(text: "Custom Size", size: .custom(fontSize: 14, cornerRadius: 15, horizontalPadding: 15, verticalPadding: 5))
            }
            
            // Vertical container
            TagsContainer(direction: .vertical) {
                Tag(text: "Vertical 1", variant: .primary)
                Tag(text: "Vertical 2", variant: .highlight)
            }
        }
        .padding()
    }
}