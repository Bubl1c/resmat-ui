import { NumberUtils } from "./NumberUtils";

export class ColorUtils {
  static darkColors: string[] = [
    "#850b03",
    "#695a02",
    "#046902",
    "#026964",
    "#021069",
    "#370269"
  ];

  static allColors: string[] = [
    ...ColorUtils.darkColors
  ];

  static randomColor(colorSet: string[] = ColorUtils.allColors): string {
    return colorSet[NumberUtils.getRandomInt(0, colorSet.length - 1)]
  }
}
