// Seconds for JS-driven utility panels; corresponding CSS tokens live in home.css.
// The player and navigation keep their own motion contracts.
export const utilityMotion = {
  panelEnter: 0.18,
  panelExit: 0.12,
  standard: [0.2, 0, 0, 1] as const,
  exit: [0.3, 0, 1, 1] as const,
}
