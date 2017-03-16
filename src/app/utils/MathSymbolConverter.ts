export class MathSymbolConverter {
  private static mappings = {
    mu: '&mu;',
    phi: '&phi;',
    theta: '&Theta;',
    sigma: '&sigma;',
    tau: '&Tau;'
  };

  private static specialSymbolMark = "{";
  private static matchingRegex = /[^{}]+(?=\})/g;

  static convertString(str: string): string {
    if(!str) {
      return "";
    }
    if(str.indexOf(this.specialSymbolMark) === -1) {
      return str;
    }
    let letters: string[] = str.match(this.matchingRegex);
    let mappedLetters = letters.map(ltr => this.mapLetter(ltr));
    str = mappedLetters.join('');
    return str;
  }

  private static mapLetter(letter: string): string {
    let mapped = this.mappings[letter];
    if(mapped) {
      return mapped;
    } else {
      return letter;
    }
  }
}
