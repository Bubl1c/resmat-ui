import {
  GeogebraObject,
  GeogebraObjectJson,
  GeogebraObjectSettings,
  GGOKindType
} from "./geogebra-object";
import { Angle, CoordsUtils, GeometryUtils, XYCoords, XYCoordsJson } from "../../../utils/geometryUtils";
import { TextGGO } from "./text-ggo";
import { NumberUtils } from "../../../utils/NumberUtils";
import { VectorGGO } from "./vector-ggo";
import XY = CoordsUtils.XY;
import { GeogebraObjectUtils } from "./geogebra-object-utils";
import { PointGGO } from "./point-ggo";
import { SegmentGGO } from "./segment-ggo";
import { StringUtils } from "../../../utils/StringUtils";
import { GeometryShapeJson } from "./geometry-shape";

export type SizeGGODirection = "up" | "down" | "left" | "right"

export interface SizeGGOJSON extends GeogebraObjectJson {
  end: XYCoordsJson
  depth: number
  shapeSize: number
  direction: SizeGGODirection
  label: string
}

/**
 *      endSegment  tail
 * end  -------------
 *      endVector  |
 *      rootVector | labelText
 * root -------------
 *        rootSegment
 *
 * depth == rootSegment.length == endSegment.length
 */
export class SizeGGO implements GeogebraObject {
  kind: GGOKindType = "size";

  rootSegment: SegmentGGO;
  endSegment: SegmentGGO;
  rootVecor: VectorGGO;
  endVector: VectorGGO;
  middleSegment: SegmentGGO;

  LabelPoint: PointGGO;

  depth: number;

  private readonly shapeId: string;

  private isInverted: boolean = false;

  constructor(
    public name: string,
    public root: XYCoords,
    public end: XYCoords,
    public direction: SizeGGODirection,
    public label: string,
    public shapeSize: number,
    depthOverride?: number,
    public forceVectorsOutside: boolean = false,
    public settings?: GeogebraObjectSettings,
    public id: number = GeogebraObjectUtils.nextId(),
  ) {
    this.shapeId = `Size${StringUtils.keepLettersAndNumbersOnly(this.name)}${this.id}`;
    this.settings = GeogebraObjectUtils.settingsWithDefaults(settings);
    const withId = (elementName: string) => `${this.shapeId}${elementName}`;

    const shapeSizeMultiplier = 0.08;

    const depth = depthOverride === undefined ? shapeSize * shapeSizeMultiplier : depthOverride;
    this.depth = depth;

    let rootVectorPoint;
    let rootEndPoint;
    let endVectorPoint;
    let endEndPoint;

    const tail = depth < 50 ? depth / 10 : 0.15;

    switch (direction) {
      case "up":
        rootVectorPoint = XY(root.x, root.y + depth);
        rootEndPoint = XY(root.x, root.y + depth + tail);
        endVectorPoint = XY(end.x, end.y + depth);
        endEndPoint = XY(end.x, end.y + depth + tail);
        break;
      case "down":
        rootVectorPoint = XY(root.x, root.y - depth);
        rootEndPoint = XY(root.x, root.y - depth - tail);
        endVectorPoint = XY(end.x, end.y - depth);
        endEndPoint = XY(end.x, end.y - depth - tail);
        break;
      case "left":
        rootVectorPoint = XY(root.x - depth, root.y);
        rootEndPoint = XY(root.x - depth - tail, root.y);
        endVectorPoint = XY(end.x - depth, end.y);
        endEndPoint = XY(end.x - depth - tail, end.y);
        break;
      case "right":
        rootVectorPoint = XY(root.x + depth, root.y);
        rootEndPoint = XY(root.x + depth + tail, root.y);
        endVectorPoint = XY(end.x + depth, end.y);
        endEndPoint = XY(end.x + depth + tail, end.y);
        break;
      default:
        throw new Error(`Unknown SizeGGO direction ${direction}`)
    }

    const vectorCenter = XYCoords.fromJson(GeometryUtils.segmentCenter(rootVectorPoint, endVectorPoint));

    this.settings.isVisible = true;
    this.settings.lineThickness = 2;
    this.settings.styles.color = "#4b4b4b";

    const areVectorsOutside = forceVectorsOutside || GeometryUtils.segmentLength(rootVectorPoint, endVectorPoint) <= shapeSize * shapeSizeMultiplier * 2;

    const rootVectorPointOutside = XYCoords.fromJson(GeometryUtils.oppositePoint(rootVectorPoint, vectorCenter.toJson(), shapeSize * shapeSizeMultiplier));
    const endVectorPointOutside = XYCoords.fromJson(GeometryUtils.oppositePoint(endVectorPoint, vectorCenter.toJson(), shapeSize * shapeSizeMultiplier));

    this.rootSegment = new SegmentGGO(withId("rootSegment"), root.copy(), rootEndPoint, this.settings);
    this.endSegment = new SegmentGGO(withId("endSegment"), end.copy(), endEndPoint, this.settings);
    this.rootVecor = areVectorsOutside
      ? new VectorGGO(withId("rootVecor"), rootVectorPointOutside, rootVectorPoint.copy(),  this.settings)
      : new VectorGGO(withId("rootVecor"), vectorCenter.copy(), rootVectorPoint.copy(), this.settings);
    this.endVector = areVectorsOutside
      ? new VectorGGO(withId("endVector"), endVectorPointOutside, endVectorPoint.copy(), this.settings)
      : new VectorGGO(withId("endVector"), vectorCenter.copy(), endVectorPoint.copy(), this.settings);
    this.middleSegment = areVectorsOutside
      ? new SegmentGGO(withId("middleSegment"), rootVectorPoint.copy(), endVectorPoint.copy(), this.settings)
      : undefined;

    const vcpSettings: GeogebraObjectSettings = { caption: label, isLabelVisible: true, isVisible: true, pointSize: 0.001 };
    this.LabelPoint = areVectorsOutside
      ? new PointGGO(withId("labelPoint"), XYCoords.fromJson(GeometryUtils.segmentCenter(rootVectorPoint, rootVectorPointOutside)), vcpSettings)
      : new PointGGO(withId("labelPoint"), vectorCenter, vcpSettings);
  }

