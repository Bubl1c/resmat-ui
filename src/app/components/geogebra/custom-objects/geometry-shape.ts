import { XYCoordsJson } from "../../../utils/geometryUtils";
import { GeogebraObjectSettings } from "./geogebra-object";

export type GeometryShapeType = "Kutyk" | "Shveller" | "Dvotavr" | "Kolo" | "Napivkolo" | "Trykutnyk90" | "TrykutnykRB" | "Plastyna" | "Ellipse" | "CustomAxes";

export interface GeometryShapeJson {
  id: number
  name: string
  shapeType: GeometryShapeType,
  rotationAngle: number, //0-360
  rotationPoint?: XYCoordsJson,
  root: XYCoordsJson,
  dimensions: {[key:string]:number},
  sizeDirections: {[key:string]:string},
  settings: GeogebraObjectSettings
  props: {[key:string]:any}
}

