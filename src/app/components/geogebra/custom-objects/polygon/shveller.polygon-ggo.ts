import { GeogebraObjectJson, GeogebraObjectSettings, GGOKindType } from "../geogebra-object";
import { CoordsUtils, XYCoords, XYCoordsJson } from "../../../../utils/geometryUtils";
import { GGB } from "../../geogebra-definitions";
import { Sortament } from "../../../../utils/sortament";
import { PolygonGGO, PolygonGGOJSON, PolygonSettingsJson } from "./polygon-ggo";
import { PointGGO, PointGGOJSON } from "../point-ggo";
import XY = CoordsUtils.XY;
import LabelMode = GGB.LabelMode;
import { SizeGGO } from "../size-ggo";
import { DvotavrGGOSizeDirections } from "./dvotavr.polygon-ggo";
import { GeometryShapeJson, StringKV } from "../geometry-shape";
import { NumberUtils } from "../../../../utils/NumberUtils";

export interface ShvellerGGOSizeDirections extends StringKV {
  b?: "up" | "down"
  h?: "left" | "right"
  d?: "up" | "down"
  t?: "up" | "down"
}

export interface ShvellerGGOJSON extends PolygonGGOJSON {
  n: number
}

/**
 *
 * B1_______ B2
 *  | _______| t
 *  | |C1   D1
 * h|d| .C
 *  | |C2___D2
 *  |________| t
 * Root  b   B3
 */
export class ShvellerGGO extends PolygonGGO {
  private RootPoint: PointGGO;
  private B1Point: PointGGO;
  private B2Point: PointGGO;
  private D1Point: PointGGO;
  private C1Point: PointGGO;
  private C2Point: PointGGO;
  private D2Point: PointGGO;
  private B3Point: PointGGO;

  private sortament: Sortament.ShvellerType;

  constructor(
    public id: number,
    public name: string,
    public root: XYCoords,
    public n: number,
    settings?: PolygonSettingsJson,
    public sizeDirections?: ShvellerGGOSizeDirections,
    public rotationAngle?: number,
    public rotationPoint?: XYCoordsJson
  ) {
    super(id, name, root, "shveller", settings, rotationAngle, rotationPoint);
    this.generatePoints(root, n, settings);
    this.generateSizes(sizeDirections);
    this.applyRotation();
  }

  private generatePoints(root: XYCoords, n: number, settings: PolygonSettingsJson) {
    const withId = this.withId;

    const sortament = Sortament.Shveller[n + ""];
    if (!sortament) {
      throw new Error(`Shveller with number = ${n} has not been found in sortament!`)
    }
    this.sortament = sortament;
    const h = sortament.h/10;
    const b = sortament.b/10;
    const d = sortament.d/10;
    const t = sortament.t/10;

    const Root = root.copy();
    const B1 = XY(root.x, root.y + h);
    const B2 = XY(B1.x + b, B1.y);
    const D1 = XY(B2.x, B2.y - t);
    const C1 = XY(D1.x - b + d, D1.y);
    const C2 = XY(C1.x, C1.y - h + t * 2);
    const D2 = XY(C2.x + b - d, C2.y);
    const B3 = XY(root.x + b, root.y);

    this.RootPoint = new PointGGO(withId("Root"), Root, this.outerPointSettings());
    this.B1Point = new PointGGO(withId("B1"), B1);
    this.B2Point = new PointGGO(withId("B2"), B2);
    this.D1Point = new PointGGO(withId("D1"), D1);
    this.C1Point = new PointGGO(withId("C1"), C1);
    this.C2Point = new PointGGO(withId("C2"), C2);
    this.D2Point = new PointGGO(withId("D2"), D2);
    this.B3Point = new PointGGO(withId("B3"), B3);

    this.centerPoint = this.makeCenterPoint(XY(root.x + sortament.z_0, root.y + h/2));

    this.points = [this.RootPoint, this.B1Point, this.B2Point, this.D1Point, this.C1Point, this.C2Point, this.D2Point, this.B3Point];
  }

  private generateSizes(sizeDirections?: ShvellerGGOSizeDirections) {
    const rnd = (n: number) => NumberUtils.accurateRound(n, 2);
    const b = rnd(this.sortament.b/10);
    const h = rnd(this.sortament.h/10);
    const d = rnd(this.sortament.d/10);
    const t = rnd(this.sortament.t/10);
    const withId = this.withId;
    if (this.settings.showSizes) {
      const sizeDirs: ShvellerGGOSizeDirections = {
        b: sizeDirections && sizeDirections.b || "up",
        h: sizeDirections && sizeDirections.h || "right",
        d: sizeDirections && sizeDirections.d || "up",
        t: sizeDirections && sizeDirections.t || "up",
      };
      const shapeSize = this.settings.shapeSizeToCalculateSizeDepth || h;
      const sizeB = sizeDirs.b == "up"
        ? new SizeGGO(withId("SizeB"), this.B1Point.root.copy(), this.B2Point.root.copy(), sizeDirs.b, `b${this.id}=${b}`, shapeSize)
        : new SizeGGO(withId("SizeB"), this.RootPoint.root.copy(), this.B3Point.root.copy(), sizeDirs.b, `b${this.id}=${b}`, shapeSize);

      const sizeH = sizeDirs.h == "right"
        ? new SizeGGO(withId("SizeH"), this.B3Point.root.copy(), this.B2Point.root.copy(), sizeDirs.h,`h${this.id}=${h}`, shapeSize, b/3)
        : new SizeGGO(withId("SizeH"), this.RootPoint.root.copy(), this.B1Point.root.copy(), sizeDirs.h,`h${this.id}=${h}`, shapeSize, b/3);

      const sizeT = sizeDirs.t == "up"
        ? new SizeGGO(withId("SizeT"), this.D1Point.root.copy(), this.B2Point.root.copy(), "right",`t${this.id}=${t}`, shapeSize)
        : new SizeGGO(withId("SizeT"), this.B3Point.root.copy(), this.D2Point.root.copy(), "right",`t${this.id}=${t}`, shapeSize);

      const sizeD = sizeDirs.d == "up"
        ? new SizeGGO(withId("SizeD"), this.C1Point.root.updY(y => y - h/4), this.C1Point.root.updY(y => y - h/4).updX(x => x - d), sizeDirs.d,`d${this.id}=${d}`, shapeSize, 0.01, true)
        : new SizeGGO(withId("SizeD"), this.C1Point.root.updY(y => y - h/4*3), this.C1Point.root.updY(y => y - h/4*3).updX(x => x - d), sizeDirs.d,`d${this.id}=${d}`, shapeSize, 0.01, true);

      this.sizes = [sizeB, sizeH, sizeT, sizeD]
    }
  }

  copy(): ShvellerGGO {
    return new ShvellerGGO(this.id, this.name, this.root.copy(), this.n, this.actualJsonSettings, this.sizeDirections, this.rotationAngle, this.rotationPoint)
  }

  toJson(): GeometryShapeJson {
    return {
      id: this.id,
      name: this.name,
      shapeType: "Shveller",
      rotationAngle: this.rotationAngle,
      rotationPoint: this.rotationPoint,
      root: this.root.toJson(),
      dimensions: {
        n: this.n
      },
      sizeDirections: this.sizeDirections,
      settings: this.actualJsonSettings,
      props: {}
    }
  }

  static fromJson(json: GeogebraObjectJson): ShvellerGGO {
    const j = json as ShvellerGGOJSON;
    return new ShvellerGGO(j.id, j.name, XYCoords.fromJson(j.root), j.n, j.settings)
  }
}
