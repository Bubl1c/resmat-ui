// for Cyrillic to Latin transliteration
const a = {};
a["Ё"]="YO";a["Й"]="I";a["Ц"]="TS";a["У"]="U";a["К"]="K";a["Е"]="E";a["Н"]="N";a["Г"]="G";a["Ш"]="SH";a["Щ"]="SCH";a["З"]="Z";a["Х"]="H";a["Ъ"]="'";
a["ё"]="yo";a["й"]="i";a["ц"]="ts";a["у"]="u";a["к"]="k";a["е"]="e";a["н"]="n";a["г"]="g";a["ш"]="sh";a["щ"]="sch";a["з"]="z";a["х"]="h";a["ъ"]="'";
a["Ф"]="F";a["Ы"]="I";a["В"]="V";a["А"]="A";a["П"]="P";a["Р"]="R";a["О"]="O";a["Л"]="L";a["Д"]="D";a["Ж"]="ZH";a["Э"]="E";
a["ф"]="f";a["ы"]="i";a["в"]="v";a["а"]="a";a["п"]="p";a["р"]="r";a["о"]="o";a["л"]="l";a["д"]="d";a["ж"]="zh";a["э"]="e";
a["Я"]="Ya";a["Ч"]="CH";a["С"]="S";a["М"]="M";a["И"]="I";a["Т"]="T";a["Б"]="B";a["Ю"]="YU";
a["я"]="ya";a["ч"]="ch";a["с"]="s";a["м"]="m";a["и"]="i";a["т"]="t";a["б"]="b";a["ю"]="yu";
//ukrainian override
a["є"]="ie"; a["Є"]="IE";
a["и"]="y"; a["И"]="Y";
a["ї"]="i"; a["Ї"]="I";
a["ь"]=""; a["Ь"]="";
a["’"]="";
const cyrillicToLatin: {[key:string]:string} = a;

export class StringUtils {

  public static keepLettersAndNumbersOnly(str: string, keepSpecialCharacters?: string): string {
    if (!str || !str.length) {
      return "";
    }
    const keepSpecialStr = keepSpecialCharacters || "";
    const regexp = new RegExp(`[^\\w0-9а-яА-Яіїє${keepSpecialStr}]`, "gi");
    return str.replace(regexp, '')
  }

  public static transliterate(cyrillicText: string): string {
    if (!cyrillicText || !cyrillicText.length) {
      return ""
    }

    let latinText = "";

    for (let cyrillicLetter of cyrillicText){
      if (cyrillicToLatin[cyrillicLetter] === undefined){
        latinText += cyrillicLetter;
      } else {
        latinText += cyrillicToLatin[cyrillicLetter];
      }
    }
    return latinText;
  }

  public static random(length: number): string {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
