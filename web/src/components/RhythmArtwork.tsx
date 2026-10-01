/** Home v5's fixed vector master. Independent of month, playback and motion preferences. */
export function RhythmArtwork() {
  return (
    <svg className="rhythm-artwork" viewBox="0 0 360 240" aria-hidden="true" focusable="false">
      <path d="M24 76 C116 12 240 16 338 90" fill="none" stroke="var(--accent)" strokeOpacity=".18" strokeWidth="28" strokeLinecap="round" />
      <path d="M12 112 C124 48 252 64 356 140" fill="none" stroke="var(--primary)" strokeOpacity=".08" strokeWidth="18" strokeLinecap="round" />
      {[48, 76, 112, 168, 196, 252].map((x) => (
        <rect key={x} x={x} y="180" width="8" height="24" rx="4" fill="var(--accent)" fillOpacity=".55" />
      ))}
    </svg>
  )
}
