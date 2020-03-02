import { GeogebraObjectJson, GGOKindType } from "../geogebra-object";
import { PointGGO } from "../point-ggo";
import { CoordsUtils, XYCoords } from "../../../../utils/geometryUtils";
import { Sortament } from "../../../../utils/sortament";
import { PolygonGGO, PolygonGGOJSON, PolygonSettingsJson } from "./polygon-ggo";
import { SizeGGO } from "../size-ggo";
import XY = CoordsUtils.XY;

export interface KutykGGOSizeDirections {
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
  kind: GGOKindType = "kutyk";

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
    sizeDirections?: KutykGGOSizeDirections
  ) {
    super(id, name, root, settings);
    this.generatePoints(root, b, t, settings);
    this.generateSizes(b, t, sizeDirections);
  }

  private generatePoints(root: XYCoords, b: number, t: number, settings: PolygonSettingsJson) {
    const withId = this.withId;

    const sortamentNumber = b / 10;
    const sortament = Sortament.Kutyk["" + sortamentNumber + "_" + t];
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

    const z0mm = sortament.z_0 * 10;
    this.centerPoint = this.makeCenterPoint(XY(Root.x + z0mm, Root.y + z0mm));

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
        ? new SizeGGO(withId("SizeB"), this.rootPoint.root.copy(), this.bPoint.root.copy(), sizeDirs.b, "" + b, shapeSize)
        : new SizeGGO(withId("SizeB"), this.rootPoint.root.copy(), this.aPoint.root.copy(), sizeDirs.b, "" + b, shapeSize);

      const sizeH = sizeDirs.t == "right"
        ? new SizeGGO(withId("SizeT"), this.aPoint.root.copy(), this.a1Point.root.copy(), sizeDirs.t,"" + t, shapeSize)
        : new SizeGGO(withId("SizeT"), this.bPoint.root.copy(), this.b1Point.root.copy(), sizeDirs.t,"" + t, shapeSize);

      const z0 = this.centerPoint.root.x - this.rootPoint.root.x;
      const z0Depth = (b - z0) * 1.2;
      const sizeZ0 = sizeDirs.z0 == "up"
        ? new SizeGGO(withId("SizeZ0"), this.rootPoint.root.updY(y => y + z0), this.centerPoint.root.copy(), sizeDirs.z0,"" + z0, shapeSize, z0Depth)
        : new SizeGGO(withId("SizeZ0"), this.rootPoint.root.updX(x => x + z0), this.centerPoint.root.copy(), sizeDirs.z0,"" + z0, shapeSize, z0Depth);

      this.sizes = [sizeB, sizeH, sizeZ0]
    }
  }

  getCommands(): string[] {
    return super.getCommands();
  }

  copy(): KutykGGO {
    return new KutykGGO(this.id, this.name, this.root.copy(), this.b, this.t, this.actualJsonSettings)
  }

  toJson(): KutykGGOJSON {
    return Object.assign(super.toJson(), {
      b: this.b,
      t: this.t
    })
  }

  static fromJson(json: GeogebraObjectJson): KutykGGO {
    const j = json as KutykGGOJSON;
    return new KutykGGO(j.id, j.name, XYCoords.fromJson(j.root), j.b, j.t, j.settings)
  }
}
