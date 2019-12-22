import { GeogebraObject, GeogebraObjectJson, GGOKindType } from "../geogebra-object";
import { PointGGO, PointGGOJSON } from "../point-ggo";
import { Angle, XYCoords, XYCoordsJson } from "../../../../utils/geometryUtils";
import { NumberUtils } from "../../../../utils/NumberUtils";
import { ColorUtils } from "../../../../utils/color-utils";
import { GGB } from "../../geogebra-definitions";

export interface PolygonSettingsJson {
  isVisible?: boolean
  isLabelVisible?: boolean
  labelMode?: GGB.LabelMode
  caption?: string
  isFixed?: boolean
  styles?: {
    opacityPercents?: number
    color?: string //hex like #AARRGGBB or canonical color name, see more at https://wiki.geogebra.org/en/SetColor_Command
  }
  isPointLabelsVisible?: boolean
}
export interface PolygonGGOJSON extends GeogebraObjectJson {
  settings?: PolygonSettingsJson
}

export abstract class PolygonGGO implements GeogebraObject {
  abstract kind: GGOKindType;

  /**
   * Needed to keep the original JSON
   */
  protected actualJsonSettings: PolygonSettingsJson;
  protected settings: PolygonSettingsJson;

  protected points: PointGGO[];

  protected withName = (elementName: string) => `${this.name}${elementName}`;

  constructor(
    public name: string,
    public root: XYCoords,
    points: PointGGOJSON[],
    settings?: PolygonSettingsJson
  ) {
    this.points = points.map(p => {
      return new PointGGO(p.name, XYCoords.fromJson(p.root), p.settings)
    });
    this.actualJsonSettings = settings;
    this.settings = {
      isVisible: settings && settings.isVisible || true,
      isLabelVisible: settings && settings.isLabelVisible || false,
      labelMode: settings && settings.labelMode ||
        settings && settings.caption && GGB.LabelMode.Caption ||
        GGB.LabelMode.Name,
      caption: settings && settings.caption || this.name,
      isFixed: settings && settings.isFixed || true,
      styles: settings && {
        opacityPercents: settings.styles && settings.styles.opacityPercents || 70,
        color: settings.styles && settings.styles.color || ColorUtils.randomColor(ColorUtils.darkColors)
      },
      isPointLabelsVisible: settings && settings.isPointLabelsVisible || false
    };
  }

  rotate(angle: Angle, point: XYCoords = this.root.copy()): PolygonGGO {
    this.root.rotate(angle, point);
    this.points.forEach(p => {
      p.rotate(angle, point)
    });
    return this
  }

  abstract copy(): GeogebraObject;

  getCommands(): string[] {
    return [
      ...this.points.map(s => s.getCommands()).reduce((prev, cur) => prev.concat(cur)),
      `${this.name}=Polygon(${Array.from(this.points.map(p => p.name)).join(",")})`,
      `SetLineThickness(${this.name},0)`,
      `SetVisibleInView(${this.name},1,${ this.settings.isVisible})`,
      `ShowLabel(${this.name},${this.settings.isLabelVisible})`,
      `SetCaption(${this.name},"${this.settings.caption}")`,
      `SetFixed(${this.name},${this.settings.isFixed})`,
      `SetColor(${this.name},"${this.settings.styles.color}")`,
      `SetFilling(${this.name},${this.settings.styles.opacityPercents/100})`
    ]
  }

  toJson(): PolygonGGOJSON {
    return {
      kind: this.kind,
      root: this.root.toJson(),
      name: this.name,
      settings: this.actualJsonSettings
    }
  };

  maxCoord(): XYCoordsJson {
    const pointsMaxCoords = this.points.map(s => s.maxCoord());
    return {
      x: NumberUtils.maxAbs(...pointsMaxCoords.map(smc => smc.x)),
      y: NumberUtils.maxAbs(...pointsMaxCoords.map(smc => smc.y))
    }
  }

  getDeleteCommands(): string[] {
    return this.points.map(s => s.getDeleteCommands()).reduce((prev, cur) => prev.concat(cur))
  }

  getPointCoords(pointName: string): XYCoords {
    const point = this.points.find(p => p.name === this.withName(pointName));
    if (!point) {
      throw new Error(`Point with name ${pointName} has not been found in polygon ${this.name}`)
    }
    return point.root.copy()
  }
}
