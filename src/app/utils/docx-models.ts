export interface RawDocx {
  render(renderer: (type, props, children) => DocxNode): DocxDocument.Root
}

export interface DocxNode {
  type: string
  props: any
  children: any[]
}

export namespace DocxDocument {

  export interface Root {
    type: "document"
    props: {
      styles: any
      numbering: DocxNumbering.Root
    }
    children: SectionNode[]
  }

  export interface SectionNode {
    type: "section"
    props: any
    children: (PNode | ListNode)[]
  }

  export interface PNode {
    type: "p"
    props: any
    children: RNode[]
  }

  export interface ListNode {
    type: "list"
    props: { numId: string, level: string } //number in string, i hope
    children: RNode[]
  }

  export interface RNode {
    type: "r"
    props: any
    children: TextNode[]
  }

  export interface TextNode {
    type: "t"
    props: any
    children: string[]
  }
}

export namespace DocxNumbering {

  export interface Root {
    type: "numbering"
    props: any
    children: (AbstractNum | Num)[]
  }

  export interface AbstractNum {
    type: "abstractNum"
    props: {
      id: string //number in string, i hope
    }
    children: Lvl[]
  }

  export interface Num {
    type: "num"
    props: {
      id: string //number in string, i hope
      abstractNum: string //number in string, i hope
    }
    children: any[]
  }

  export interface Lvl {
    type: "lvl"
    props: {
      node: {
        attribs: {
          "w:ilvl": string //number in string, i hope
        }
      }
    }
    children: [
      AbstractNumLvlChild<"start">,
      AbstractNumLvlChild<"numFmt">,
      AbstractNumLvlChild<"lvlText">
      //... there are more
    ]
  }

  export interface AbstractNumLvlChild<T> {
    type: T
    props: {
      node: {
        attribs: {
          "w:val": string //number in string, i hope
        }
      }
    }
    children: any[]
  }

}

export interface ParsedNumberingLvl {
  id: number
  start: number
  format: "decimal" | "letter"
  lvlText: string
}
export interface ParsedNumbering {
  id: number
  lvls: {[key:string]:ParsedNumberingLvl}
}

export interface SimpleTextTestData {
  question: string
  options: string[]
}

export interface SimpleUserData {
  name: string
  surname: string
  accessKey?: string
}
