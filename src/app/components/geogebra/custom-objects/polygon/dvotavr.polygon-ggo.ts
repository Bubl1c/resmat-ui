import { GeogebraObject, GeogebraObjectJson, GeogebraObjectSettings, GGOKindType } from "../geogebra-object";
import { Angle, CoordsUtils, XYCoords, XYCoordsJson } from "../../../../utils/geometryUtils";
import { GGB } from "../../geogebra-definitions";
import { Sortament } from "../../../../utils/sortament";
import { NumberUtils } from "../../../../utils/NumberUtils";
import { SegmentGGO, SegmentSettingsJson } from "../segment-ggo";
import XY = CoordsUtils.XY;
import { PolygonGGO, PolygonGGOJSON, PolygonSettingsJson } from "./polygon-ggo";
import { PointGGO, PointGGOJSON } from "../point-ggo";
import { GeogebraObjectUtils } from "../geogebra-object-utils";
import LabelMode = GGB.LabelMode;
import { SizeGGO } from "../size-ggo";
import { KutykGGOSizeDirections } from "./kutyk.polygon-ggo";
import { GeometryShapeJson, StringKV } from "../geometry-shape";

export interface DvotavrGGOSizeDirections extends StringKV {
  b?: "up" | "down"
  h?: "left" | "right"
  s?: "up" | "down"
  t?: "left" | "right"
}

export interface DvotavrGGOJSON extends PolygonGGOJSON {
  n: number
}

/**
 *
 *  B2___________B3
 *  t|____   ____|  |
 *  B1  C2|s|C3  B4 |
 *        |.|C      | h
 *  A2__C1| |C4__A3 |
 *  t|___________|  |
 * Root    b     A4
 */
export class DvotavrGGO extends PolygonGGO{
  private RootPoint: PointGGO;
  private A2Point: PointGGO;
  private C1Point: PointGGO;
  private C2Point: PointGGO;
  private B1Point: PointGGO;
  private B2Point: PointGGO;
  private B3Point: PointGGO;
  private B4Point: PointGGO;
  private C3Point: PointGGO;
  private C4Point: PointGGO;
  private A3Point: PointGGO;
  private A4Point: PointGGO;

  private sortament: Sortament.DvotavrType;

  constructor(
    public id: number,
    public name: string,
    public root: XYCoords,
    public n: number,
    settings?: PolygonSettingsJson,
    public sizeDirections?: DvotavrGGOSizeDirections,
    public rotationAngle?: number,
    public rotationPoint?: XYCoordsJson,
  ) {
    super(id, name, root, "dvotavr", settings, rotationAngle, rotationPoint);
    this.generatePoints(root, n, settings);
    this.generateSizes(sizeDirections);
    this.applyRotation();
  }

  private generatePoints(root: XYCoords, n: number, settings?: PolygonSettingsJson) {
    const withId = this.withId;

    const sortament = Sortament.Dvotavr[n + ""];
    if (!sortament) {
      throw new Error(`Dvotavr with number = ${n} has not been found in sortament!`)
    }
    this.sortament = sortament;
    const h = sortament.h/10;
    const b = sortament.b/10;
    const s = sortament.s/10;
    const t = sortament.t/10;

    const innerSide = b / 2 - s / 2;
    const leg = h - t * 2;

    const Root = root.copy();
    const A2 = XY(root.x, root.y + t);
    const C1 = XY(A2.x + innerSide, A2.y);
    const C2 = XY(C1.x, C1.y + leg);
    const B1 = XY(C2.x - innerSide, C2.y);
    const B2 = XY(B1.x, B1.y + t);
    const B3 = XY(B2.x + b, B2.y);
    const B4 = XY(B3.x, B3.y - t);
    const C3 = XY(C2.x + s, C2.y);
    const C4 = XY(C1.x + s, C1.y);
    const A3 = XY(C4.x + innerSide, C4.y);
    const A4 = XY(root.x + b, root.y);

    this.RootPoint = new PointGGO(withId("Root"), Root, this.outerPointSettings());
    this.A2Point = new PointGGO(withId("A2"), A2);
    this.C1Point = new PointGGO(withId("C1"), C1);
    this.C2Point = new PointGGO(withId("C2"), C2);
    this.B1Point = new PointGGO(withId("B1"), B1);
    this.B2Point = new PointGGO(withId("B2"), B2);
    this.B3Point = new PointGGO(withId("B3"), B3);
    this.B4Point = new PointGGO(withId("B4"), B4);
    this.C3Point = new PointGGO(withId("C3"), C3);
    this.C4Point = new PointGGO(withId("C4"), C4);
    this.A3Point = new PointGGO(withId("A3"), A3);
    this.A4Point = new PointGGO(withId("A4"), A4);

    this.centerPoint = this.makeCenterPoint(XY(root.x + b/2, root.y + h/2));

    this.points =  [
      this.RootPoint, this.A2Point, this.C1Point, this.C2Point, this.B1Point, this.B2Point, this.B3Point, this.B4Point, this.C3Point, this.C4Point, this.A3Point, this.A4Point
    ];
  }

