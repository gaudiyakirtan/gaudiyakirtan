import Foundation
import QuartzCore
#if canImport(UIKit)
import UIKit
#endif

/// The kind of haptic a scrub sample earned by crossing the seek rail's detent ladder.
enum ScrubTick: Equatable {
    /// The sample stayed inside the detent it started in.
    case none
    /// The sample crossed a minor detent — the fine notches the ruler draws short marks for.
    case minor
    /// The sample crossed a major detent — the tall ruler marks at each eighth of the recording.
    case major
    /// The sample arrived at 0:00 or the end of the recording from inside the rail.
    case edge
}

/// The ladder the waveform rail's ticks are spaced on.
///
/// The counts are deliberately shared with the ruler geometry so the mark you see under your finger
/// is the mark you feel: every major detent is also a minor detent (`minor` is a whole multiple of
/// `major`), which is what lets a major crossing simply out-rank a minor one.
enum ScrubDetents {
    static let minor = 32
    static let major = 8

    /// The shortest gap between two emitted ticks. A fast flick can cross a dozen detents in one
    /// frame; without this the actuator gets a burst that reads as a rattle rather than notches.
    static let minimumTickInterval: CFTimeInterval = 0.018

    static func index(of progress: Double, count: Int) -> Int {
        guard count > 0 else { return 0 }
        let clamped = min(max(progress, 0), 1)
        return min(Int(clamped * Double(count)), count - 1)
    }
}

/// Pure detent arithmetic for the seek rail, kept free of UIKit so it is unit-testable.
enum ScrubHapticLadder {
    /// Classifies the move from `previous` to `new`, both as 0...1 progress along the rail.
    ///
    /// `previous` is `nil` for the first sample of a gesture; the caller owns that "grab" feel, so
    /// the first sample never also reports a crossing.
    static func tick(from previous: Double?, to new: Double) -> ScrubTick {
        guard let previous, previous.isFinite, new.isFinite else { return .none }
        let old = min(max(previous, 0), 1)
        let now = min(max(new, 0), 1)

        if (now >= 1 && old < 1) || (now <= 0 && old > 0) { return .edge }
        if ScrubDetents.index(of: old, count: ScrubDetents.major)
            != ScrubDetents.index(of: now, count: ScrubDetents.major) { return .major }
        if ScrubDetents.index(of: old, count: ScrubDetents.minor)
            != ScrubDetents.index(of: now, count: ScrubDetents.minor) { return .minor }
        return .none
    }
}

#if canImport(UIKit)
/// Drives the Taptic Engine for a seek-rail scrub.
///
/// The system already gates this on the device's haptic settings and silences it in Low Power Mode,
/// so there is no app-level switch to consult here.
@MainActor
final class ScrubHapticEngine: ObservableObject {
    private let selection = UISelectionFeedbackGenerator()
    private let minorImpact = UIImpactFeedbackGenerator(style: .light)
    private let majorImpact = UIImpactFeedbackGenerator(style: .rigid)
    private let boundaryImpact = UIImpactFeedbackGenerator(style: .soft)

    private var previousProgress: Double?
    private var lastTickAt: CFTimeInterval = 0

    /// Feeds one sample of an in-flight scrub and plays whatever it earned.
    func scrub(to progress: Double) {
        guard progress.isFinite else { return }
        let clamped = min(max(progress, 0), 1)

        guard previousProgress != nil else {
            // First sample of the gesture: the "grab".
            selection.prepare()
            minorImpact.prepare()
            majorImpact.prepare()
            boundaryImpact.prepare()
            majorImpact.impactOccurred(intensity: 0.7)
            previousProgress = clamped
            lastTickAt = CACurrentMediaTime()
            return
        }

        let tick = ScrubHapticLadder.tick(from: previousProgress, to: clamped)
        previousProgress = clamped
        guard tick != .none else { return }

        let now = CACurrentMediaTime()
        guard now - lastTickAt >= ScrubDetents.minimumTickInterval else { return }
        lastTickAt = now

        switch tick {
        case .minor:
            selection.selectionChanged()
            selection.prepare()
        case .major:
            minorImpact.impactOccurred(intensity: 0.55)
            minorImpact.prepare()
        case .edge:
            boundaryImpact.impactOccurred(intensity: 1.0)
            boundaryImpact.prepare()
        case .none:
            break
        }
    }

    /// Plays a single confirmation for a discrete jump (VoiceOver's adjustable action, Switch
    /// Control, a keyboard arrow). These arrive one committed value at a time rather than as a
    /// stream, so they get one unambiguous tick instead of the ladder's fine notches.
    func adjust(to progress: Double) {
        guard progress.isFinite else { return }
        let clamped = min(max(progress, 0), 1)
        if clamped <= 0 || clamped >= 1 {
            boundaryImpact.impactOccurred(intensity: 1.0)
        } else {
            minorImpact.impactOccurred(intensity: 0.55)
        }
        previousProgress = nil
    }

    /// Ends the gesture with the release feel and clears the ladder for the next scrub.
    func end() {
        if previousProgress != nil {
            boundaryImpact.impactOccurred(intensity: 0.6)
        }
        previousProgress = nil
    }
}
#endif
