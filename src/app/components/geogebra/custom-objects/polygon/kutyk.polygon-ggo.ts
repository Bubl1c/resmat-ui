import { GeogebraObjectJson, GGOKindType } from "../geogebra-object";
import { PointGGO, PointGGOJSON, PointSettingsJson } from "../point-ggo";
import { CoordsUtils, XYCoords } from "../../../../utils/geometryUtils";
import { Sortament } from "../../../../utils/sortament";
import { PolygonGGO, PolygonSettingsJson } from "./polygon-ggo";
import XY = CoordsUtils.XY;
import { GGB } from "../../geogebra-definitions";
import set = Reflect.set;

export interface KutykGGOJSON extends GeogebraObjectJson {
  b: number
  t: number
  settings?: PolygonSettingsJson
}

/**
 *  B t B1
 *   _
 *  | |
 *  | |
 * b| |   .C
 *  | |C1_________ A1
 *  |_____________| t
 *  Root   b       A
 */
export class KutykGGO extends PolygonGGO {
  kind: GGOKindType = "kutyk";

  static generatePoints(name: string, root: XYCoords, b: number, t: number, settings: PolygonSettingsJson): PointGGOJSON[] {
    const withName = (elementName: string) => `${name}${elementName}`;

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

    const showLabelSettings: PointSettingsJson = {
      isVisible: true,
      isLabelVisible: settings && settings.isPointLabelsVisible,
      labelMode: GGB.LabelMode.Value
    };

    const points =  [
      new PointGGO(withName("Root"), Root, showLabelSettings),
      new PointGGO(withName("B"), B, showLabelSettings),
      new PointGGO(withName("B1"), B1),
      new PointGGO(withName("C1"), C1, showLabelSettings),
      new PointGGO(withName("A1"), A1),
      new PointGGO(withName("A"), A, showLabelSettings)
    ];
    return points
  }

  constructor(
    public name: string,
    public root: XYCoords,
    public b: number,
    public t: number,
    settings?: PolygonSettingsJson
  ) {
    super(name, root, KutykGGO.generatePoints(name, root, b, t, settings), settings);
  }

  copy(): KutykGGO {
    return new KutykGGO(this.name, this.root.copy(), this.b, this.t, this.actualJsonSettings)
  }

  toJson(): KutykGGOJSON {
    return Object.assign(super.toJson(), {
      b: this.b,
      t: this.t
    })
  }

  static fromJson(json: GeogebraObjectJson): KutykGGO {
    const j = json as KutykGGOJSON;
    return new KutykGGO(j.name, XYCoords.fromJson(j.root), j.b, j.t, j.settings)
  }
}
