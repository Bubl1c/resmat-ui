import {
  DocxDocument,
  DocxNode,
  DocxNumbering,
  ParsedNumbering,
  ParsedNumberingLvl,
  SimpleTextTestData,
  RawDocx
} from "./docx-models";

export namespace DocxParser {
  const startsWithCustomNumberedListRegex = /^([^\S\n]+)?\d+[).](\s?)+/;
  const startsWithCustomLetteredListRegex = /^([^\S\n]+)?[\wа-яА-Я]+[).](\s?)+/;

  const docx4js: { default: { load: (file: File) => Promise<RawDocx> } } = require("docx4js");

  export function loadFileAndParseOutTests(file: File): Promise<SimpleTextTestData[]> {
    const loaded = docx4js.default.load(file);
    return loaded.then(docx => {
      const parsed = DocxParser.parseTestsInDocument(docx);
      return parsed
    }).catch(error => {
      console.error(`Failed to load or parse tests from file ${file.name}`, error)
      throw error
    })
  }

  export function parseTestsInDocument(docx: RawDocx): SimpleTextTestData[] {

    //TODO: render doesn't work with documents which have formulas in them

    const rendered: DocxDocument.Root = docx.render((type,props,children) => ({ type, props, children }));
    const numberingMap = numberingToMap(rendered.props.numbering);

    let result: SimpleTextTestData[] = [];
    let currentTest: SimpleTextTestData = {
      question: "",
      options: []
    };
    const resetCurrentTest = (newQuestion: string) => {
      if (currentTest.question) {
        result.push(Object.assign({}, currentTest));
        if (currentTest.options.length < 2) {
          alert(`Схоже що тест ${JSON.stringify(currentTest)} прочитаний невірно.`)
        }
      }
      currentTest = {
        question: newQuestion,
        options: []
      };
    };
    rendered.children.forEach(section => {
      //parse out paragraphs and lists from section
      section.children.forEach(c => {
        const text = retrieveText(c).trim();
        if (text.length !== 0) {
          const isQuestion = getIsQuestion(c, text, numberingMap);
          if (isQuestion) {
            resetCurrentTest(text.replace(startsWithCustomNumberedListRegex, ""))
          } else {
            currentTest.options.push(text.replace(startsWithCustomLetteredListRegex, ""))
          }
        } else {
          resetCurrentTest("")
        }
      })
    });
    resetCurrentTest("");
    return result;
  }

  function getIsQuestion(
    c: DocxDocument.ListNode | DocxDocument.PNode,
    text: string,
    numberingMap: Map<string, ParsedNumbering>
  ) {
    switch (c.type) {
      case "list":
        const numbering = numberingMap.get(c.props.numId);
        const numberingLevel = numbering.lvls[c.props.level];
        return numberingLevel.format === "decimal";
      case "p":
        return startsWithCustomNumberedListRegex.test(text);
      default:
        console.error(`Unhandled section child type ${c["type"]}, node: ${retrieveText(c)}`)
        return false;
    }
  }

  function numberingToMap(root: DocxNumbering.Root): Map<string, ParsedNumbering> {
    const map: Map<string, ParsedNumbering> = new Map();
    const abstractNums: Map<string, DocxNumbering.AbstractNum> = new Map();
    root.children.filter(c => c.type === "abstractNum").forEach((an: DocxNumbering.AbstractNum) => {
      abstractNums.set(an.props.id, an)
    });
    root.children.filter(c => c.type === "num").forEach((n: DocxNumbering.Num) => {
      const an = abstractNums.get(n.props.abstractNum);
      const parsedLvls: { [key: number]: ParsedNumberingLvl } = {};
      an.children.map(lvl => {
        const lvlIdStr = lvl.props.node.attribs["w:ilvl"];
        const lvlId = Number(lvlIdStr);
        const start = lvl.children.find(c => c.type === "start");
        const format = lvl.children.find(c => c.type === "numFmt");
        const lvlText = lvl.children.find(c => c.type === "lvlText");
        parsedLvls[lvlIdStr] = {
          id: lvlId,
          start: Number(start.props.node.attribs["w:val"]),
          format: parseLvlFormat(format.props.node.attribs["w:val"]),
          lvlText: lvlText.props.node.attribs["w:val"]
        }
      });
      map.set(n.props.id, {
        id: Number(n.props.id),
        lvls: parsedLvls
      })
    });
    return map;
  }

  function parseLvlFormat(format: string): "decimal" | "letter" {
    return format === "decimal" ? "decimal" : "letter"
  }

  function retrieveText(node: DocxNode): string {
    if (node.type === "t") {
      const textNode = node as DocxDocument.TextNode;
      return textNode.children.reduce((acc, cur) => {
        const trimmed = cur.trim();
        if (trimmed.length > 0) {
          //trimmed is used to identify and remove empty strings
          //but we still want to keep spaces in non empty strings
          return acc + cur;
        }
        return acc;
      }, "")
    } else {
      return node.children.reduce((acc, cur) => {
        return acc + retrieveText(cur)
      }, "")
    }
  }
}
