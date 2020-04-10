import { GeogebraObject, GeogebraObjectJson, GeogebraObjectSettings, GGOKindType } from "./geogebra-object";
import { Angle, CoordsUtils, GeometryUtils, XYCoords, XYCoordsJson } from "../../../utils/geometryUtils";
import { PointGGO } from "./point-ggo";
import { NumberUtils } from "../../../utils/NumberUtils";
import XY = CoordsUtils.XY;
import { CustomAxesGGO, CustomAxesGGOJSON } from "./custom-axes-ggo";
import { PolygonSettingsJson } from "./polygon/polygon-ggo";
import { GeogebraObjectUtils } from "./geogebra-object-utils";
import { StringUtils } from "../../../utils/StringUtils";
import { GeometryShapeJson, StringKV } from "./geometry-shape";
import { SizeGGO } from "./size-ggo";
import { DvotavrGGOSizeDirections } from "./polygon/dvotavr.polygon-ggo";

export interface EllipseGGOSizeDirections extends StringKV {
  xR?: "up" | "down"
  yR?: "left" | "right"
}

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

  private xRLeft: XYCoords;
  private xRRight: XYCoords;
  private yRTop: XYCoords;
  private yRBottom: XYCoords;
  private outerPoints: XYCoords[];

  private sizes: SizeGGO[] = [];

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
    public sizeDirections?: EllipseGGOSizeDirections
  ) {
    this.settings = GeogebraObjectUtils.settingsWithDefaults(settings);
    this.settings.showSizes = settings && settings.showSizes || true;
    this.shapeId = `Ellipse${StringUtils.keepLettersAndNumbersOnly(this.name)}${this.id}`;
    const withId = (elementName: string) => `${this.shapeId}${elementName}`;
    this.rootPoint = new PointGGO(withId("RootPoint"), root.copy(), { isVisible: true });
    const x0 = this.root.x;
    const y0 = this.root.y;
    const c = Math.sqrt(Math.abs(xR*xR - yR*yR));
    let f1: XYCoords;
    let f2: XYCoords;
    let ellipsePoint: XYCoords;
    if (xR >= c) {
      f1 = XY(x0 + c, y0);
      f2 = XY(x0 - c, y0);
      ellipsePoint = XY(x0 - xR, y0);
    } else {
      f1 = XY(x0, y0 + c);
      f2 = XY(x0, y0 - c);
      ellipsePoint = XY(x0, y0 - yR);
    }
    this.f1Point = new PointGGO(withId("F1Point"), f1.copy(), false);
    this.f2Point = new PointGGO(withId("F2Point"), f2.copy(), false);
    this.ellipsePoint = new PointGGO(withId("EllipsePoint"), ellipsePoint.copy(), true);
    this.xRLeft = XY(root.x - xR, root.y);
    this.xRRight = XY(root.x + xR, root.y);
    this.yRTop = XY(root.x, root.y + yR);
    this.yRBottom = XY(root.x, root.y - yR);
    this.outerPoints = [this.xRLeft, this.xRRight, this.yRTop, this.yRBottom];
    this.generateSizes(sizeDirections);
    this.rotationAngle = this.rotationAngle || 0;
    if (this.rotationAngle) {
      this.rotate(new Angle(this.rotationAngle), this.rotationPoint)
    }
  }

  private generateSizes(sizeDirections?: EllipseGGOSizeDirections) {
    const rnd = (n: number) => NumberUtils.accurateRound(n, 2);
    const xR = rnd(this.yR);
    const yR = rnd(this.xR);
    const withId = (name: string) => `${this.shapeId}${name}`;
    if (this.settings.showSizes) {
      const sizeDirs: EllipseGGOSizeDirections = {
        xR: sizeDirections && sizeDirections.xR || "up",
        yR: sizeDirections && sizeDirections.yR || "right",
      };
      const shapeSize = this.settings.shapeSizeToCalculateSizeDepth || Math.max(xR, yR);
      const sizeXr = sizeDirs.xR == "up"
        ? new SizeGGO(withId("SizeXR"), this.rootPoint.root.copy(), this.xRLeft, sizeDirs.xR, `${xR}`, shapeSize)
        : new SizeGGO(withId("SizeXR"), this.rootPoint.root.copy(), this.xRLeft, sizeDirs.xR, `${xR}`, shapeSize);

      const sizeYr = sizeDirs.yR == "left"
        ? new SizeGGO(withId("SizeYR"), this.rootPoint.root.copy(), this.yRTop, sizeDirs.yR, `${yR}`, shapeSize)
        : new SizeGGO(withId("SizeYR"), this.rootPoint.root.copy(), this.yRTop, sizeDirs.yR, `${yR}`, shapeSize);

      this.sizes = [sizeXr, sizeYr]
    }
  }

  rotate(angle: Angle, point?: XYCoordsJson): EllipseGGO {
    const p = point || this.root.copy();
    this.root.rotate(angle, p);
    this.f1Point.rotate(angle, p);
    this.f2Point.rotate(angle, p);
    this.ellipsePoint.rotate(angle, p);
    this.outerPoints.forEach(p => p.rotate(angle, p));
    this.sizes.forEach(s => s.rotate(angle, p));
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
    this.sizes.forEach(s => s.invert());
    this.isInverted = !this.isInverted;
    this.rotationAngle = GeogebraObjectUtils.invertRotationAngle(this.rotationAngle);
    return this
  }

  copy(): EllipseGGO {
    return new EllipseGGO(this.id, this.name, this.root.copy(), this.xR, this.yR, this.settings, this.rotationAngle, this.rotationPoint, this.sizeDirections);
  }

  getCommands(): string[] {
    return [
      ...this.f1Point.getCommands(),
      ...this.f2Point.getCommands(),
      ...this.ellipsePoint.getCommands(),
      ...this.sizes.reduce((acc, s) => acc.concat(s.getCommands()), []),
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
      sizeDirections: {},
      settings: this.settings,
      props: {}
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