  rotate(angle: Angle, pointOuter?: XYCoordsJson): SizeGGO {
    const point: XYCoordsJson = pointOuter || this.getCenterCoords();
    this.root.rotate(angle, point);
    this.end.rotate(angle, point);
    this.rootSegment.rotate(angle, point);
    this.endSegment.rotate(angle, point);
    this.rootVecor.rotate(angle, point);
    this.endVector.rotate(angle, point);
    this.middleSegment && this.middleSegment.rotate(angle, point);
    this.LabelPoint.rotate(angle, point);
    return this;
  }

  invert(): SizeGGO {
    this.root.invert();
    this.end.invert();
    this.rootSegment.invert();
    this.endSegment.invert();
    this.rootVecor.invert();
    this.endVector.invert();
    this.middleSegment && this.middleSegment.invert();
    this.LabelPoint.invert();
    this.isInverted = !this.isInverted;
    return this
  }

  copy(): SizeGGO {
    return new SizeGGO(this.name, this.root.copy(), this.end.copy(), this.direction, this.label, this.shapeSize, this.depth, this.forceVectorsOutside, this.settings, this.id);
  }

  getCommands(): string[] {
    const middleSegmentCommands = this.middleSegment && this.middleSegment.getCommands() || [];
    return [
      ...this.rootSegment.getCommands(),
      ...this.endSegment.getCommands(),
      ...this.rootVecor.getCommands(),
      ...this.endVector.getCommands(),
      ...middleSegmentCommands,
      ...this.LabelPoint.getCommands()
    ];
  }

  toJson(): GeometryShapeJson {
    throw new Error("toJson() on SizeGGO is not supported.")
  }

  static fromJson(json: GeogebraObjectJson): SizeGGO {
    const j = json as SizeGGOJSON;
    return new SizeGGO(j.name, XYCoords.fromJson(j.root), XYCoords.fromJson(j.end), j.direction, j.label, j.depth, undefined, undefined, j.id)
  }

  maxCoord(): XYCoordsJson {
    const x = this.rootSegment.maxCoord();
    const y = this.endSegment.maxCoord();
    return {
      x: Math.max(x.x, y.x),
      y: Math.max(x.y, y.y)
    }
  }

  minCoord(): XYCoordsJson {
    const rootMC = this.rootSegment.minCoord();
    const endMC = this.endSegment.minCoord();
    return {
      x: Math.min(rootMC.x, endMC.x),
      y: Math.min(rootMC.y, endMC.y)
    }
  }

  getDeleteCommands(): string[] {
    const middleSegmentCommands = this.middleSegment && this.middleSegment.getDeleteCommands() || [];
    return [
      ...this.rootSegment.getDeleteCommands(),
      ...this.endSegment.getDeleteCommands(),
      ...this.rootVecor.getDeleteCommands(),
      ...this.endVector.getDeleteCommands(),
      ...middleSegmentCommands,
      ...this.LabelPoint.getDeleteCommands()
    ]
  }

  getCenterCoords(): XYCoordsJson {
    return GeometryUtils.segmentCenter(this.root, this.endSegment.end)
  }

  getDimensions(): { width: number; height: number } {
    return {
      width: this.depth,
      height: this.depth
    }
  }
}
