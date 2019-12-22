import { GeogebraObject, GeogebraObjectJson, GGOKindType } from "./geogebra-object";
import { Angle, XYCoords, XYCoordsJson } from "../../../utils/geometryUtils";
import { PointGGO, PointSettingsJson } from "./point-ggo";
import { NumberUtils } from "../../../utils/NumberUtils";

export interface SegmentSettingsJson {
  root?: PointSettingsJson
  end?: PointSettingsJson
  isVisible?: boolean
  isLabelVisible?: boolean
  isFixed?: boolean
}
export interface SegmentGGOJSON extends GeogebraObjectJson {
  end: XYCoordsJson
  settings?: SegmentSettingsJson
}

export class SegmentGGO implements GeogebraObject {
  kind: GGOKindType = "segment";
  settings: SegmentSettingsJson;

  rootPoint: PointGGO;
  endPoint: PointGGO;
  parentName?: string;

  constructor(public name: string, public root: XYCoords, public end: XYCoords, settings?: SegmentSettingsJson) {
    this.settings = {
      root: settings && settings.root || undefined,
      end: settings && settings.end || undefined,
      isLabelVisible: settings && settings.isLabelVisible || false,
      isFixed: settings && settings.isFixed || true
    };
    const withName = (elementName: string) => `${this.name}${elementName}`;
    this.rootPoint = new PointGGO(withName("Root"), this.root.copy(), this.settings.root);
    this.endPoint = new PointGGO(withName("End"), this.end.copy(), this.settings.end);
  }

  rotate(angle: Angle, point: XYCoords = this.root): SegmentGGO {
    this.root = this.root.rotate(angle, point);
    this.end = this.end.rotate(angle, point);
    this.rootPoint = this.rootPoint.rotate(angle, point);
    this.endPoint = this.endPoint.rotate(angle, point);
    return this;
  }

  copy(): SegmentGGO {
    return new SegmentGGO(this.name, this.root.copy(), this.end.copy(), this.settings);
  }

  getCommands(): string[] {
    const parentNameParameter = this.parentName ? `,${this.parentName}` : "";
    return [
      ...this.rootPoint.getCommands(),
      ...this.endPoint.getCommands(),
      `${this.name}=Segment(${this.rootPoint.name},${this.endPoint.name}${parentNameParameter})`,
      ...(!this.settings.isVisible ? [`SetVisibleInView(${this.name},1,false)`] : []),
      `ShowLabel(${this.name},${this.settings.isLabelVisible})`,
      `SetFixed(${this.name},${this.settings.isFixed})`
    ]
  }

  toJson(): SegmentGGOJSON {
    return {
      kind: this.kind,
      root: this.root.toJson(),
      end: this.end.toJson(),
      name: this.name,
      settings: this.settings
    }
  }

  static fromJson(json: GeogebraObjectJson): SegmentGGO {
    const j = json as SegmentGGOJSON;
    return new SegmentGGO(j.name, XYCoords.fromJson(j.root), XYCoords.fromJson(j.end), j.settings)
  }

  maxCoord(): XYCoordsJson {
    const rootMC = this.rootPoint.maxCoord();
    const endMC = this.endPoint.maxCoord();
    return {
      x: NumberUtils.maxAbs(rootMC.x, endMC.x),
      y: NumberUtils.maxAbs(rootMC.y, endMC.y)
    }
  }

  getDeleteCommands(): string[] {
    return [...this.rootPoint.getDeleteCommands(), ...this.endPoint.getDeleteCommands()]
  }
}
