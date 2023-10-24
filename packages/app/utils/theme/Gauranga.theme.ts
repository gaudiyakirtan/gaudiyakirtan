import Color from "./Color";
import ITheme from "./ITheme";
import ColorUtils from "./ColorUtils";

const accent = ColorUtils.rgbToHex(240, 144, 0) as Color;

const GaurangaTheme: ITheme = {
  bg1: ColorUtils.rgbToHex(255, 244, 232) as Color,
  bg2: ColorUtils.rgbToHex(245, 228, 208) as Color,
  text: ColorUtils.rgbToHex(36, 35, 33) as Color,
  subtext: ColorUtils.rgbToHex(104, 103, 101) as Color,
  accent,

  // ------------------------------------------------------------------------------------------
  // I haven't done anything on purpose with any of the color definitions beyond this point .
  // ------------------------------------------------------------------------------------------
  // Accent
  onAccent: Color.WhiteDark,
  // Background
  backgroundPrimary: "#FFF8F0" as Color,
  backgroundSecondary: "#ff0000" as Color,
  backgroundTertiary: Color.GreyC0,
  // Text
  textHighlight: accent,
  textNormal: Color.Black,
  textSecondary: "#242321" as Color,
  textTertiary: "#686765" as Color,
  textLowlight: Color.Grey85,
  textDisabled: Color.GreyB3,
  // Icon
  iconHighlight: accent,
  iconNormal: Color.Grey85,
  iconLowlight: Color.Grey85,
  iconDisabled: Color.GreyB3,
  // Control
  controlHighlightDark: accent,
  controlHighlight: accent,
  controlNormal: Color.Grey21,
  controlLowlight: Color.Grey85,
  controlDisabled: Color.GreyB3,
  // Border
  border: Color.Grey85,
  // Other
  success: Color.Green,
  error: Color.Red,
  warning: Color.Orange,
  modalBackdrop: Color.Grey85,
  cardBackground: Color.WhiteDark, // backgroundPrimary
  elevationShadow: Color.White
};

GaurangaTheme.backgroundPrimary = GaurangaTheme.bg1;
GaurangaTheme.backgroundSecondary = GaurangaTheme.bg2;
GaurangaTheme.backgroundTertiary = ColorUtils.dim(GaurangaTheme.bg2 as string, 1.4) as Color;
GaurangaTheme.cardBackground = ColorUtils.dim(GaurangaTheme.bg1 as string, 1.2) as Color;

export default GaurangaTheme;
