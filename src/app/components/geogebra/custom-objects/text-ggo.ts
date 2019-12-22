import { GeogebraObject, GeogebraObjectJson, GGOKindType } from "./geogebra-object";
import { Angle, XYCoords, XYCoordsJson } from "../../../utils/geometryUtils";

export interface TextGGOJSON extends GeogebraObjectJson {
  substituteVariables: boolean
  laTeXFormula: boolean
}

/**
 * https://wiki.geogebra.org/en/Text_Command
 */
export class TextGGO implements GeogebraObject {
  kind: GGOKindType = "text";

  constructor(public name: string, public root: XYCoords, public substituteVariables: boolean = false, public laTeXFormula: boolean = false) {
  }

  rotate(angle: Angle, point: XYCoords = new XYCoords(0, 0)): TextGGO {
    this.root.rotate(angle, point);
    return this;
  }

  copy(): TextGGO {
    return new TextGGO(this.name, this.root.copy(), this.substituteVariables, this.laTeXFormula);
  }

  getCommands(): string[] {
    return [
      `Text("${this.name}", (${this.root.x}, ${this.root.y}), ${this.substituteVariables}, ${this.laTeXFormula})`
    ]
  }

  toJson(): TextGGOJSON {
    return this.copy()
  }

  static fromJson(json: GeogebraObjectJson): TextGGO {
    const j = json as TextGGOJSON;
    return new TextGGO(j.name, XYCoords.fromJson(j.root), j.substituteVariables, j.laTeXFormula)
  }

  maxCoord(): XYCoordsJson {
    return this.root.copy()
  }

  getDeleteCommands(): string[] {
    return [`Delete(${this.name})`]
  }
}
