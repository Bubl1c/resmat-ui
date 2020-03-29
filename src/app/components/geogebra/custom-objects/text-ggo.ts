import { GeogebraObject, GeogebraObjectJson, GGOKindType } from "./geogebra-object";
import { Angle, XYCoords, XYCoordsJson } from "../../../utils/geometryUtils";
import { GeogebraObjectUtils } from "./geogebra-object-utils";
import { StringUtils } from "../../../utils/StringUtils";
import { GeometryShapeJson } from "./geometry-shape";

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

  private isInverted: boolean = false;

  constructor(public name: string, public root: XYCoords, public substituteVariables: boolean = false, public laTeXFormula: boolean = false, public id: number = GeogebraObjectUtils.nextId()) {
    this.shapeId = `Text${StringUtils.keepLettersAndNumbersOnly(this.name)}${this.id}`;
  }

  rotate(angle: Angle, point?: XYCoords): TextGGO {
    this.root.rotate(angle, point || new XYCoords(0, 0));
    return this;
  }

  invert(): TextGGO {
    this.root.invert();
    this.isInverted = !this.isInverted;
    return this
  }

  copy(): TextGGO {
    return new TextGGO(this.name, this.root.copy(), this.substituteVariables, this.laTeXFormula);
  }

  getCommands(): string[] {
    return [
      `Text("${this.name}", (${this.root.x}, ${this.root.y}), ${this.substituteVariables}, ${this.laTeXFormula})`
    ]
  }

  toJson(): GeometryShapeJson {
    throw new Error("toJson() on TextGGO is not supported.")
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
