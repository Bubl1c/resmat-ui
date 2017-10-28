export namespace NumberUtils {

  export function roundToFixed(value: number, digitsAfterComma: number = 6): string {
    return typeof value !== 'number'
      ? ''
      : value.toFixed(digitsAfterComma);
  }

}
