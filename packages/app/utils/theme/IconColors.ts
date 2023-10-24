import Settings from "../settings/Settings";

import Color from "./Color";

export default class IconColors {
  private static commonColors = [
    Color.Red,
    Color.Pink,
    Color.Purple,
    Color.Cyan,
    Color.Teal,
    Color.Green
  ];

  private static darkThemeOnlyColors = [
    Color.Red200,
    Color.Pink200,
    Color.Purple200,
    Color.DeepPurple200,
    Color.Cyan100,
    Color.Teal100,
    Color.Green200,
    Color.LightGreen,
    Color.Lime,
    Color.Yellow,
    Color.Amber,
    Color.Orange,
    Color.Orange200,
    Color.DeepOrange,
    Color.Brown300
  ];

  private static lightThemeOnlyColors = [
    Color.Pink900,
    Color.Purple900,
    Color.DeepPurple,
    Color.Cyan900,
    Color.Teal900,
    Color.Green900,
    Color.Lime900,
    Color.Brown
  ];

  public static getRandomColor(): Color {
    const isDarkTheme = Settings.get().isDarkTheme;
    const colors = isDarkTheme
      ? [...this.commonColors, ...this.darkThemeOnlyColors]
      : [...this.commonColors, ...this.lightThemeOnlyColors];

    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }
}
