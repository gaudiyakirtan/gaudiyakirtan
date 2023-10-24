// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore: Although native-base exports these, it's typescript typings aren't.
import { variables, getTheme } from "native-base";

import Settings from "../settings/Settings";

import ITheme from "./ITheme";
import GaurangaTheme from "./Gauranga.theme";
import KrsnaTheme from "./Krsna.theme";

export default class Theme {
  public static getCurrentTheme(): ITheme {
    const isDarkTheme = Settings.get().isDarkTheme;
    return isDarkTheme ? KrsnaTheme : GaurangaTheme;
  }

  // NativeBase Theme documentation: https://docs.nativebase.io/Customize.html#Customize
  public static getThemeVariables(): void {
    const variableOverrides = this.getNativeBaseThemeVariableOverrides();
    return getTheme({ ...variables, ...variableOverrides });
  }

  // Theme variable names must be coming from "node_modules/native-base/src/theme/variables/platform.js"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static getNativeBaseThemeVariableOverrides(): any {
    const theme = this.getCurrentTheme();
    return {
      // Android
      androidRipple: true,
      buttonUppercaseAndroidText: false,

      // Color
      brandPrimary: theme.controlHighlight,
      brandInfo: theme.controlHighlightDark,
      brandSuccess: theme.success,
      brandDanger: theme.error,
      brandWarning: theme.warning,
      brandDark: theme.backgroundPrimary,
      brandLight: theme.textNormal,

      // Font
      fontFamily: "Roboto",
      fontSizeBase: 15,

      // Header
      searchBarHeight: 40,
      searchBarInputHeight: 50,
      toolbarSearchIconSize: 23,
      toolbarDefaultBorder: undefined,

      // Line Height
      lineHeight: 24,
      listItemSelected: theme.controlHighlight,

      // List
      listBg: "transparent",
      listItemPadding: 8,
      listNoteSize: 13,

      // Spinner
      defaultSpinnerColor: theme.controlHighlight,
      inverseSpinnerColor: theme.controlHighlight,

      // Title
      titleFontfamily: "Roboto_medium",
      titleFontColor: theme.textNormal,
      titleFontSize: 19,
      subTitleFontSize: 14,
      subtitleColor: theme.textLowlight
    };
  }
}
