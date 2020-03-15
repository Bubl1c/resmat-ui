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
import { StringUtils } from "../../../utils/StringUtils";

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

  xAxisLabelPoint: PointGGO;
  yAxisLabelPoint: PointGGO;

  private readonly shapeId: string;

  constructor(
    public id: number,
    public name: string,
    public root: XYCoords,
    public xSize: number = 5,
    public ySize: number = 5,
    public xAxisName?: string,
    public yAxisName?: string,
    public settings?: GeogebraObjectSettings
  ) {
    this.shapeId = `CustomAxes${StringUtils.keepLettersAndNumbersOnly(this.name)}${this.id}`;
    this.settings = GeogebraObjectUtils.settingsWithDefaults(settings);
    this.settings.lineThickness = settings && settings.lineThickness || 2;

    this.xAxisName = xAxisName || "X";
    this.yAxisName = yAxisName || "Y";

    const withId = (elementName: string) => `${this.shapeId}${elementName}`;
    this.xAxis = new VectorGGO(withId(xAxisName), XY(root.x - xSize, root.y), XY(root.x + xSize, root.y), this.settings);
    this.yAxis = new VectorGGO(withId(yAxisName), XY(root.x, root.y - ySize), XY(root.x, root.y + ySize), this.settings);
    this.rootPoint = new PointGGO("C", this.root.copy(), this.settings.rootPoint);

    const labelPointSettings = (c: string): GeogebraObjectSettings => ({ caption: c, isLabelVisible: true, isVisible: true, pointSize: 0.001 });
    this.xAxisLabelPoint = new PointGGO(xAxisName, XY(this.xAxis.endPoint.root.x, this.xAxis.endPoint.root.y), labelPointSettings(xAxisName));
    this.yAxisLabelPoint = new PointGGO(yAxisName, XY(this.yAxis.endPoint.root.x, this.yAxis.endPoint.root.y), labelPointSettings(yAxisName));
  }

  rotate(angle: Angle, point?: XYCoords): CustomAxesGGO {
    const p = point || this.root;
    this.rootPoint.rotate(angle, p);
    this.xAxis.rotate(angle, p);
    this.yAxis.rotate(angle, p);
    this.xAxisLabelPoint.rotate(angle, p);
    this.yAxisLabelPoint.rotate(angle, p);
    return this;
  }

  copy(): CustomAxesGGO {
    return new CustomAxesGGO(this.id, this.name, this.root.copy(), this.xSize, this.ySize, this.xAxisName, this.yAxisName);
  }

  getCommands(): string[] {
    return [
      ...this.rootPoint.getCommands(),
      ...this.xAxis.getCommands(),
      ...this.yAxis.getCommands(),
      ...this.xAxisLabelPoint.getCommands(),
      ...this.yAxisLabelPoint.getCommands()
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
      x: Math.max(x.x, y.x),
      y: Math.max(x.y, y.y)
    }
  }

  minCoord(): XYCoordsJson {
    const rootMC = this.xAxis.minCoord();
    const endMC = this.yAxis.minCoord();
    return {
      x: Math.min(rootMC.x, endMC.x),
      y: Math.min(rootMC.y, endMC.y)
    }
  }

  getDeleteCommands(): string[] {
    return [
      ...this.rootPoint.getDeleteCommands(),
      ...this.xAxis.getDeleteCommands(),
      ...this.yAxis.getDeleteCommands(),
      ...this.xAxisLabelPoint.getDeleteCommands(),
      ...this.yAxisLabelPoint.getDeleteCommands()
    ]
  }

  getCenterCoords(): XYCoordsJson {
    return this.root.toJson()
  }

  getDimensions(): { width: number; height: number } {
    return {
      width: this.xSize,
      height: this.ySize
    }
  }
}
