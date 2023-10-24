import Color from "./Color";

export default class ColorUtils {
  public static dim(color: string | Color, percent: number): string {
    const rgb = this.hexToRgb(color);
    ["r", "g", "b"].forEach(c => {
      rgb[c] = percent < 1 ? rgb[c] * percent : rgb[c] + (255 - rgb[c]) * (percent - 1);
    });
    return this.rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  public static rgbToHex(r: number, g: number, b: number): string {
    const c = new Uint8ClampedArray([r, g, b]);
    return `#${this.toHex(c[0])}${this.toHex(c[1])}${this.toHex(c[2])}`;
  }

  private static toHex(c: number): string {
    const hex = c.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : { r: 0, g: 0, b: 0 };
  }
}
