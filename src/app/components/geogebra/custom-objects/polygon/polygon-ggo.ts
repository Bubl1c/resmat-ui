import { GeogebraObject, GeogebraObjectJson, GeogebraObjectSettings, GGOKindType } from "../geogebra-object";
import { PointGGO, PointGGOJSON } from "../point-ggo";
import { Angle, XYCoords, XYCoordsJson } from "../../../../utils/geometryUtils";
import { NumberUtils } from "../../../../utils/NumberUtils";
import { GeogebraObjectUtils } from "../geogebra-object-utils";
import { GGB } from "../../geogebra-definitions";
import LabelMode = GGB.LabelMode;
import { SizeGGO } from "../size-ggo";
import { ColorUtils } from "../../../../utils/color-utils";

export interface PolygonSettingsJson extends GeogebraObjectSettings {}

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

  protected points: PointGGO[] = [];
  protected centerPoint: PointGGO;
  protected outerPointNames: Set<string>;

  protected sizes: SizeGGO[] = [];

  protected shapeId = `${this.name}${this.id}`;

  constructor(
    public id: number,
    public name: string,
    public root: XYCoords,
    settings?: PolygonSettingsJson
  ) {
    this.settings = GeogebraObjectUtils.settingsWithDefaults(settings);
    this.settings.showSizes = settings && settings.showSizes || true;
    this.settings.styles.color = ColorUtils.nextLightGreyColor();

    this.actualJsonSettings = settings;
  }

  rotate(angle: Angle, point: XYCoords = this.root.copy()): PolygonGGO {
    this.root.rotate(angle, point);
    this.points.forEach(p => {
      p.rotate(angle, point)
    });
    this.sizes.forEach(s => {
      s.rotate(angle, point)
    });
    this.centerPoint.rotate(angle, point);
    return this
  }

  abstract copy(): GeogebraObject;

  getCommands(): string[] {
    return [
      ...this.points.map(s => s.getCommands()).reduce((prev, cur) => prev.concat(cur), []),
      ...this.centerPoint.getCommands(),
      `${this.shapeId}=Polygon(${Array.from(this.points.map(p => p.shapeId)).join(",")})`,
      `SetLineThickness(${this.shapeId},0)`,
      `SetVisibleInView(${this.shapeId},1,${ this.settings.isVisible})`,
      `ShowLabel(${this.shapeId},${this.settings.isLabelVisible})`,
      `SetCaption(${this.shapeId},"${this.settings.caption}")`,
      `SetFixed(${this.shapeId},${this.settings.isFixed})`,
      `SetColor(${this.shapeId},"${this.settings.styles.color}")`,
      `SetFilling(${this.shapeId},${this.settings.styles.opacityPercents/100})`,
      ...this.sizes.map(s => s.getCommands()).reduce((prev, cur) => prev.concat(cur),[]),
    ]
  }

  toJson(): PolygonGGOJSON {
    return {
      id: this.id,
      kind: this.kind,
      root: this.root.toJson(),
      name: this.name,
      settings: this.actualJsonSettings
    }
  };

  maxCoord(): XYCoordsJson {
    const pointsMaxCoords = this.sizes.length > 0
      ? this.sizes.map(s => s.maxCoord())
      : this.points.map(s => s.maxCoord());
    return {
      x: NumberUtils.maxAbs(...pointsMaxCoords.map(smc => smc.x)),
      y: NumberUtils.maxAbs(...pointsMaxCoords.map(smc => smc.y))
    }
  }

  getDeleteCommands(): string[] {
    return [
      ...this.points.map(p => p.getDeleteCommands()).reduce((prev, cur) => prev.concat(cur)),
      ...this.centerPoint.getDeleteCommands(),
      ...this.sizes.map(s => s.getDeleteCommands()).reduce((prev, cur) => prev.concat(cur), []),
    ]
  }

  getPointCoords(pointName: string): XYCoords {
    const point = this.points.find(p => p.name === this.withId(pointName));
    if (!point) {
      throw new Error(`Point with name ${pointName} has not been found in polygon ${this.name}`)
    }
    return point.root.copy()
  }

  getCenterCoords(): XYCoordsJson {
    return this.centerPoint.root.copy()
  }

  getSize(): { width: number; height: number } {
    const center = this.getCenterCoords();
    return {
      width: Math.abs(this.root.x - center.x) * 2,
      height: Math.abs(this.root.y - center.y) * 2
    }
  }

  protected withId = (elementName: string) => `${this.shapeId}${elementName}`;

  protected outerPointSettings(): GeogebraObjectSettings {
    return {
      isVisible: this.settings && this.settings.outerPoints && this.settings.outerPoints.isVisible || true,
      isLabelVisible: this.settings && this.settings.outerPoints && this.settings.outerPoints.isLabelsVisible || true,
      labelMode: this.settings && this.settings.outerPoints && this.settings.outerPoints.labelMode || GGB.LabelMode.Value
    }
  };

  protected makeCenterPoint(coords: XYCoords): PointGGO {
    return new PointGGO(this.withId("Center"), coords, {
      isVisible: true,
      isLabelVisible: true,
      labelMode: LabelMode.Caption,
      caption: `C${this.id}`
    });
  }
}