  private generateSizes(sizeDirections?: DvotavrGGOSizeDirections) {
    const rnd = (n: number) => NumberUtils.accurateRound(n, 2);
    const b = rnd(this.sortament.b/10);
    const h = rnd(this.sortament.h/10);
    const s = rnd(this.sortament.s/10);
    const t = rnd(this.sortament.t/10);
    const withId = this.withId;
    if (this.settings.showSizes) {
      const sizeDirs: DvotavrGGOSizeDirections = {
        b: sizeDirections && sizeDirections.b || "up",
        h: sizeDirections && sizeDirections.h || "right",
        s: sizeDirections && sizeDirections.s || "up",
        t: sizeDirections && sizeDirections.t || "right",
      };
      const shapeSize = this.settings.shapeSizeToCalculateSizeDepth || h;
      const sizeB = sizeDirs.b == "up"
        ? new SizeGGO(withId("SizeB"), this.B2Point.root.copy(), this.B3Point.root.copy(), sizeDirs.b, `b${this.id}=${b}`, shapeSize)
        : new SizeGGO(withId("SizeB"), this.RootPoint.root.copy(), this.A4Point.root.copy(), sizeDirs.b, `b${this.id}=${b}`, shapeSize);

      const sizeH = sizeDirs.h == "right"
        ? new SizeGGO(withId("SizeH"), this.B3Point.root.copy(), this.A4Point.root.copy(), sizeDirs.h,`h${this.id}=${h}`, shapeSize, b/3)
        : new SizeGGO(withId("SizeH"), this.RootPoint.root.copy(), this.B2Point.root.copy(), sizeDirs.h,`h${this.id}=${h}`, shapeSize, b/3);

      const sizeT = sizeDirs.t == "right"
        ? new SizeGGO(withId("SizeT"), this.A4Point.root.copy(), this.A3Point.root.copy(), sizeDirs.t,`t${this.id}=${t}`, shapeSize)
        : new SizeGGO(withId("SizeT"), this.A2Point.root.copy(), this.RootPoint.root.copy(), sizeDirs.t,`t${this.id}=${t}`, shapeSize);

      const sizeS = sizeDirs.s == "up"
        ? new SizeGGO(withId("SizeS"), this.C3Point.root.updY(y => y - h/4), this.C2Point.root.updY(y => y - h/4), sizeDirs.s,`s${this.id}=${s}`, shapeSize, 0.01, true)
        : new SizeGGO(withId("SizeS"), this.C3Point.root.updY(y => y - h/4*3), this.C2Point.root.updY(y => y - h/4*3), sizeDirs.s,`s${this.id}=${s}`, shapeSize, 0.01, true);

      this.sizes = [sizeB, sizeH, sizeT, sizeS]
    }
  }

  copy(): DvotavrGGO {
    return new DvotavrGGO(this.id, this.name, this.root.copy(), this.n, this.actualJsonSettings, this.sizeDirections, this.rotationAngle, this.rotationPoint)
  }

  toJson(): GeometryShapeJson {
    return {
      id: this.id,
      name: this.name,
      shapeType: "Dvotavr",
      rotationAngle: this.rotationAngle,
      rotationPoint: this.rotationPoint,
      root: this.root.toJson(),
      dimensions: {
        n: this.n
      },
      sizeDirections: this.sizeDirections,
      settings: this.actualJsonSettings,
      props: undefined
    }
  }
}
