import { GeogebraObjectJson, GGOKindType } from "../geogebra-object";
import { PointGGO } from "../point-ggo";
import { CoordsUtils, XYCoords, XYCoordsJson } from "../../../../utils/geometryUtils";
import { Sortament } from "../../../../utils/sortament";
import { PolygonGGO, PolygonGGOJSON, PolygonSettingsJson } from "./polygon-ggo";
import { SizeGGO } from "../size-ggo";
import XY = CoordsUtils.XY;
import { GeometryShapeJson, StringKV } from "../geometry-shape";
import { NumberUtils } from "../../../../utils/NumberUtils";

export interface KutykGGOSizeDirections extends StringKV {
  b?: "left" | "down"
  t?: "up" | "right"
  z0?: "up" | "right"
}

export interface KutykGGOJSON extends PolygonGGOJSON {
  b: number
  t: number
  settings?: PolygonSettingsJson
}

/**
 *  B t B1
 *   _
 *  | |
 *  | |
 * b| |   .Center
 *  | |C1_________ A1
 *  |_____________| t
 *  Root   b       A
 */
export class KutykGGO extends PolygonGGO {
  private rootPoint: PointGGO;
  private bPoint: PointGGO;
  private b1Point: PointGGO;
  private c1Point: PointGGO;
  private aPoint: PointGGO;
  private a1Point: PointGGO;

  protected centerPoint: PointGGO;

  constructor(
    public id: number,
    public name: string,
    public root: XYCoords,
    public b: number,
    public t: number,
    settings?: PolygonSettingsJson,
    public sizeDirections?: KutykGGOSizeDirections,
    public rotationAngle?: number,
    public rotationPoint?: XYCoordsJson,
  ) {
    super(id, name, root, "kutyk", settings, rotationAngle, rotationPoint);
    this.generatePoints(root, b, t, settings);
    this.generateSizes(b, t, sizeDirections);
    this.applyRotation();
  }

  private generatePoints(root: XYCoords, b: number, t: number, settings: PolygonSettingsJson) {
    const withId = this.withId;

    const sortament = Sortament.Kutyk[`${b}_${t*10}`];
    if (!sortament) {
      throw new Error(`Kutyk with b = ${b} and t = ${t} has not been found in sortament!`)
    }
    const Root = root.copy();
    const B = XY(root.x, root.y + b);
    const B1 = XY(B.x + t, B.y);
    const C1 = XY(root.x + t, root.y + t);
    const A = XY(root.x + b, root.y);
    const A1 = XY(A.x, A.y + t);

    this.rootPoint = new PointGGO(withId("Root"), Root, this.outerPointSettings());
    this.bPoint = new PointGGO(withId("B"), B);
    this.b1Point = new PointGGO(withId("B1"), B1);
    this.c1Point = new PointGGO(withId("C1"), C1);
    this.a1Point = new PointGGO(withId("A1"), A1);
    this.aPoint = new PointGGO(withId("A"), A);

    this.centerPoint = this.makeCenterPoint(XY(Root.x + sortament.z_0, Root.y + sortament.z_0));

    this.points = [this.rootPoint, this.bPoint, this.b1Point, this.c1Point, this.a1Point, this.aPoint]
  }

  private generateSizes(b: number, t: number, sizeDirections?: KutykGGOSizeDirections) {
    const withId = this.withId;
    if (this.settings.showSizes) {
      const sizeDirs: KutykGGOSizeDirections = {
        b: sizeDirections && sizeDirections.b || "down",
        t: sizeDirections && sizeDirections.t || "right",
        z0: sizeDirections && sizeDirections.z0 || "up"
      };
      const shapeSize = this.settings.shapeSizeToCalculateSizeDepth || b;
      const sizeB = sizeDirs.b == "left"
        ? new SizeGGO(withId("SizeB"), this.rootPoint.root.copy(), this.bPoint.root.copy(), sizeDirs.b, `b${this.id}=${b}`, shapeSize)
        : new SizeGGO(withId("SizeB"), this.rootPoint.root.copy(), this.aPoint.root.copy(), sizeDirs.b, `b${this.id}=${b}`, shapeSize);

      const sizeH = sizeDirs.t == "right"
        ? new SizeGGO(withId("SizeT"), this.aPoint.root.copy(), this.a1Point.root.copy(), sizeDirs.t,`t${this.id}=${t}`, shapeSize)
        : new SizeGGO(withId("SizeT"), this.bPoint.root.copy(), this.b1Point.root.copy(), sizeDirs.t,`t${this.id}=${t}`, shapeSize);

      const z0 = NumberUtils.accurateRound(this.centerPoint.root.x - this.rootPoint.root.x, 2);
      const z0Depth = (b - z0) * 1.2;
      const sizeZ0 = sizeDirs.z0 == "up"
        ? new SizeGGO(withId("SizeZ0"), this.rootPoint.root.updY(y => y + z0), this.centerPoint.root.copy(), sizeDirs.z0,`z0${this.id}=${z0}`, shapeSize, z0Depth)
        : new SizeGGO(withId("SizeZ0"), this.rootPoint.root.updX(x => x + z0), this.centerPoint.root.copy(), sizeDirs.z0,`z0${this.id}=${z0}`, shapeSize, z0Depth);

      this.sizes = [sizeB, sizeH, sizeZ0]
    }
  }

  getDimensions(): { width: number; height: number } {
    return {
      width: this.b,
      height: this.b
    }
  }

  copy(): KutykGGO {
    return new KutykGGO(this.id, this.name, this.root.copy(), this.b, this.t, this.actualJsonSettings, this.sizeDirections, this.rotationAngle, this.rotationPoint)
  }

  toJson(): GeometryShapeJson {
    return {
      id: this.id,
      name: this.name,
      shapeType: "Kutyk",
      rotationAngle: this.rotationAngle,
      rotationPoint: this.rotationPoint,
      root: this.root.toJson(),
      dimensions: {
        b: this.b,
        t: this.t
      },
      sizeDirections: this.sizeDirections,
      settings: this.actualJsonSettings,
      props: {}
    }
  }
}
