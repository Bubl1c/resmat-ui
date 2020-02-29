import {
  GeogebraObject,
  GeogebraObjectJson,
  GeogebraObjectSettings,
  GGOKindType
} from "./geogebra-object";
import { Angle, CoordsUtils, XYCoords, XYCoordsJson } from "../../../utils/geometryUtils";
import { TextGGO } from "./text-ggo";
import { NumberUtils } from "../../../utils/NumberUtils";
import { VectorGGO } from "./vector-ggo";
import XY = CoordsUtils.XY;
import { GeogebraObjectUtils } from "./geogebra-object-utils";
import { PointGGO } from "./point-ggo";

export interface CustomAxesGGOJSON extends GeogebraObjectJson {
  xSize: number
  ySize: number
  axes: {
    x: {
      name: string
    },
    y: {
      name: string
    }
  }
}

export class CustomAxesGGO implements GeogebraObject {
  kind: GGOKindType = "custom_axes";

  xAxis: VectorGGO;
  yAxis: VectorGGO;
  rootPoint: PointGGO;

  private readonly shapeId: string;

  constructor(
    public id: number,
    public name: string,
    public root: XYCoords,
    public xSize: number = 5,
    public ySize: number = 5,
    public xAxisName: string = "X",
    public yAxisName: string = "Y",
    public settings?: GeogebraObjectSettings
  ) {
    this.shapeId = `${this.name}${this.id}`;
    this.settings = GeogebraObjectUtils.settingsWithDefaults(settings);
    const withId = (elementName: string) => `${this.shapeId}${elementName}`;
    this.xAxis = new VectorGGO(withId(xAxisName), XY(root.x - xSize, root.y), XY(root.x + xSize, root.y), settings);
    this.xAxis.setCustomLabel(new TextGGO(xAxisName, XY(this.xAxis.endPoint.root.x, this.xAxis.endPoint.root.y + 0.3)));
    this.yAxis = new VectorGGO(withId(yAxisName), XY(root.x, root.y - ySize), XY(root.x, root.y + ySize), settings);
    this.yAxis.setCustomLabel(new TextGGO(yAxisName, XY(this.yAxis.endPoint.root.x + 0.3, this.yAxis.endPoint.root.y)));
    this.rootPoint = new PointGGO("C", this.root.copy(), this.settings.rootPoint);
  }

  rotate(angle: Angle, point: XYCoords = this.root): CustomAxesGGO {
    this.rootPoint.rotate(angle, point);
    this.xAxis.rotate(angle, point);
    this.yAxis.rotate(angle, point);
    return this;
  }

  copy(): CustomAxesGGO {
    return new CustomAxesGGO(this.id, this.name, this.root.copy(), this.xSize, this.ySize, this.xAxisName, this.yAxisName);
  }

  getCommands(): string[] {
    return [
      ...this.rootPoint.getCommands(),
      ...this.xAxis.getCommands(),
      ...this.yAxis.getCommands()
    ];
  }

  toJson(): CustomAxesGGOJSON {
    return {
      id: this.id,
      kind: this.kind,
      root: this.root.toJson(),
      name: this.name,
      xSize: this.xSize,
      ySize: this.ySize,
      axes: {
        x: {
          name: this.xAxisName
        },
        y: {
          name: this.yAxisName
        }
      }
    }
  }

  static fromJson(json: GeogebraObjectJson): CustomAxesGGO {
    const j = json as CustomAxesGGOJSON;
    return new CustomAxesGGO(j.id, j.name, XYCoords.fromJson(j.root), j.xSize, j.ySize, j.axes.x.name, j.axes.y.name)
  }

  maxCoord(): XYCoordsJson {
    const x = this.xAxis.maxCoord();
    const y = this.yAxis.maxCoord();
    return {
      x: NumberUtils.maxAbs(x.x, y.x),
      y: NumberUtils.maxAbs(x.y, y.y)
    }
  }

  getDeleteCommands(): string[] {
    return [...this.rootPoint.getDeleteCommands(), ...this.xAxis.getDeleteCommands(), ...this.yAxis.getDeleteCommands()]
  }

  getCenterCoords(): XYCoordsJson {
    return this.root.toJson()
  }

  getSize(): { width: number; height: number } {
    return {
      width: this.xSize,
      height: this.ySize
    }
  }
}
