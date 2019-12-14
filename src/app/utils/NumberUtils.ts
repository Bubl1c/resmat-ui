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

}
