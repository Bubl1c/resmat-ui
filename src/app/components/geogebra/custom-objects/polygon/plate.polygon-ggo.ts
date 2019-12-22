import { GeogebraObjectJson, GGOKindType } from "../geogebra-object";
import { CoordsUtils, XYCoords } from "../../../../utils/geometryUtils";
import { GGB } from "../../geogebra-definitions";
import { PolygonGGO, PolygonSettingsJson } from "./polygon-ggo";
import { PointGGO, PointGGOJSON, PointSettingsJson } from "../point-ggo";
import XY = CoordsUtils.XY;

export interface PlateGGOJSON extends GeogebraObjectJson {
  b: number
  h: number
  settings?: PolygonSettingsJson
}

/**
 * B            C1
 *  -----------
 *  |          |
 *  |    .C    | h
 *  |          |
 *  |_________ |
 * Root  b      D
 */
export class PlateGGO extends PolygonGGO {
  kind: GGOKindType = "plate";

  static generatePoints(name: string, root: XYCoords, b: number, h: number, settings: PolygonSettingsJson): PointGGOJSON[] {
    const withName = (elementName: string) => `${name}${elementName}`;

    const Root = root.copy();
    const B = XY(Root.x, Root.y + h);
    const C1 = XY(Root.x + b, Root.y + h);
    const D = XY(Root.x + b, Root.y);

    const showLabelSettings: PointSettingsJson = {
      isVisible: true,
      isLabelVisible: settings && settings.isPointLabelsVisible,
      labelMode: GGB.LabelMode.Value
    };

    const points = [
      new PointGGO(withName("Root"), root, showLabelSettings),
      new PointGGO(withName("B"), B, showLabelSettings),
      new PointGGO(withName("C1"), C1, showLabelSettings),
      new PointGGO(withName("D"), D, showLabelSettings)
    ];
    return points
  }

  constructor(
    public name: string,
    public root: XYCoords,
    public b: number,
    public h: number,
    settings?: PolygonSettingsJson
  ) {
    super(name, root, PlateGGO.generatePoints(name, root, b, h, settings), settings);
  }

  copy(): PlateGGO {
    return new PlateGGO(this.name, this.root.copy(), this.b, this.h, this.actualJsonSettings)
  }

  toJson(): PlateGGOJSON {
    return Object.assign(super.toJson(), {
      b: this.b,
      h: this.h
    })
  }

  static fromJson(json: GeogebraObjectJson): PlateGGO {
    const j = json as PlateGGOJSON;
    return new PlateGGO(j.name, XYCoords.fromJson(j.root), j.b, j.h, j.settings)
  }
}
