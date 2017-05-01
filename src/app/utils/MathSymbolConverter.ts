export class MathSymbolConverter {
  private static mappings = {
    mu: '&mu;',
    phi: '&phi;',
    theta: '&Theta;',
    sigma: '&sigma;',
    tau: '&Tau;'
  };

  private static tokenStart = "{";
  private static tokenEnd = "}";
  private static matchingRegex = new RegExp(
    MathSymbolConverter.tokenStart + "\\w+" + MathSymbolConverter.tokenEnd,
    "g"
  );

  static convertString(str: string): string {
    if(!str) {
      return "";
    }
    return str.replace(this.matchingRegex, function(match) {
      return MathSymbolConverter.mappings[MathSymbolConverter.dropTokenIdentities(match)] || match;
    });
  }

  private static dropTokenIdentities(str: string): string {
    return str.substring(this.tokenStart.length, str.length - this.tokenEnd.length)
  }
}
