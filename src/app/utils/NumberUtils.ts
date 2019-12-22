export class NumberUtils {

  public static roundToFixed(value: number, digitsAfterComma: number = 6): string {
    return typeof value !== 'number'
      ? ''
      : value.toFixed(digitsAfterComma);
  }

  public static accurateRound(value: number, scale: number): number {
    if(!("" + value).includes("e")) {
      return +(Math.round((value + "e+" + scale) as any)  + "e-" + scale);
    } else {
      var arr = ("" + value).split("e");
      var sig = ""
      if(+arr[1] + scale > 0) {
        sig = "+";
      }
      return +(Math.round((+arr[0] + "e" + sig + (+arr[1] + scale)) as any) + "e-" + scale);
    }
  }

  public static maxAbs(...numbers: number[]): number {
    return Math.max(...numbers.map(n => Math.abs(n)));
  }

  /**
   * Returns a random number between min (inclusive) and max (exclusive)
   */
  public static getRandomArbitrary(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Returns a random integer between min (inclusive) and max (inclusive).
   * The value is no lower than min (or the next integer greater than min
   * if min isn't an integer) and no greater than max (or the next integer
   * lower than max if max isn't an integer).
   * Using Math.round() will give you a non-uniform distribution!
   */
  public static getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

}
