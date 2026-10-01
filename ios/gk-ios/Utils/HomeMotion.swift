import SwiftUI

/// Theme v4 utility motion only. Navigation, sheets and the shared player keep OS/player motion.
enum HomeMotion {
    enum Token: CaseIterable {
        case instant, press, release, hover, selection, icon, panelEnter, panelExit

        var duration: Double {
            switch self {
            case .instant: return 0
            case .press: return 0.09
            case .release: return 0.14
            case .hover, .panelExit: return 0.12
            case .selection, .icon: return 0.16
            case .panelEnter: return 0.18
            }
        }
    }

    static func animation(_ token: Token, reduceMotion: Bool) -> Animation? {
        guard !reduceMotion, token != .instant else { return nil }
        switch token {
        case .icon:
            return .linear(duration: token.duration)
        case .panelExit:
            return .timingCurve(0.3, 0, 1, 1, duration: token.duration)
        default:
            return .timingCurve(0.2, 0, 0, 1, duration: token.duration)
        }
    }
}

/// A single state layer on the owning surface; only its paint animates, never the target/layout.
/// Native Button/NavigationLink owns activation and focus. There are no delayed commands.
struct HomeControlStyle: ButtonStyle {
    var cornerRadius: CGFloat = HomeShape.small
    var surface: Color = .backgroundOffset
    var stateLayer: Color = .primaryText
    var outlined: Bool = false
    var bordered: Bool = true

    func makeBody(configuration: Configuration) -> some View {
        ControlBody(configuration: configuration, cornerRadius: cornerRadius,
                    surface: surface, stateLayer: stateLayer, outlined: outlined, bordered: bordered)
    }

    private struct ControlBody: View {
        let configuration: ButtonStyleConfiguration
        let cornerRadius: CGFloat
        let surface: Color
        let stateLayer: Color
        let outlined: Bool
        let bordered: Bool
        @Environment(\.accessibilityReduceMotion) private var reduceMotion
        @Environment(\.isFocused) private var isFocused
        @State private var isHovered = false

        private var shape: RoundedRectangle {
            RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
        }

        var body: some View {
            configuration.label
                .background {
                    shape.fill(surface)
                    shape.fill(stateLayer.opacity(
                        configuration.isPressed || isFocused ? 0.10 : (isHovered ? 0.08 : 0)
                    ))
                    .animation(HomeMotion.animation(configuration.isPressed ? .press : .release,
                                                    reduceMotion: reduceMotion || isFocused),
                               value: configuration.isPressed)
                    .animation(HomeMotion.animation(.hover, reduceMotion: reduceMotion || isFocused),
                               value: isHovered)
                }
                .overlay {
                    if bordered { shape.strokeBorder(outlined ? Color.neutral : Color.border, lineWidth: 1) }
                }
                // Inset strokes keep the ring at exactly 0–2 (parent surface) and 2–4 (highlight)
                // outside the target, so shelves' 4-unit scroll padding never clips it.
                .overlay {
                    if isFocused {
                        shape.strokeBorder(Color.background, lineWidth: 2).padding(-2)
                        shape.strokeBorder(Color.highlight, lineWidth: 2).padding(-4)
                    }
                }
                .contentShape(shape)
                .onHover { isHovered = $0 }
        }
    }
}
