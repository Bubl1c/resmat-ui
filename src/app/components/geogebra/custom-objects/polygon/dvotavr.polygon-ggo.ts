import { GeogebraObject, GeogebraObjectJson, GGOKindType } from "../geogebra-object";
import { Angle, CoordsUtils, XYCoords, XYCoordsJson } from "../../../../utils/geometryUtils";
import { GGB } from "../../geogebra-definitions";
import { Sortament } from "../../../../utils/sortament";
import { NumberUtils } from "../../../../utils/NumberUtils";
import { SegmentGGO, SegmentSettingsJson } from "../segment-ggo";
import XY = CoordsUtils.XY;
import { PolygonGGO, PolygonGGOJSON, PolygonSettingsJson } from "./polygon-ggo";
import { PointGGO, PointGGOJSON, PointSettingsJson } from "../point-ggo";

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
  kind: GGOKindType = "dvotavr";

  static generatePoints(name: string, root: XYCoords, n: number, settings: PolygonSettingsJson): PointGGOJSON[] {
    const withName = (elementName: string) => `${name}${elementName}`;

    const sortament = Sortament.Dvotavr[n + ""];
    if (!sortament) {
      throw new Error(`Dvotavr with number = ${n} has not been found in sortament!`)
    }
    const h = sortament.h;
    const b = sortament.b;
    const s = sortament.s;
    const t = sortament.t;

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

    const showLabelSettings: PointSettingsJson = {
      isVisible: true,
      isLabelVisible: settings && settings.isPointLabelsVisible,
      labelMode: GGB.LabelMode.Value
    };

    const points =  [
      new PointGGO(withName("Root"), Root, showLabelSettings),
      new PointGGO(withName("A2"), A2),
      new PointGGO(withName("C1"), C1, showLabelSettings),
      new PointGGO(withName("C2"), C2, showLabelSettings),
      new PointGGO(withName("B1"), B1),
      new PointGGO(withName("B2"), B2, showLabelSettings),
      new PointGGO(withName("B3"), B3, showLabelSettings),
      new PointGGO(withName("B4"), B4),
      new PointGGO(withName("C3"), C3, showLabelSettings),
      new PointGGO(withName("C4"), C4, showLabelSettings),
      new PointGGO(withName("A3"), A3),
      new PointGGO(withName("A4"), A4, showLabelSettings)
    ];
    return points
  }

  constructor(
    public name: string,
    public root: XYCoords,
    public n: number,
    settings?: PolygonSettingsJson
  ) {
    super(name, root, DvotavrGGO.generatePoints(name, root, n, settings), settings);
  }

  copy(): DvotavrGGO {
    return new DvotavrGGO(this.name, this.root.copy(), this.n, this.actualJsonSettings)
  }

  toJson(): DvotavrGGOJSON {
    return Object.assign(super.toJson(), {
      n: this.n
    })
  }

  static fromJson(json: GeogebraObjectJson): DvotavrGGO {
    const j = json as DvotavrGGOJSON;
    return new DvotavrGGO(j.name, XYCoords.fromJson(j.root), j.n, j.settings)
  }
}
