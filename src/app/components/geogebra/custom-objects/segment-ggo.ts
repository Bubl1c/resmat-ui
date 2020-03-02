import { GeogebraObject, GeogebraObjectJson, GeogebraObjectSettings, GGOKindType } from "./geogebra-object";
import { Angle, GeometryUtils, XYCoords, XYCoordsJson } from "../../../utils/geometryUtils";
import { PointGGO } from "./point-ggo";
import { NumberUtils } from "../../../utils/NumberUtils";
import { GeogebraObjectUtils } from "./geogebra-object-utils";

export interface SegmentSettingsJson extends GeogebraObjectSettings {
  root?: GeogebraObjectSettings
  end?: GeogebraObjectSettings
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

  private readonly shapeId: string;

  constructor(public name: string, public root: XYCoords, public end: XYCoords, settings?: SegmentSettingsJson, public id: number = GeogebraObjectUtils.nextId()) {
    this.shapeId = `Segment${this.name}${this.id}`;
    this.settings = GeogebraObjectUtils.settingsWithDefaults(settings);
    this.settings.root = settings && settings.root || undefined;
    this.settings.end = settings && settings.end || undefined;
    this.settings.isVisible = settings && settings.isVisible || false;
    const withId = (elementName: string) => `${this.shapeId}${elementName}`;
    this.rootPoint = new PointGGO(withId("Root"), this.root.copy(), this.settings.root);
    this.endPoint = new PointGGO(withId("End"), this.end.copy(), this.settings.end);
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
      `${this.shapeId}=Segment(${this.rootPoint.shapeId},${this.endPoint.shapeId}${parentNameParameter})`,
      ...(!this.settings.isVisible ? [`SetVisibleInView(${this.shapeId},1,false)`] : []),
      ...(this.settings.isVisible && this.settings.styles.color ? [`SetColor(${this.shapeId},"${this.settings.styles.color}")`] : []),
      `ShowLabel(${this.shapeId},${this.settings.isLabelVisible})`,
      `SetFixed(${this.shapeId},${this.settings.isFixed})`,
      `SetLineThickness(${this.shapeId},${this.settings.lineThickness})`
    ]
  }

  toJson(): SegmentGGOJSON {
    return {
      kind: this.kind,
      root: this.root.toJson(),
      end: this.end.toJson(),
      name: this.name,
      settings: this.settings,
      id: this.id
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
      x: Math.max(rootMC.x, endMC.x),
      y: Math.max(rootMC.y, endMC.y)
    }
  }

  minCoord(): XYCoordsJson {
    const rootMC = this.rootPoint.minCoord();
    const endMC = this.endPoint.minCoord();
    return {
      x: Math.min(rootMC.x, endMC.x),
      y: Math.min(rootMC.y, endMC.y)
    }
  }

  getDeleteCommands(): string[] {
    return [...this.rootPoint.getDeleteCommands(), ...this.endPoint.getDeleteCommands()]
  }

  getCenterCoords(): XYCoordsJson {
    return GeometryUtils.segmentCenter(
      this.rootPoint.root,
      this.endPoint.root,
    )
  }

  getDimensions(): { width: number; height: number } {
    const center = this.getCenterCoords();
    return {
      width: Math.abs(this.root.x - center.x) * 2,
      height: Math.abs(this.root.y - center.y) * 2
    }
  }
}
