import { GeogebraObject, GeogebraObjectJson, GGOKindType } from "./geogebra-object";
import { Angle, XYCoords, XYCoordsJson } from "../../../utils/geometryUtils";
import { GeogebraObjectUtils } from "./geogebra-object-utils";

export interface TextGGOJSON extends GeogebraObjectJson {
  substituteVariables: boolean
  laTeXFormula: boolean
}

/**
 * https://wiki.geogebra.org/en/Text_Command
 */
export class TextGGO implements GeogebraObject {
  kind: GGOKindType = "text";

  private readonly shapeId: string;

  constructor(public name: string, public root: XYCoords, public substituteVariables: boolean = false, public laTeXFormula: boolean = false, public id: number = GeogebraObjectUtils.nextId()) {
    this.shapeId = `Text${this.name}${this.id}`;
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

  minCoord(): XYCoordsJson {
    return this.root.copy()
  }

  getDeleteCommands(): string[] {
    return [`Delete(${this.name})`]
  }

  getCenterCoords(): XYCoordsJson {
    return this.root.toJson()
  }

  getDimensions(): { width: number; height: number } {
    return {
      width: 1,
      height: 1
    }
  }
}
