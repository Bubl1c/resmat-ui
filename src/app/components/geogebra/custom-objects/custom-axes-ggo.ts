import { GeogebraObject, GeogebraObjectJson, GGOKindType } from "./geogebra-object";
import { Angle, CoordsUtils, XYCoords, XYCoordsJson } from "../../../utils/geometryUtils";
import { TextGGO } from "./text-ggo";
import { NumberUtils } from "../../../utils/NumberUtils";
import { VectorGGO } from "./vector-ggo";
import XY = CoordsUtils.XY;

export interface CustomAxesGGOJSON extends GeogebraObjectJson {
  size: number,
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

  constructor(
    public name: string,
    public root: XYCoords,
    public size: number = 5,
    public xAxisName: string = "X",
    public yAxisName: string = "Y"
  ) {
    const withName = (elementName: string) => `${this.name}${elementName}`;
    this.xAxis = new VectorGGO(withName(xAxisName), XY(root.x - size, root.y), XY(root.x + size, root.y));
    this.xAxis.setCustomLabel(new TextGGO(xAxisName, this.xAxis.endPoint.root));
    this.yAxis = new VectorGGO(withName(yAxisName), XY(root.x, root.y - size), XY(root.x, root.y + size));
    this.yAxis.setCustomLabel(new TextGGO(yAxisName, this.yAxis.endPoint.root));
  }

  rotate(angle: Angle, point: XYCoords = this.root): CustomAxesGGO {
    this.xAxis.rotate(angle, point);
    this.yAxis.rotate(angle, point);
    return this;
  }

  copy(): CustomAxesGGO {
    return new CustomAxesGGO(this.name, this.root.copy(), this.size, this.xAxisName, this.yAxisName);
  }

  getCommands(): string[] {
    return [
      ...this.xAxis.getCommands(),
      ...this.yAxis.getCommands()
    ];
  }

  toJson(): CustomAxesGGOJSON {
    return {
      kind: this.kind,
      root: this.root.toJson(),
      name: this.name,
      size: this.size,
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
    return new CustomAxesGGO(j.name, XYCoords.fromJson(j.root), j.size, j.axes.x.name, j.axes.y.name)
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
    return [...this.xAxis.getDeleteCommands(), ...this.yAxis.getDeleteCommands()]
  }
}
