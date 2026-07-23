import Foundation

/// Audio streaming configuration (docs/screens/player.md "Audio source — the base URL").
///
/// Every `AudioTrack.filename` is resolved against this single base URL to form the playable
/// stream URL. Kept as one config constant (per player.md's per-platform guidance) so the bucket
/// location is easy to change without touching playback code.
enum AudioConfig {
    /// The public `gaudiyakirtan` S3 bucket, `audio/` prefix — no auth required.
    static let audioBaseURL = "https://gaudiyakirtan.s3.amazonaws.com/audio/"

    /// The playable stream URL for `track`, or `nil` if the filename can't form a valid URL.
    /// Never crashes on a malformed filename — callers (`AudioPlayerService`) treat `nil` as the
    /// graceful "audio unavailable" case (player.md "States — Error / unreachable").
    static func playableURL(for track: AudioTrack) -> URL? {
        guard let encodedFilename = track.filename.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) else {
            return nil
        }
        return URL(string: audioBaseURL + encodedFilename)
    }
}
