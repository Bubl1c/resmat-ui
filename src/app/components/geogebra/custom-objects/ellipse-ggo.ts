import { GeogebraObject, GeogebraObjectJson, GeogebraObjectSettings, GGOKindType } from "./geogebra-object";
import { Angle, CoordsUtils, GeometryUtils, XYCoords, XYCoordsJson } from "../../../utils/geometryUtils";
import { PointGGO } from "./point-ggo";
import { NumberUtils } from "../../../utils/NumberUtils";
import XY = CoordsUtils.XY;
import { CustomAxesGGO, CustomAxesGGOJSON } from "./custom-axes-ggo";
import { PolygonSettingsJson } from "./polygon/polygon-ggo";
import { GeogebraObjectUtils } from "./geogebra-object-utils";
import { StringUtils } from "../../../utils/StringUtils";
import { GeometryShapeJson } from "./geometry-shape";

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

  private outerPoints: XYCoords[];

  private readonly settings: GeogebraObjectSettings;
  private readonly shapeId: string;

  private isInverted: boolean = false;

  constructor(
    public id: number,
    public name: string,
    public root: XYCoords,
    public xR: number,
    public yR: number,
    settings?: GeogebraObjectSettings,
    public rotationAngle?: number,
    public rotationPoint?: XYCoordsJson,
  ) {
    this.settings = GeogebraObjectUtils.settingsWithDefaults(settings);
    this.shapeId = `Ellipse${StringUtils.keepLettersAndNumbersOnly(this.name)}${this.id}`;
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
    this.outerPoints = [XY(root.x, root.y + yR), XY(root.x + xR, root.y), XY(root.x, root.y - yR), XY(root.x - xR, root.y)];
    this.rotationAngle = this.rotationAngle || 0;
    if (this.rotationAngle) {
      this.rotate(new Angle(this.rotationAngle), this.rotationPoint)
    }
  }

  rotate(angle: Angle, point?: XYCoordsJson): EllipseGGO {
    const p = point || this.root.copy();
    this.root.rotate(angle, p);
    this.f1Point.rotate(angle, p);
    this.f2Point.rotate(angle, p);
    this.ellipsePoint.rotate(angle, p);
    this.outerPoints.forEach(p => p.rotate(angle, p));
    this.rotationAngle = angle.degrees;
    this.rotationPoint = p;
    return this
  }

  invert(): EllipseGGO {
    this.root.invert();
    this.f1Point.invert();
    this.f2Point.invert();
    this.ellipsePoint.invert();
    this.outerPoints.forEach(p => p.invert());
    this.isInverted = !this.isInverted;
    this.rotationAngle = GeogebraObjectUtils.invertRotationAngle(this.rotationAngle);
    return this
  }

  copy(): EllipseGGO {
    return new EllipseGGO(this.id, this.name, this.root.copy(), this.xR, this.yR, this.settings, this.rotationAngle, this.rotationPoint);
  }

  getCommands(): string[] {
    return [
      ...this.f1Point.getCommands(),
      ...this.f2Point.getCommands(),
      ...this.ellipsePoint.getCommands(),
      `${this.shapeId}: Ellipse(${this.f1Point.shapeId},${this.f2Point.shapeId},${this.ellipsePoint.shapeId})`,
      `ShowLabel(${this.shapeId},false)`,
      `SetLineThickness(${this.shapeId},${this.settings.lineThickness})`
    ]
  }

  toJson(): GeometryShapeJson {
    return {
      id: this.id,
      name: this.name,
      shapeType: "Ellipse",
      rotationAngle: this.rotationAngle,
      rotationPoint: this.rotationPoint,
      root: this.root.toJson(),
      dimensions: {
        xR: this.xR,
        yR: this.yR
      },
      sizeDirections: undefined,
      settings: this.settings,
      props: undefined
    }
  }

  maxCoord(): XYCoordsJson {
    return {
      x: Math.max(...this.outerPoints.map(p => p.x)),
      y: Math.max(...this.outerPoints.map(p => p.y)),
    }
  }

  minCoord(): XYCoordsJson {
    return {
      x: Math.min(...this.outerPoints.map(p => p.x)),
      y: Math.min(...this.outerPoints.map(p => p.y)),
    }
  }

  getDeleteCommands(): string[] {
    return [...this.f1Point.getDeleteCommands(), ...this.f2Point.getDeleteCommands(), ...this.ellipsePoint.getDeleteCommands()]
  }

  getCenterCoords(): XYCoordsJson {
    return this.root.toJson()
  }

  getDimensions(): { width: number; height: number } {
    return {
      width: this.xR * 2,
      height: this.yR * 2
    }
  }
}
