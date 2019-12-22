import { GGB } from "../geogebra-definitions";
import { GeogebraObject, GeogebraObjectJson, GGOKindType } from "./geogebra-object";
import { Angle, XYCoords, XYCoordsJson } from "../../../utils/geometryUtils";

export interface PointSettingsJson {
  isVisible?: boolean
  isLabelVisible?: boolean
  labelMode?: GGB.LabelMode
  pointSize?: number
  isFixed?: boolean
}
export interface PointGGOJSON extends GeogebraObjectJson {
  settings?: PointSettingsJson
}

export class PointGGO implements GeogebraObject {
  kind: GGOKindType = "point";
  settings: PointSettingsJson;

  constructor(public name: string,
              public root: XYCoords,
              settings?: PointSettingsJson) {
    this.settings = {
      isVisible: settings && settings.isVisible || false,
      isLabelVisible: settings && settings.isLabelVisible || false,
      labelMode: settings && settings.labelMode || GGB.LabelMode.NameValue,
      pointSize: settings && settings.pointSize || 3,
      isFixed: settings && settings.isFixed || true
    }
  }

  rotate(angle: Angle, point: XYCoords = new XYCoords(0, 0)): PointGGO {
    this.root.rotate(angle, point);
    return this
  }

  copy(): PointGGO {
    return new PointGGO(this.name, this.root.copy(), this.settings);
  }

  getCommands(): string[] {
    const pointCmd = `${this.name}=${this.root.getCommand()}`;
    return [
      pointCmd,
      ...(this.settings.labelMode !== GGB.LabelMode.Name ? [`SetLabelMode(${this.name},${this.settings.labelMode})`] : []),
      ...(!this.settings.isVisible ? [`SetVisibleInView(${this.name},1,false)`] : []),
      ...(this.settings.isVisible ? [`SetPointSize(${this.name},${this.settings.pointSize})`] : []),
      ...(this.settings.isVisible ? [`ShowLabel(${this.name},${this.settings.isLabelVisible})`] : []),
      ...(this.settings.isFixed ? [`SetFixed(${this.name},true)`] : [])
    ]
  }

  toJson(): PointGGOJSON {
    return this.copy()
  }

  static fromJson(json: GeogebraObjectJson): PointGGO {
    const j = json as PointGGOJSON;
    return new PointGGO(j.name, XYCoords.fromJson(j.root), j.settings)
  }

  maxCoord(): XYCoordsJson {
    return this.root.copy()
  }

  getDeleteCommands(): string[] {
    return [`Delete(${this.name})`]
  }
}
