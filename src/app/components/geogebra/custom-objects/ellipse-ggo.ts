import { GeogebraObject, GeogebraObjectJson, GGOKindType } from "./geogebra-object";
import { Angle, CoordsUtils, GeometryUtils, XYCoords, XYCoordsJson } from "../../../utils/geometryUtils";
import { PointGGO } from "./point-ggo";
import { NumberUtils } from "../../../utils/NumberUtils";
import XY = CoordsUtils.XY;
import { CustomAxesGGO, CustomAxesGGOJSON } from "./custom-axes-ggo";

export interface EllipseGGOJSON extends GeogebraObjectJson {
  xR: number,
  yR: number,
  root: XYCoordsJson
}

/**
 *   f1   |yr
 * --.----.-----.--
 *   xr   |      f2
 *   http://mathprofi.ru/linii_vtorogo_poryadka_ellips_i_okruzhnost.html
 */
export class EllipseGGO implements GeogebraObject {
  kind: GGOKindType = "ellipse";

  rootPoint: PointGGO;
  f1Point: PointGGO;
  f2Point: PointGGO;
  ellipsePoint: PointGGO;

  private readonly shapeId: string;

  constructor(
    public id: number,
    public name: string,
    public root: XYCoords,
    public xR: number,
    public yR: number
  ) {
    this.shapeId = `${this.name}${this.id}`;
    const withId = (elementName: string) => `${this.shapeId}${elementName}`;
    this.rootPoint = new PointGGO(withId("RootPoint"), root.copy(), { isVisible: true });
    const a = xR;
    const b = yR;
    const c = Math.sqrt(a*a - b*b);
    const x0 = this.root.x;
    const y0 = this.root.y;
    const f1 = XY(c + x0, y0);
    const f2 = XY(- c + x0, y0);
    const ellipsePoint = XY(x0 - xR, y0);
    this.f1Point = new PointGGO(withId("F1Point"), f1.copy(), false);
    this.f2Point = new PointGGO(withId("F2Point"), f2.copy(), false);
    this.ellipsePoint = new PointGGO(withId("EllipsePoint"), ellipsePoint.copy(), true);
  }

  rotate(angle: Angle, point: XYCoords = this.root): EllipseGGO {
    this.root.rotate(angle, point);
    this.f1Point.rotate(angle, point);
    this.f2Point.rotate(angle, point);
    this.ellipsePoint.rotate(angle, point);
    return this
  }

  copy(): EllipseGGO {
    return new EllipseGGO(this.id, this.name, this.root.copy(), this.xR, this.yR);
  }

  getCommands(): string[] {
    return [
      ...this.f1Point.getCommands(),
      ...this.f2Point.getCommands(),
      ...this.ellipsePoint.getCommands(),
      `${this.shapeId}: Ellipse(${this.f1Point.shapeId},${this.f2Point.shapeId},${this.ellipsePoint.shapeId})`,
      `ShowLabel(${this.shapeId},false)`
    ]
  }

  toJson(): EllipseGGOJSON {
    return {
      id: this.id,
      kind: this.kind,
      name: this.name,
      root: this.root.toJson(),
      xR: this.xR,
      yR: this.yR
    }
  }

  static fromJson(json: GeogebraObjectJson): EllipseGGO {
    const j = json as EllipseGGOJSON;
    return new EllipseGGO(j.id, j.name, XYCoords.fromJson(j.root), j.xR, j.yR)
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

  getCenterCoords(): XYCoordsJson {
    return this.root.toJson()
  }

  getSize(): { width: number; height: number } {
    return {
      width: this.xR * 2,
      height: this.yR * 2
    }
  }
}
