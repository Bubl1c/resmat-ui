import { GGB } from "../geogebra-definitions";
import { GeogebraObject, GeogebraObjectJson, GeogebraObjectSettings, GGOKindType } from "./geogebra-object";
import { Angle, XYCoords, XYCoordsJson } from "../../../utils/geometryUtils";
import { GeogebraObjectUtils } from "./geogebra-object-utils";
import LabelMode = GGB.LabelMode;

export interface PointGGOJSON extends GeogebraObjectJson {
  settings?: GeogebraObjectSettings
}

export class PointGGO implements GeogebraObject {
  kind: GGOKindType = "point";
  settings: GeogebraObjectSettings;

  readonly shapeId: string;

  constructor(public name: string,
              public root: XYCoords,
              settings?: GeogebraObjectSettings,
              public id: number = GeogebraObjectUtils.nextId()) {
    this.settings = GeogebraObjectUtils.settingsWithDefaults(settings);
    this.settings.isVisible = settings && settings.isVisible || false;
    this.shapeId = `${this.name}${this.id}`;
  }

  rotate(angle: Angle, point: XYCoords = new XYCoords(0, 0)): PointGGO {
    this.root.rotate(angle, point);
    return this
  }

  copy(): PointGGO {
    return new PointGGO(this.name, this.root.copy(), this.settings);
  }

  getCommands(): string[] {
    const pointCmd = `${this.shapeId}=${this.root.getCommand()}`;
    return [
      pointCmd,
      ...(this.settings.labelMode !== GGB.LabelMode.Name ? [`SetLabelMode(${this.shapeId},${this.settings.labelMode})`] : []),
      ...(!this.settings.isVisible ? [`SetVisibleInView(${this.shapeId},1,false)`] : []),
      ...(this.settings.isVisible ? [`SetPointSize(${this.shapeId},${this.settings.pointSize})`] : []),
      ...(this.settings.isVisible ? [`ShowLabel(${this.shapeId},${this.settings.isLabelVisible})`] : []),
      ...(this.settings.isVisible && this.settings.labelMode === LabelMode.Caption && this.settings.isLabelVisible ? [`SetCaption(${this.shapeId},"${this.settings.caption}")`] : []),
      ...(this.settings.isVisible && this.settings.styles.color ? [`SetColor(${this.shapeId},"${this.settings.styles.color}")`] : []),
      ...(this.settings.isFixed ? [`SetFixed(${this.shapeId},true)`] : [])
    ]
  }

  toJson(): PointGGOJSON {
    return this.copy()
  }

  static fromJson(json: GeogebraObjectJson): PointGGO {
    const j = json as PointGGOJSON;
    return new PointGGO(j.name, XYCoords.fromJson(j.root), j.settings, j.id)
  }

  maxCoord(): XYCoordsJson {
    return this.root.copy()
  }

  getDeleteCommands(): string[] {
    return [`Delete(${this.shapeId})`]
  }

  getCenterCoords(): XYCoordsJson {
    return this.root.toJson()
  }

  getSize(): { width: number; height: number } {
    return {
      width: 0,
      height: 0
    }
  }
}
