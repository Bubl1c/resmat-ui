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
import { GeometryShapeJson } from "./geometry-shape";

export interface CustomAxesProps {
  xAxisName?: string
  yAxisName?: string
}

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

  xAxisScale: TextGGO[] = [];
  yAxisScale: TextGGO[] = [];

  private readonly shapeId: string;

  private isInverted: boolean = false;

  constructor(
    public id: number,
    public name: string,
    public root: XYCoords,
    public xSize: number = 5,
    public ySize: number = 5,
    public props?: CustomAxesProps,
    public settings?: GeogebraObjectSettings,
    public rotationAngle?: number,
    public rotationPoint?: XYCoordsJson,
    public hasScale?: boolean
  ) {
    this.hasScale = hasScale === true;

    this.shapeId = `CustomAxes${StringUtils.keepLettersAndNumbersOnly(this.name)}${this.id}`;
    this.settings = GeogebraObjectUtils.settingsWithDefaults(settings);
    this.settings.lineThickness = settings && settings.lineThickness || 2;
    this.settings.styles.color =  settings && settings.styles && settings.styles && settings.styles.color || "blue";

    this.props = {
      xAxisName: props.xAxisName || "X",
      yAxisName: props.yAxisName || "Y"
    };

    const withId = (elementName: string) => `${this.shapeId}${elementName}`;
    this.xAxis = new VectorGGO(withId(this.props.xAxisName), XY(root.x - xSize, root.y), XY(root.x + xSize, root.y), this.settings);
    this.yAxis = new VectorGGO(withId(this.props.yAxisName), XY(root.x, root.y - ySize), XY(root.x, root.y + ySize), this.settings);
    this.rootPoint = new PointGGO(
      "C",
      this.root.copy(),
      Object.assign({}, this.settings, this.settings.rootPoint)
    );

    const labelPointSettings = (c: string): GeogebraObjectSettings => Object.assign(this.settings, { caption: c, isLabelVisible: true, isVisible: true, pointSize: 0.001 });
    this.xAxisLabelPoint = new PointGGO(this.props.xAxisName, XY(this.xAxis.endPoint.root.x, this.xAxis.endPoint.root.y + 0.3), labelPointSettings(this.props.xAxisName));
    this.yAxisLabelPoint = new PointGGO(this.props.yAxisName, XY(this.yAxis.endPoint.root.x, this.yAxis.endPoint.root.y), labelPointSettings(this.props.yAxisName));

    //todo implement scale
    // if (this.hasScale) {
    //   const xLength = xSize*2;
    //   const xAxisScaleStep = Math.ceil(xLength / 10);
    //   for (let i = 0; i < 10; i++) {
    //     const pointCoords = XY(Math.ceil(this.xAxis.root.x + i * xAxisScaleStep), this.xAxis.root.y);
    //     this.xAxisScale.push(new TextGGO(`${pointCoords.x}`, pointCoords))
    //   }
    // }

    this.rotationAngle = this.rotationAngle || 0;
    if (this.rotationAngle) {
      this.rotate(new Angle(this.rotationAngle), this.rotationPoint)
    }
  }

  rotate(angle: Angle, point?: XYCoordsJson): CustomAxesGGO {
    const p = point || this.root.copy();
    this.root.rotate(angle, p);
    this.rootPoint.rotate(angle, p);
    this.xAxis.rotate(angle, p);
    this.yAxis.rotate(angle, p);
    this.xAxisLabelPoint.rotate(angle, p);
    this.yAxisLabelPoint.rotate(angle, p);
    this.rotationAngle = angle.degrees;
    this.rotationPoint = p;
    return this;
  }

  invert(): CustomAxesGGO {
    this.root.invert();
    this.rootPoint.invert();
    this.xAxis.invert();
    this.yAxis.invert();
    this.xAxisLabelPoint.invert();
    this.yAxisLabelPoint.invert();
    this.isInverted = !this.isInverted;
    this.rotationAngle = GeogebraObjectUtils.invertRotationAngle(this.rotationAngle);
    return this;
  }

  copy(): CustomAxesGGO {
    return new CustomAxesGGO(this.id, this.name, this.root.copy(), this.xSize, this.ySize, this.props, this.settings, this.rotationAngle, this.rotationPoint);
  }

  getCommands(): string[] {
    return [
      ...this.rootPoint.getCommands(),
      ...this.xAxis.getCommands(),
      ...this.yAxis.getCommands(),
      ...this.xAxisLabelPoint.getCommands(),
      ...this.yAxisLabelPoint.getCommands(),
      ...this.xAxisScale.reduce((prev: string[], cur: TextGGO) => prev.concat(cur.getCommands()), [])
    ];
  }

  toJson(): GeometryShapeJson {
    return {
      id: this.id,
      name: this.name,
      shapeType: "CustomAxes",
      rotationAngle: this.rotationAngle,
      rotationPoint: this.rotationPoint,
      root: this.root.toJson(),
      dimensions: {
        xSize: this.xSize,
        ySize: this.ySize
      },
      sizeDirections: undefined,
      settings: this.settings,
      props: {
        xAxisName: this.props.xAxisName,
        yAxisName: this.props.yAxisName
      }
    }
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
