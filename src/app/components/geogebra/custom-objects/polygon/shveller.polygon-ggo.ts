import { GeogebraObjectJson, GGOKindType } from "../geogebra-object";
import { CoordsUtils, XYCoords } from "../../../../utils/geometryUtils";
import { GGB } from "../../geogebra-definitions";
import { Sortament } from "../../../../utils/sortament";
import { PolygonGGO, PolygonGGOJSON, PolygonSettingsJson } from "./polygon-ggo";
import { PointGGO, PointGGOJSON, PointSettingsJson } from "../point-ggo";
import XY = CoordsUtils.XY;

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
  kind: GGOKindType = "shveller";

  static generatePoints(name: string, root: XYCoords, n: number, settings: PolygonSettingsJson): PointGGOJSON[] {
    const withName = (elementName: string) => `${name}${elementName}`;

    const sortament = Sortament.Shveller[n + ""];
    if (!sortament) {
      throw new Error(`Shveller with number = ${n} has not been found in sortament!`)
    }
    const h = sortament.h;
    const b = sortament.b;
    const d = sortament.d;
    const t = sortament.t;

    const Root = root.copy();
    const B1 = XY(root.x, root.y + h);
    const B2 = XY(B1.x + b, B1.y);
    const D1 = XY(B2.x, B2.y - t);
    const C1 = XY(D1.x - b + d, D1.y);
    const C2 = XY(C1.x, C1.y - h + t * 2);
    const D2 = XY(C2.x + b - d, C2.y);
    const B3 = XY(root.x + b, root.y);

    const showLabelSettings: PointSettingsJson = {
      isVisible: true,
      isLabelVisible: settings && settings.isPointLabelsVisible,
      labelMode: GGB.LabelMode.Value
    };

    const points = [
      new PointGGO(withName("Root"), Root, showLabelSettings),
      new PointGGO(withName("B1"), B1, showLabelSettings),
      new PointGGO(withName("B2"), B2, showLabelSettings),
      new PointGGO(withName("D1"), D1),
      new PointGGO(withName("C1"), C1, showLabelSettings),
      new PointGGO(withName("C2"), C2, showLabelSettings),
      new PointGGO(withName("D2"), D2),
      new PointGGO(withName("B3"), B3, showLabelSettings)
    ];
    return points
  }

  constructor(
    public name: string,
    public root: XYCoords,
    public n: number,
    settings?: PolygonSettingsJson
  ) {
    super(name, root, ShvellerGGO.generatePoints(name, root, n, settings), settings);
  }

  copy(): ShvellerGGO {
    return new ShvellerGGO(this.name, this.root.copy(), this.n, this.actualJsonSettings)
  }

  toJson(): ShvellerGGOJSON {
    return Object.assign(super.toJson(), {
      n: this.n
    })
  }

  static fromJson(json: GeogebraObjectJson): ShvellerGGO {
    const j = json as ShvellerGGOJSON;
    return new ShvellerGGO(j.name, XYCoords.fromJson(j.root), j.n, j.settings)
  }
}
