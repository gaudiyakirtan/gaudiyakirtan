import Color from "./Color";

export default interface ITheme {
  bg1: Color;
  bg2: Color;
  accent: Color;
  text: Color;
  subtext: Color;

  // Accent
  onAccent: Color;

  // Background
  backgroundPrimary: Color;
  backgroundSecondary: Color;
  backgroundTertiary: Color;

  // Text
  textHighlight: Color;
  textNormal: Color;
  textSecondary: Color;
  textTertiary: Color;
  textLowlight: Color;
  textDisabled: Color;

  // Icon
  iconHighlight: Color;
  iconNormal: Color;
  iconLowlight: Color;
  iconDisabled: Color;
  // Control
  controlHighlightDark: Color;
  controlHighlight: Color;
  controlNormal: Color;
  controlLowlight: Color;
  controlDisabled: Color;

  // Border
  border: Color;
  // Other
  success: Color;
  error: Color;
  warning: Color;
  modalBackdrop: Color;
  cardBackground: Color;
  elevationShadow: Color;
}
