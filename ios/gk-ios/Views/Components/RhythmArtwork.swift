import SwiftUI

/// Components v7's fixed 360 × 240 vector master. No time, audio, network or random inputs.
struct RhythmArtwork: View {
    var body: some View {
        Canvas { context, size in
            let scale = min(size.width / 360, size.height / 240)
            context.translateBy(x: (size.width - 360 * scale) / 2,
                                y: (size.height - 240 * scale) / 2)
            context.scaleBy(x: scale, y: scale)
            context.fill(Path(CGRect(x: 0, y: 0, width: 360, height: 240)),
                         with: .color(.backgroundOffset))

            var curveA = Path()
            curveA.move(to: CGPoint(x: 24, y: 76))
            curveA.addCurve(to: CGPoint(x: 338, y: 90),
                            control1: CGPoint(x: 116, y: 12), control2: CGPoint(x: 240, y: 16))
            context.stroke(curveA, with: .color(Color("accent").opacity(0.18)),
                           style: StrokeStyle(lineWidth: 28, lineCap: .round))

            var curveB = Path()
            curveB.move(to: CGPoint(x: 12, y: 112))
            curveB.addCurve(to: CGPoint(x: 356, y: 140),
                            control1: CGPoint(x: 124, y: 48), control2: CGPoint(x: 252, y: 64))
            context.stroke(curveB, with: .color(.primaryText.opacity(0.08)),
                           style: StrokeStyle(lineWidth: 18, lineCap: .round))

            for x in [48, 76, 112, 168, 196, 252] {
                let mark = Path(roundedRect: CGRect(x: CGFloat(x), y: 180, width: 8, height: 24),
                                cornerRadius: 4)
                context.fill(mark, with: .color(Color("accent").opacity(0.55)))
            }
        }
        .aspectRatio(3.0 / 2.0, contentMode: .fit)
        .clipped()
        .accessibilityHidden(true)
        .allowsHitTesting(false)
    }
}
