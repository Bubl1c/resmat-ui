import { NumberUtils } from "./NumberUtils";

export class ColorUtils {
  static lastLightGreyColorIndex = 0;

  static darkColors: string[] = [
    "#850b03",
    "#695a02",
    "#046902",
    "#026964",
    "#021069",
    "#370269"
  ];

  static lightGreyColors: string[] = [
    '#606169',
    '#787878',
    '#808082',
    '#95969b',
    '#9799a5'
  ];

  static allColors: string[] = [
    ...ColorUtils.darkColors,
    ...ColorUtils.lightGreyColors
  ];

  static randomColor(colorSet: string[] = ColorUtils.allColors): string {
    return colorSet[NumberUtils.getRandomInt(0, colorSet.length - 1)]
  }

  static nextLightGreyColor(): string {
    const color =  ColorUtils.lightGreyColors[ColorUtils.lastLightGreyColorIndex];
    if (ColorUtils.lastLightGreyColorIndex === (ColorUtils.lightGreyColors.length - 1)) {
      ColorUtils.lastLightGreyColorIndex = 0
    } else {
      ColorUtils.lastLightGreyColorIndex++
    }
    return color
  }
}
