import { Angle, XYCoordsJson } from "../../../utils/geometryUtils";
import { TextGGO } from "./text-ggo";
import { PointGGO } from "./point-ggo";
import { VectorGGO } from "./vector-ggo";
import { SegmentGGO } from "./segment-ggo";
import { CustomAxesGGO } from "./custom-axes-ggo";
import { EllipseGGO } from "./ellipse-ggo";
import { KutykGGO } from "./polygon/kutyk.polygon-ggo";
import { PlateGGO } from "./polygon/plate.polygon-ggo";
import { ShvellerGGO } from "./polygon/shveller.polygon-ggo";
import { DvotavrGGO } from "./polygon/dvotavr.polygon-ggo";

export class GGOKind {
  static all: GGOKind[] = [];
  static ids: GGOKindType[] = [];

  static make(id: GGOKindType, name: string, requiredFieldDefs: Array<[string, string, number]> = []): GGOKind {
    const k = new GGOKind(id, name, requiredFieldDefs);
    GGOKind.all.push(k);
    GGOKind.ids.push(k.id);
    return k
  }

  static text = GGOKind.make("text", "Текст");
  static point = GGOKind.make("point", "Точка");
  static vector = GGOKind.make("vector", "Вектор");
  static segment = GGOKind.make("segment", "Відрізок");
  static custom_axes = GGOKind.make("custom_axes", "Осі координат");
  static ellipse = GGOKind.make("ellipse", "Еліпс");
  static kutyk = GGOKind.make("kutyk", "Рівнобічний кутик", [["b", "Ширина", 20], ["t", "Товщина", 3]]);
  static plate = GGOKind.make("plate", "Пластина", [["b", "Ширина", 20], ["h", "Висота", 5]]);
  static shveller = GGOKind.make("shveller", "Швеллер", [["n", "Номер в сортаменті", 5]]);
  static dvotavr = GGOKind.make("dvotavr", "Двотавр", [["n", "Номер в сортаменті", 10]]);

  static withId(id: string): GGOKind | undefined {
    return GGOKind.all.find(ut => ut.id === id)
  }

  constructor(public id: GGOKindType, public name: string, public requiredFieldDefs: Array<[string, string, number]>) {
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
  | "dvotavr";

export interface GeogebraObjectJson {
  kind: GGOKindType
  root: XYCoordsJson
  name: string
}

export interface GeogebraObject extends GeogebraObjectJson {
  rotate(angle: Angle, point: XYCoordsJson): GeogebraObject

  copy(): GeogebraObject

  getCommands(): string[]

  toJson(): GeogebraObjectJson

  maxCoord(): XYCoordsJson

  getDeleteCommands(): string[]
}

export namespace GeogebraObject {

  export function fromJson(json: GeogebraObjectJson): GeogebraObject {
    switch (json.kind) {
      case "text" :
        return TextGGO.fromJson(json);
      case "point" :
        return PointGGO.fromJson(json);
      case "vector" :
        return VectorGGO.fromJson(json);
      case "segment" :
        return SegmentGGO.fromJson(json);
      case "custom_axes" :
        return CustomAxesGGO.fromJson(json);
      case "ellipse" :
        return EllipseGGO.fromJson(json);
      case "kutyk" :
        return KutykGGO.fromJson(json);
      case "plate" :
        return PlateGGO.fromJson(json);
      case "shveller" :
        return ShvellerGGO.fromJson(json);
      case "dvotavr":
        return DvotavrGGO.fromJson(json);
      default:
        throw new Error(`Unknown GeogebraObject kind ${json.kind} in json ${json}`)
    }
  }
}
