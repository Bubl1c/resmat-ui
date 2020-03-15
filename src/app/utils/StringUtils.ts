export class StringUtils {

  public static keepLettersAndNumbersOnly(str: string): string {
    return str.replace(/[^\w0-9а-яА-Я]/gi, '')
  }
}
