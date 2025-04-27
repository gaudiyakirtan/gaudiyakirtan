import SwiftUI

enum TagVariant {
    case `default`
    case highlight
    case primary
    case black
    
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
        }
    }
}

enum TagSize {
    case small
    case normal
    
    var fontSize: CGFloat {
        switch self {
        case .small: return 10
        case .normal: return 12
        }
    }
    
    var cornerRadius: CGFloat {
        switch self {
        case .small: return 11
        case .normal: return 10
        }
    }
    
    var horizontalPadding: CGFloat {
        return 10
    }
    
    var verticalPadding: CGFloat {
        return 1
    }
}

struct Tag: View {
    let text: String
    var variant: TagVariant = .default
    var size: TagSize = .normal
    var uppercase: Bool = false
    var action: (() -> Void)? = nil
    
    var body: some View {
        let displayText = uppercase ? text.uppercased() : text
        
        Text(displayText)
            .font(.system(size: size.fontSize, weight: .medium))
            .foregroundColor(variant.textColor())
            .padding(.horizontal, size.horizontalPadding)
            .padding(.vertical, size.verticalPadding)
            .background(variant.backgroundColor())
            .cornerRadius(size.cornerRadius)
            .lineLimit(1)
            .onTapGesture {
                if let action = action {
                    action()
                }
            }
    }
}

struct Tag_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 10) {
            // Default tags
            HStack(spacing: 4) {
                Tag(text: "Default small", size: .small)
                Tag(text: "Default normal")
            }
            
            // Highlight tags
            HStack(spacing: 4) {
                Tag(text: "Highlight small", variant: .highlight, size: .small)
                Tag(text: "Highlight normal", variant: .highlight)
            }
            
            // Primary tags
            HStack(spacing: 4) {
                Tag(text: "Primary small", variant: .primary, size: .small)
                Tag(text: "Primary normal", variant: .primary)
            }
            
            // Black tags
            HStack(spacing: 4) {
                Tag(text: "Black small", variant: .black, size: .small)
                Tag(text: "Black normal", variant: .black)
            }
            
            // Uppercase tags
            HStack(spacing: 4) {
                Tag(text: "Uppercase", uppercase: true)
                Tag(text: "N3", variant: .black, size: .small, uppercase: true)
            }
        }
        .padding()
    }
}
