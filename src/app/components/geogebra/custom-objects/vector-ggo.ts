import {
  GeogebraObject,
  GeogebraObjectJson,
  GeogebraObjectSettings,
  GGOKindType
} from "./geogebra-object";
import { Angle, GeometryUtils, XYCoords, XYCoordsJson } from "../../../utils/geometryUtils";
import { PointGGO } from "./point-ggo";
import { TextGGO } from "./text-ggo";
import { NumberUtils } from "../../../utils/NumberUtils";
import { GeogebraObjectUtils } from "./geogebra-object-utils";

export interface VectorGGOJSON extends GeogebraObjectJson {
  end: XYCoordsJson
  settings: GeogebraObjectSettings
}

export class VectorGGO implements GeogebraObject {
  kind: GGOKindType = "vector";

  rootPoint: PointGGO;
  endPoint: PointGGO;

  private readonly shapeId: string;

  constructor(public name: string, public root: XYCoords, public end: XYCoords, public settings?: GeogebraObjectSettings, public id: number = GeogebraObjectUtils.nextId()) {
    this.shapeId = `Vector${this.name}${this.id}`;
    const withId = (elementName: string) => `${this.shapeId}${elementName}`;
    this.rootPoint = new PointGGO(withId("Root"), this.root.copy());
    this.endPoint = new PointGGO(withId("End"), this.end.copy());
    this.settings = GeogebraObjectUtils.settingsWithDefaults(settings)
  }

  rotate(angle: Angle, point: XYCoords = this.root): VectorGGO {
    this.rootPoint.rotate(angle, point);
    this.endPoint.rotate(angle, point);
    return this;
  }

  copy(): VectorGGO {
    return new VectorGGO(this.name, this.root.copy(), this.end.copy(), this.settings);
  }

  getCommands(): string[] {
    return [
      ...this.rootPoint.getCommands(),
      ...this.endPoint.getCommands(),
      `${this.shapeId}=Vector(${this.rootPoint.shapeId},${this.endPoint.shapeId})`,
      `ShowLabel(${this.shapeId},${this.settings.isLabelVisible})`,
      `SetLineThickness(${this.shapeId},${this.settings.lineThickness})`,
      ...(this.settings.isVisible && this.settings.styles.color ? [`SetColor(${this.shapeId},"${this.settings.styles.color}")`] : [])
    ]
  }

  toJson(): VectorGGOJSON {
    return {
      name: this.name,
      kind: this.kind,
      root: this.rootPoint.root.toJson(),
      end: this.endPoint.root.toJson(),
      settings: this.settings,
      id: this.id
    }
  }

  static fromJson(json: GeogebraObjectJson): VectorGGO {
    const j = json as VectorGGOJSON;
    return new VectorGGO(j.name, XYCoords.fromJson(j.root), XYCoords.fromJson(j.end), j.settings, j.id)
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
      this.endPoint.root
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
