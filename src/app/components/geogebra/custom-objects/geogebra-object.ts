import { Angle, XYCoordsJson } from "../../../utils/geometryUtils";
import { GGB } from "../geogebra-definitions";
import { GeometryShapeJson, GeometryShapeType } from "./geometry-shape";

export class GGOKind {
  static all: GGOKind[] = [];
  static ids: GGOKindType[] = [];

  static make(id: GGOKindType, name: string, requiredFieldDefs: Array<[string, string, number]> = [], shapeType?: GeometryShapeType): GGOKind {
    const k = new GGOKind(id, name, requiredFieldDefs, shapeType);
    GGOKind.all.push(k);
    GGOKind.ids.push(k.id);
    return k
  }

  static text = GGOKind.make("text", "Текст");
  static point = GGOKind.make("point", "Точка");
  static vector = GGOKind.make("vector", "Вектор");
  static segment = GGOKind.make("segment", "Відрізок");
  static custom_axes = GGOKind.make("custom_axes", "Осі координат");
  static ellipse = GGOKind.make("ellipse", "Еліпс", [["xR", "Радіус по осі X", 10], ["yR", "Радіус по осі Y", 5]], "Ellipse");
  static kutyk = GGOKind.make("kutyk", "Рівнобічний кутик", [["b", "Ширина", 10], ["t", "Товщина", 0.7]], "Kutyk");
  static plate = GGOKind.make("plate", "Пластина", [["b", "Ширина", 10], ["h", "Висота", 5]], "Plastyna");
  static shveller = GGOKind.make("shveller", "Швеллер", [["n", "Номер в сортаменті", 10]], "Shveller");
  static dvotavr = GGOKind.make("dvotavr", "Двотавр", [["n", "Номер в сортаменті", 10]], "Dvotavr");
  static size = GGOKind.make("size", "Розмір");

  static withId(id: string): GGOKind | undefined {
    return GGOKind.all.find(ut => ut.id === id)
  }

  constructor(public id: GGOKindType, public name: string, public requiredFieldDefs: Array<[string, string, number]>, public shapeType?: GeometryShapeType) {
  }
}

export type GGOKindType =
  "text"
  | "point"
  | "vector"
  | "segment"
  | "custom_axes"
  | "ellipse"
  | "kutyk"
  | "plate"
  | "shveller"
  | "dvotavr"
  | "size";

export interface GeogebraObjectSettings {
  isVisible?: boolean
  isLabelVisible?: boolean
  labelMode?: GGB.LabelMode
  caption?: string
  isFixed?: boolean
  styles?: {
    opacityPercents?: number
    color?: string //hex like #AARRGGBB or canonical color name, see more at https://wiki.geogebra.org/en/SetColor_Command
  }
  lineThickness?: number //https://wiki.geogebra.org/en/SetLineThickness_Command
  pointSize?: number
  rootPoint?: GeogebraObjectSettings
  outerPoints?: {
    isVisible?: boolean
    isLabelsVisible?: boolean
    labelMode?: GGB.LabelMode
  }
  showSizes?: boolean
  shapeSizeToCalculateSizeDepth?: number // used to calculate depth of the SizeGGO
}

export interface GeogebraObjectJson {
  id: number
  kind: GGOKindType
  root: XYCoordsJson
  name: string
  rotationAngle?: number
  rotationPoint?: XYCoordsJson
}

export interface GeogebraObject extends GeogebraObjectJson {
  rotate(angle: Angle, point: XYCoordsJson): GeogebraObject

  copy(): GeogebraObject

  getCommands(): string[]

  toJson(): GeometryShapeJson

  maxCoord(): XYCoordsJson

  minCoord(): XYCoordsJson

  getDeleteCommands(): string[]

  getCenterCoords(): XYCoordsJson

  getDimensions(): { width: number, height: number }

  invert(): GeogebraObject
}
