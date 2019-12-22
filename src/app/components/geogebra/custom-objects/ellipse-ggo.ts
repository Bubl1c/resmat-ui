import { GeogebraObject, GeogebraObjectJson, GGOKindType } from "./geogebra-object";
import { Angle, CoordsUtils, GeometryUtils, XYCoords, XYCoordsJson } from "../../../utils/geometryUtils";
import { PointGGO } from "./point-ggo";
import { NumberUtils } from "../../../utils/NumberUtils";
import XY = CoordsUtils.XY;
import { CustomAxesGGO, CustomAxesGGOJSON } from "./custom-axes-ggo";

export interface EllipseGGOJSON extends GeogebraObjectJson {
  f1: XYCoordsJson,
  f2: XYCoordsJson,
  ellipsePoint: XYCoordsJson
}

export class EllipseGGO implements GeogebraObject {
  kind: GGOKindType = "ellipse";

  f1Point: PointGGO;
  f2Point: PointGGO;
  ellipsePoint: PointGGO;

  constructor(
    public name: string,
    public root: XYCoords,
    f1Rel: XYCoords,
    ellipsePointRel: XYCoords
  ) {
    const withName = (elementName: string) => `${name}${elementName}`;
    const f1 = XY(root.x + f1Rel.x, root.y + f1Rel.y);
    const ellipsePoint = XY(root.x + ellipsePointRel.x, root.y + ellipsePointRel.y);
    const f2 = XYCoords.fromJson(GeometryUtils.opositePoint(root.x, root.y, f1.x, f1.y));
    this.f1Point = new PointGGO(withName("F1Point"), f1.copy(), false);
    this.f2Point = new PointGGO(withName("F2Point"), f2.copy(), false);
    this.ellipsePoint = new PointGGO(withName("EllipsePoint"), ellipsePoint.copy(), true);
  }

  rotate(angle: Angle, point: XYCoords = this.root): EllipseGGO {
    this.root.rotate(angle, point);
    this.f1Point.rotate(angle, point);
    this.f2Point.rotate(angle, point);
    this.ellipsePoint.rotate(angle, point);
    return this
  }

  copy(): EllipseGGO {
    return new EllipseGGO(this.name, this.f1Point.root.copy(), this.f2Point.root.copy(), this.ellipsePoint.root.copy());
  }

  getCommands(): string[] {
    return [
      ...this.f1Point.getCommands(),
      ...this.f2Point.getCommands(),
      ...this.ellipsePoint.getCommands(),
      `${this.name}: Ellipse(${this.f1Point.name},${this.f2Point.name},${this.ellipsePoint.name})`,
      `ShowLabel(${this.name},false)`
    ]
  }

  toJson(): EllipseGGOJSON {
    return {
      kind: this.kind,
      root: this.root.toJson(),
      name: this.name,
      f1: this.f1Point.root.toJson(),
      f2: this.f2Point.root.toJson(),
      ellipsePoint: this.ellipsePoint.root.toJson()
    }
  }

  static fromJson(json: GeogebraObjectJson): CustomAxesGGO {
    const j = json as CustomAxesGGOJSON;
    return new CustomAxesGGO(j.name, XYCoords.fromJson(j.root), j.size, j.axes.x.name, j.axes.y.name)
  }

  maxCoord(): XYCoordsJson {
    return {
      x: NumberUtils.maxAbs(this.f1Point.root.x, this.f2Point.root.x, this.ellipsePoint.root.x),
      y: NumberUtils.maxAbs(this.f1Point.root.y, this.f2Point.root.y, this.ellipsePoint.root.y)
    }
  }

  getDeleteCommands(): string[] {
    return [...this.f1Point.getDeleteCommands(), ...this.f2Point.getDeleteCommands(), ...this.ellipsePoint.getDeleteCommands()]
  }
}
