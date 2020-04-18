const autosize = require("autosize");

export namespace HtmlUtils {

  /**
   * Automatically resize textarea, see http://www.jacklmoore.com/autosize/
   * @param elem
   */
  export function autosizeTextArea(elem: any): void {
    autosize(elem);
  }
}
