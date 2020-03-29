import { Angle, XYCoords, XYCoordsJson } from "../../../utils/geometryUtils";
import { GeogebraObject, GeogebraObjectSettings } from "./geogebra-object";
import { GGB } from "../geogebra-definitions";
import { KutykGGO } from "./polygon/kutyk.polygon-ggo";
import { ShvellerGGO } from "./polygon/shveller.polygon-ggo";
import { DvotavrGGO } from "./polygon/dvotavr.polygon-ggo";
import { PlateGGO } from "./polygon/plate.polygon-ggo";
import { EllipseGGO } from "./ellipse-ggo";
import { CustomAxesGGO } from "./custom-axes-ggo";
import { GeogebraObjectUtils } from "./geogebra-object-utils";

export type GeometryShapeType = "Kutyk" | "Shveller" | "Dvotavr" | "Kolo" | "Napivkolo" | "Trykutnyk90" | "TrykutnykRB" | "Plastyna" | "Ellipse" | "CustomAxes";

export interface AnyKV {
  [key:string]: any
}

export interface StringKV {
  [key:string]: string
}

export interface NumberKV {
  [key:string]: number
}

export interface CustomAxesSettings {
  xAxisName: string
  yAxisName: string
  isInverted: number
}

export interface GeometryShapeInGroupSettingsJson {
  customAxesSettings?: CustomAxesSettings
}

export interface GeometryShapeJson {
  id: number
  name: string
  shapeType: GeometryShapeType,
  rotationAngle: number, //0-360
  rotationPoint?: XYCoordsJson,
  root: XYCoordsJson,
  dimensions: NumberKV,
  sizeDirections: StringKV,
  settings: GeogebraObjectSettings
  props: AnyKV
}

export class GeometryShapeUtils {
  static parseGeometryShape(json: GeometryShapeJson, isInverted: boolean = true): GeogebraObject {
    const settings: GeogebraObjectSettings = Object.assign(json.settings, {
      outerPoints: {
        isVisible: true,
        isLabelsVisible: true,
        labelMode: GGB.LabelMode.Value
      }
    } as GeogebraObjectSettings);
    const shapeType = json.shapeType;

    const mkObject = (): GeogebraObject => {
      switch (shapeType) {
        case "Kutyk":
          return new KutykGGO(json.id, json.name, XYCoords.fromJson(json.root), json.dimensions["b"], json.dimensions["t"], settings, json.sizeDirections, json.rotationAngle, json.rotationPoint);
        case "Shveller":
          return new ShvellerGGO(json.id, json.name, XYCoords.fromJson(json.root), json.dimensions["n"], settings, json.sizeDirections, json.rotationAngle, json.rotationPoint);
        case "Dvotavr":
          return new DvotavrGGO(json.id, json.name, XYCoords.fromJson(json.root), json.dimensions["n"], settings, json.sizeDirections, json.rotationAngle, json.rotationPoint);
        case "Kolo":
          throw new Error(`Failed to create GeogebraObject, type ${shapeType} is not yet supported. Json ${json}`);
        case "Napivkolo":
          throw new Error(`Failed to create GeogebraObject, type ${shapeType} is not yet supported. Json ${json}`);
        case "Trykutnyk90":
          throw new Error(`Failed to create GeogebraObject, type ${shapeType} is not yet supported. Json ${json}`);
        case "TrykutnykRB":
          throw new Error(`Failed to create GeogebraObject, type ${shapeType} is not yet supported. Json ${json}`);
        case "Plastyna":
          return new PlateGGO(json.id, json.name, XYCoords.fromJson(json.root), json.dimensions["b"], json.dimensions["h"], settings, json.sizeDirections, json.rotationAngle, json.rotationPoint);
        case "Ellipse":
          return new EllipseGGO(json.id, json.name, XYCoords.fromJson(json.root), json.dimensions["xR"], json.dimensions["yR"], settings, json.rotationAngle, json.rotationPoint);
        case "CustomAxes":
          return new CustomAxesGGO(json.id, json.name, XYCoords.fromJson(json.root), json.dimensions["xSize"], json.dimensions["ySize"], json.props["xAxisName"], json.props["yAxisName"], json.settings, json.rotationAngle, json.rotationPoint);
        default:
          throw new Error(`Failed to parse geometry shape json. unknown type ${shapeType}. Actual json: ${json}`)
      }
    };
    const object = mkObject();
    if (isInverted) {
      object.invert();
    }
    return object
  }
}

