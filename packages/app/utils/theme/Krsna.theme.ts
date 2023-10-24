import Color from "./Color";
import ITheme from "./ITheme";
import ColorUtils from "./ColorUtils";

const accent = ColorUtils.rgbToHex(140, 180, 255) as Color;

const KrsnaTheme: ITheme = {
  bg1: ColorUtils.rgbToHex(24, 24, 25) as Color,
  bg2: ColorUtils.rgbToHex(44, 44, 46) as Color,
  text: ColorUtils.rgbToHex(221, 221, 238) as Color,
  subtext: ColorUtils.rgbToHex(170, 170, 187) as Color,
  accent,

  // ------------------------------------------------------------------------------------------
  // I haven't done anything on purpose with any of the color definitions beyond this point .
  // ------------------------------------------------------------------------------------------
  // Accent
  onAccent: Color.White,
  // Background
  backgroundPrimary: Color.Grey18, // "#181818",
  backgroundSecondary: "#222222" as Color,
  backgroundTertiary: "#2222ff" as Color,
  // Text
  textHighlight: accent,
  textNormal: Color.White,
  textSecondary: "#DDDDEE" as Color,
  textTertiary: "#AAAABB" as Color,
  textLowlight: Color.Grey85,
  textDisabled: Color.Grey50,
  // Icon
  iconHighlight: accent,
  iconNormal: Color.WhiteDarker,
  iconLowlight: Color.Grey85,
  iconDisabled: Color.Grey50,
  // Control
  controlHighlightDark: accent,
  controlHighlight: Color.BlueDark,
  controlNormal: accent,
  controlLowlight: accent,
  controlDisabled: Color.Grey50,

  // Border
  border: Color.Grey85,
  // Other
  success: Color.Green,
  error: Color.Red,
  warning: Color.Orange,
  modalBackdrop: Color.Black,
  cardBackground: Color.Grey21,
  elevationShadow: Color.Black
};

KrsnaTheme.backgroundPrimary = KrsnaTheme.bg1;
KrsnaTheme.backgroundSecondary = KrsnaTheme.bg2;
KrsnaTheme.backgroundTertiary = ColorUtils.dim(KrsnaTheme.bg2, 0.8) as Color;
KrsnaTheme.cardBackground = ColorUtils.dim(KrsnaTheme.bg2, 0.8) as Color;

export default KrsnaTheme;
