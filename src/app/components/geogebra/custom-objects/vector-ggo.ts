import { GeogebraObject, GeogebraObjectJson, GGOKindType } from "./geogebra-object";
import { Angle, XYCoords, XYCoordsJson } from "../../../utils/geometryUtils";
import { PointGGO } from "./point-ggo";
import { TextGGO } from "./text-ggo";
import { NumberUtils } from "../../../utils/NumberUtils";

export interface VectorGGOJSON extends GeogebraObjectJson {
  end: XYCoordsJson
  isLabelVisible: boolean
}

export class VectorGGO implements GeogebraObject {
  kind: GGOKindType = "vector";

  rootPoint: PointGGO;
  endPoint: PointGGO;
  customLabel?: TextGGO;

  constructor(public name: string, public root: XYCoords, public end: XYCoords, public isLabelVisible: boolean = false) {
    const withName = (elementName: string) => `${this.name}${elementName}`;
    this.rootPoint = new PointGGO(withName("Root"), this.root.copy());
    this.endPoint = new PointGGO(withName("End"), this.end.copy());
  }

  rotate(angle: Angle, point: XYCoords = this.root): VectorGGO {
    this.rootPoint.rotate(angle, point);
    this.endPoint.rotate(angle, point);
    this.customLabel && this.customLabel.rotate(angle, point);
    return this;
  }

  copy(): VectorGGO {
    return new VectorGGO(this.name, this.root.copy(), this.end.copy(), this.isLabelVisible);
  }

  setCustomLabel(label: TextGGO): VectorGGO {
    this.customLabel = label.copy();
    return this;
  }

  getCommands(): string[] {
    return [
      ...this.rootPoint.getCommands(),
      ...this.endPoint.getCommands(),
      `${this.name}=Vector(${this.rootPoint.name},${this.endPoint.name})`,
      `ShowLabel(${this.name},${this.isLabelVisible})`,
      ...(this.customLabel ? this.customLabel.getCommands() : [])
    ]
  }

  toJson(): VectorGGOJSON {
    return {
      kind: this.kind,
      root: this.root.toJson(),
      end: this.end.toJson(),
      name: this.name,
      isLabelVisible: this.isLabelVisible
    }
  }

  static fromJson(json: GeogebraObjectJson): VectorGGO {
    const j = json as VectorGGOJSON;
    return new VectorGGO(j.name, XYCoords.fromJson(j.root), XYCoords.fromJson(j.end), j.isLabelVisible)
  }

  maxCoord(): XYCoordsJson {
    const rootMC = this.rootPoint.maxCoord();
    const endMC = this.endPoint.maxCoord();
    return {
      x: NumberUtils.maxAbs(rootMC.x, endMC.x),
      y: NumberUtils.maxAbs(rootMC.y, endMC.y)
    }
  }

  getDeleteCommands(): string[] {
    return [...this.rootPoint.getDeleteCommands(), ...this.endPoint.getDeleteCommands()]
  }
}
