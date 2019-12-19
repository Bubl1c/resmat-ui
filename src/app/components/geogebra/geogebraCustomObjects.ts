import { Angle, CoordsUtils, GeometryUtils, XYCoords, XYCoordsJson } from "../../utils/GeometryUtils";
import { Sortament } from "../../utils/sortament";
import { GGB } from "./geogebraDefinitions";
import { NumberUtils } from "../../utils/NumberUtils";
import XY = CoordsUtils.XY;

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

  constructor(public id: GGOKindType, public name: string, public requiredFieldDefs: Array<[string, string, number]>) {}
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

export interface TextGGOJSON extends GeogebraObjectJson {
  substituteVariables: boolean
  laTeXFormula: boolean
}

/**
 * https://wiki.geogebra.org/en/Text_Command
 */
export class TextGGO implements GeogebraObject {
  kind: GGOKindType = "text";

  constructor(public name: string, public root: XYCoords, public substituteVariables: boolean = false, public laTeXFormula: boolean = false) {
  }

  rotate(angle: Angle, point: XYCoords = new XYCoords(0, 0)): TextGGO {
    this.root.rotate(angle, point);
    return this;
  }

  copy(): TextGGO {
    return new TextGGO(this.name, this.root.copy(), this.substituteVariables, this.laTeXFormula);
  }

  getCommands(): string[] {
    return [
      `Text("${this.name}", (${this.root.x}, ${this.root.y}), ${this.substituteVariables}, ${this.laTeXFormula})`
    ]
  }

  toJson(): TextGGOJSON {
    return this.copy()
  }

  static fromJson(json: GeogebraObjectJson): TextGGO {
    const j = json as TextGGOJSON;
    return new TextGGO(j.name, XYCoords.fromJson(j.root), j.substituteVariables, j.laTeXFormula)
  }

  maxCoord(): XYCoordsJson {
    return this.root.copy()
  }

  getDeleteCommands(): string[] {
    return [`Delete(${this.name})`]
  }
}

export interface PointSettingsJson {
  isVisible?: boolean
  isLabelVisible?: boolean
  labelMode?: GGB.LabelMode
  pointSize?: number
  isFixed?: boolean
}
export interface PointGGOJSON extends GeogebraObjectJson {
  settings?: PointSettingsJson
}

export class PointGGO implements PointGGOJSON {
  kind: GGOKindType = "point";
  settings: PointSettingsJson;

  constructor(public name: string,
              public root: XYCoords,
              settings?: PointSettingsJson) {
    this.settings = {
      isVisible: settings && settings.isVisible || false,
      isLabelVisible: settings && settings.isLabelVisible || false,
      labelMode: settings && settings.labelMode || GGB.LabelMode.Name,
      pointSize: settings && settings.pointSize || 2,
      isFixed: settings && settings.isFixed || true
    }
  }

  rotate(angle: Angle, point: XYCoords = new XYCoords(0, 0)): PointGGO {
    this.root.rotate(angle, point);
    return this
  }

  copy(): PointGGO {
    return new PointGGO(this.name, this.root.copy(), this.settings);
  }

  getCommands(): string[] {
    const pointCmd = `${this.name}=${this.root.getCommand()}`;
    return [
      pointCmd,
      ...(this.settings.labelMode !== GGB.LabelMode.Name ? [`SetLabelMode(${this.name},${this.settings.labelMode})`] : []),
      ...(!this.settings.isVisible ? [`SetVisibleInView(${this.name},1,false)`] : []),
      ...(this.settings.isVisible ? [`SetPointSize(${this.name},${this.settings.pointSize})`] : []),
      ...(this.settings.isVisible ? [`ShowLabel(${this.name},${this.settings.isLabelVisible})`] : []),
      ...(this.settings.isFixed ? [`SetFixed(${this.name},true)`] : [])
    ]
  }

  toJson(): PointGGOJSON {
    return this.copy()
  }

  static fromJson(json: GeogebraObjectJson): PointGGO {
    const j = json as PointGGOJSON;
    return new PointGGO(j.name, XYCoords.fromJson(j.root), j.settings)
  }

  maxCoord(): XYCoordsJson {
    return this.root.copy()
  }

  getDeleteCommands(): string[] {
    return [`Delete(${this.name})`]
  }
}

export interface VectorGGOJSON extends GeogebraObjectJson {
  end: XYCoordsJson
  isLabelVisible: boolean
}

export class VectorGGO implements GeogebraObject {
  kind: GGOKindType = "vector";

  rootPoint: PointGGO;
  endPoint: PointGGO;
  customLabel?: TextGGO;

  constructor(public name: string, public root: XYCoords, public end: XYCoords, public isLabelVisible: boolean = false) {
    const withName = (elementName: string) => `${this.name}${elementName}`;
    this.rootPoint = new PointGGO(withName("Root"), this.root.copy());
    this.endPoint = new PointGGO(withName("End"), this.end.copy());
  }

  rotate(angle: Angle, point: XYCoords = this.root): VectorGGO {
    this.rootPoint.rotate(angle, point);
    this.endPoint.rotate(angle, point);
    this.customLabel && this.customLabel.rotate(angle, point);
    return this;
  }

  copy(): VectorGGO {
    return new VectorGGO(this.name, this.root.copy(), this.end.copy(), this.isLabelVisible);
  }

  setCustomLabel(label: TextGGO): VectorGGO {
    this.customLabel = label.copy();
    return this;
  }

  getCommands(): string[] {
    return [
      ...this.rootPoint.getCommands(),
      ...this.endPoint.getCommands(),
      `${this.name}=Vector(${this.rootPoint.name},${this.endPoint.name})`,
      `ShowLabel(${this.name},${this.isLabelVisible})`,
      ...(this.customLabel ? this.customLabel.getCommands() : [])
    ]
  }

  toJson(): VectorGGOJSON {
    return {
      kind: this.kind,
      root: this.root.toJson(),
      end: this.end.toJson(),
      name: this.name,
      isLabelVisible: this.isLabelVisible
    }
  }

  static fromJson(json: GeogebraObjectJson): VectorGGO {
    const j = json as VectorGGOJSON;
    return new VectorGGO(j.name, XYCoords.fromJson(j.root), XYCoords.fromJson(j.end), j.isLabelVisible)
  }

  maxCoord(): XYCoordsJson {
    const rootMC = this.rootPoint.maxCoord();
    const endMC = this.endPoint.maxCoord();
    return {
      x: NumberUtils.maxAbs(rootMC.x, endMC.x),
      y: NumberUtils.maxAbs(rootMC.y, endMC.y)
    }
  }

  getDeleteCommands(): string[] {
    return [...this.rootPoint.getDeleteCommands(), ...this.endPoint.getDeleteCommands()]
  }
}

export interface SegmentSettingsJson {
  root?: PointSettingsJson
  end?: PointSettingsJson
  isLabelVisible?: boolean
  isFixed?: boolean
}
export interface SegmentGGOJSON extends GeogebraObjectJson {
  end: XYCoordsJson
  settings?: SegmentSettingsJson
}

export class SegmentGGO implements SegmentGGOJSON {
  kind: GGOKindType = "segment";
  settings: SegmentSettingsJson;

  rootPoint: PointGGO;
  endPoint: PointGGO;
  parentName?: string;

  constructor(public name: string, public root: XYCoords, public end: XYCoords, settings?: SegmentSettingsJson) {
    this.settings = {
      root: settings && settings.root || undefined,
      end: settings && settings.end || undefined,
      isLabelVisible: settings && settings.isLabelVisible || false,
      isFixed: settings && settings.isFixed || true
    };
    const withName = (elementName: string) => `${this.name}${elementName}`;
    this.rootPoint = new PointGGO(withName("Root"), this.root.copy(), this.settings.root);
    this.endPoint = new PointGGO(withName("End"), this.end.copy(), this.settings.end);
  }

  rotate(angle: Angle, point: XYCoords = this.root): SegmentGGO {
    this.root = this.root.rotate(angle, point);
    this.end = this.end.rotate(angle, point);
    this.rootPoint = this.rootPoint.rotate(angle, point);
    this.endPoint = this.endPoint.rotate(angle, point);
    return this;
  }

  copy(): SegmentGGO {
    return new SegmentGGO(this.name, this.root.copy(), this.end.copy(), this.settings);
  }

  getCommands(): string[] {
    const parentNameParameter = this.parentName ? `,${this.parentName}` : "";
    return [
      ...this.rootPoint.getCommands(),
      ...this.endPoint.getCommands(),
      `${this.name}=Segment(${this.rootPoint.name},${this.endPoint.name}${parentNameParameter})`,
      `ShowLabel(${this.name},${this.settings.isLabelVisible})`,
      `SetFixed(${this.name},${this.settings.isFixed})`
    ]
  }

  toJson(): SegmentGGOJSON {
    return {
      kind: this.kind,
      root: this.root.toJson(),
      end: this.end.toJson(),
      name: this.name,
      settings: this.settings
    }
  }

  static fromJson(json: GeogebraObjectJson): SegmentGGO {
    const j = json as SegmentGGOJSON;
    return new SegmentGGO(j.name, XYCoords.fromJson(j.root), XYCoords.fromJson(j.end), j.settings)
  }

  maxCoord(): XYCoordsJson {
    const rootMC = this.rootPoint.maxCoord();
    const endMC = this.endPoint.maxCoord();
    return {
      x: NumberUtils.maxAbs(rootMC.x, endMC.x),
      y: NumberUtils.maxAbs(rootMC.y, endMC.y)
    }
  }

  getDeleteCommands(): string[] {
    return [...this.rootPoint.getDeleteCommands(), ...this.endPoint.getDeleteCommands()]
  }
}

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

export interface EllipseGGOJSON extends GeogebraObjectJson {
  f1: XYCoordsJson,
  f2: XYCoordsJson,
  ellipsePoint: XYCoordsJson
}

export class EllipseGGO implements GeogebraObject {
  kind: GGOKindType = "ellipse";

  f1Point: PointGGO;
  f2Point: PointGGO;
  ellipsePoint: PointGGO;

  constructor(
    public name: string,
    public root: XYCoords,
    f1Rel: XYCoords,
    ellipsePointRel: XYCoords
  ) {
    const withName = (elementName: string) => `${name}${elementName}`;
    const f1 = XY(root.x + f1Rel.x, root.y + f1Rel.y);
    const ellipsePoint = XY(root.x + ellipsePointRel.x, root.y + ellipsePointRel.y);
    const f2 = XYCoords.fromJson(GeometryUtils.opositePoint(root.x, root.y, f1.x, f1.y));
    this.f1Point = new PointGGO(withName("F1Point"), f1.copy(), false);
    this.f2Point = new PointGGO(withName("F2Point"), f2.copy(), false);
    this.ellipsePoint = new PointGGO(withName("EllipsePoint"), ellipsePoint.copy(), true);
  }

  rotate(angle: Angle, point: XYCoords = this.root): EllipseGGO {
    this.root.rotate(angle, point);
    this.f1Point.rotate(angle, point);
    this.f2Point.rotate(angle, point);
    this.ellipsePoint.rotate(angle, point);
    return this
  }

  copy(): EllipseGGO {
    return new EllipseGGO(this.name, this.f1Point.root.copy(), this.f2Point.root.copy(), this.ellipsePoint.root.copy());
  }

  getCommands(): string[] {
    return [
      ...this.f1Point.getCommands(),
      ...this.f2Point.getCommands(),
      ...this.ellipsePoint.getCommands(),
      `${this.name}: Ellipse(${this.f1Point.name},${this.f2Point.name},${this.ellipsePoint.name})`,
      `ShowLabel(${this.name},false)`
    ]
  }

  toJson(): EllipseGGOJSON {
    return {
      kind: this.kind,
      root: this.root.toJson(),
      name: this.name,
      f1: this.f1Point.root.toJson(),
      f2: this.f2Point.root.toJson(),
      ellipsePoint: this.ellipsePoint.root.toJson()
    }
  }

  static fromJson(json: GeogebraObjectJson): CustomAxesGGO {
    const j = json as CustomAxesGGOJSON;
    return new CustomAxesGGO(j.name, XYCoords.fromJson(j.root), j.size, j.axes.x.name, j.axes.y.name)
  }

  maxCoord(): XYCoordsJson {
    return {
      x: NumberUtils.maxAbs(this.f1Point.root.x, this.f2Point.root.x, this.ellipsePoint.root.x),
      y: NumberUtils.maxAbs(this.f1Point.root.y, this.f2Point.root.y, this.ellipsePoint.root.y)
    }
  }

  getDeleteCommands(): string[] {
    return [...this.f1Point.getDeleteCommands(), ...this.f2Point.getDeleteCommands(), ...this.ellipsePoint.getDeleteCommands()]
  }
}


export interface KutykSettingsJson {
  isLabelVisible?: boolean
  caption?: string
  labelMode?: GGB.LabelMode
  isFixed?: boolean
}
export interface KutykGGOJSON extends GeogebraObjectJson {
  b: number
  t: number
  settings?: KutykSettingsJson
}

/**
 *  B t B1
 *   _
 *  | |
 *  | |
 * b| |   .C
 *  | |C1_________ A1
 *  |_____________| t
 *  Root   b       A
 */
export class KutykGGO implements GeogebraObject {
  kind: GGOKindType = "kutyk";
  settings: KutykSettingsJson;

  private segments: SegmentGGO[];

  Root_B: SegmentGGO;
  B_B1: SegmentGGO;
  B1_C1: SegmentGGO;
  C1_A1: SegmentGGO;
  A1_A: SegmentGGO;
  A_Root: SegmentGGO;

  constructor(
    public name: string,
    public root: XYCoords,
    public b: number,
    public t: number,
    settings?: KutykSettingsJson
  ) {
    this.settings = {
      caption: settings && settings.caption || this.name,
      isLabelVisible: settings && settings.isLabelVisible || false,
      labelMode: settings && settings.labelMode || GGB.LabelMode.Name,
      isFixed: settings && settings.isFixed || true
    };
    const withName = (elementName: string) => `${name}${elementName}`;

    const sortamentNumber = b / 10;
    const sortament = Sortament.Kutyk["" + sortamentNumber + "_" + t];
    if (!sortament) {
      throw new Error(`Kutyk with b = ${b} and t = ${t} has not been found in sortament!`)
    }
    const B = XY(root.x, root.y + b);
    const B1 = XY(B.x + t, B.y);
    const C1 = XY(root.x + t, root.y + t);
    const A = XY(root.x + b, root.y);
    const A1 = XY(A.x, A.y + t);

    const ss: SegmentSettingsJson = {
      root: {
        isVisible: true,
        isFixed: true,
        isLabelVisible: true,
        labelMode: GGB.LabelMode.Value
      }
    };

    this.Root_B = new SegmentGGO(withName("RootB"), root, B, ss);
    this.B_B1 = new SegmentGGO(withName("BB1"), B, B1, ss);
    this.B1_C1 = new SegmentGGO(withName("B1C1"), B1, C1, ss);
    this.C1_A1 = new SegmentGGO(withName("C1A1"), C1, A1, ss);
    this.A1_A = new SegmentGGO(withName("A1A"), A1, A, ss);
    this.A_Root = new SegmentGGO(withName("ARoot"), A, root, ss);

    this.segments = [this.Root_B, this.B_B1, this.B1_C1, this.C1_A1, this.A1_A, this.A_Root]
  }

  rotate(angle: Angle, point: XYCoords = this.root.copy()): KutykGGO {
    this.segments.forEach(s => {
      s.rotate(angle, point)
    });
    return this
  }

  copy(): KutykGGO {
    return new KutykGGO(this.name, this.root.copy(), this.b, this.t)
  }

  getCommands(): string[] {
    const polygonVertices = this.segments.map(s => [s.rootPoint.name, s.endPoint.name]).reduce((prev, cur) => prev.concat(cur));
    return [
      ...this.segments.map(s => s.getCommands()).reduce((prev, cur) => prev.concat(cur)),
      `${this.name}=Polygon(${Array.from(polygonVertices).join(",")})`,
      `SetLineThickness(${this.name},0)`,
      `ShowLabel(${this.name},${this.settings.isLabelVisible})`,
      `SetCaption(${this.name},"${this.settings.caption}")`,
      `SetLabelMode(${this.name},${this.settings.labelMode})`,
      `SetFixed(${this.name},${this.settings.isFixed})`
    ]
  }

  toJson(): KutykGGOJSON {
    return {
      kind: this.kind,
      root: this.root.toJson(),
      name: this.name,
      b: this.b,
      t: this.t
    }
  }

  static fromJson(json: GeogebraObjectJson): KutykGGO {
    const j = json as KutykGGOJSON;
    return new KutykGGO(j.name, XYCoords.fromJson(j.root), j.b, j.t)
  }

  maxCoord(): XYCoordsJson {
    const segmentMaxCoords = this.segments.map(s => s.maxCoord());
    return {
      x: NumberUtils.maxAbs(...segmentMaxCoords.map(smc => smc.x)),
      y: NumberUtils.maxAbs(...segmentMaxCoords.map(smc => smc.y))
    }
  }

  getDeleteCommands(): string[] {
    return this.segments.map(s => s.getDeleteCommands()).reduce((prev, cur) => prev.concat(cur))
  }
}

export interface PlateGGOJSON extends GeogebraObjectJson {
  b: number
  h: number
  isLabelVisible: Boolean
}

/**
 * B            C1
 *  -----------
 *  |          |
 *  |    .C    | h
 *  |          |
 *  |_________ |
 * Root  b      D
 */
export class PlateGGO implements GeogebraObject {
  kind: GGOKindType = "plate";

  private segments: SegmentGGO[];

  Root_B: SegmentGGO;
  B_C1: SegmentGGO;
  C1_D: SegmentGGO;
  D_Root: SegmentGGO;

  constructor(
    public name: string,
    public root: XYCoords,
    public b: number,
    public h: number,
    public isLabelVisible: Boolean = false,
    public caption?: string,
    public labelMode: GGB.LabelMode = GGB.LabelMode.Caption
  ) {
    this.caption = this.caption || this.name;

    const withName = (elementName: string) => `${name}${elementName}`;

    const Root = this.root.copy();
    const B = XY(Root.x, Root.y + h);
    const C1 = XY(Root.x + b, Root.y + h);
    const D = XY(Root.x + b, Root.y);

    this.Root_B = new SegmentGGO(withName("RootB"), Root, B);
    this.B_C1 = new SegmentGGO(withName("BC1"), B, C1);
    this.C1_D = new SegmentGGO(withName("C1D"), C1, D);
    this.D_Root = new SegmentGGO(withName("DRoot"), D, Root);

    this.segments = [this.Root_B, this.B_C1, this.C1_D, this.D_Root]
  }

  rotate(angle: Angle, point: XYCoords = this.root.copy()): PlateGGO {
    this.root.rotate(angle, point);
    this.segments.forEach(s => {
      s.rotate(angle, point)
    });
    return this
  }

  copy(): PlateGGO {
    return new PlateGGO(this.name, this.root.copy(), this.b, this.h, this.isLabelVisible)
  }

  getCommands(): string[] {
    const polygonVertices = this.segments.map(s => [s.rootPoint.name, s.endPoint.name]).reduce((prev, cur) => prev.concat(cur));
    return [
      ...this.segments.map(s => s.getCommands()).reduce((prev, cur) => prev.concat(cur)),
      `${this.name}=Polygon(${Array.from(polygonVertices).join(",")})`,
      `SetLineThickness(${this.name},0)`,
      `ShowLabel(${this.name},${this.isLabelVisible})`,
      `SetCaption(${this.name},"${this.caption}")`,
      `SetLabelMode(${this.name},${this.labelMode})`
    ]
  }

  toJson(): PlateGGOJSON {
    return {
      kind: this.kind,
      root: this.root.toJson(),
      name: this.name,
      b: this.b,
      h: this.h,
      isLabelVisible: this.isLabelVisible
    }
  }

  static fromJson(json: GeogebraObjectJson): PlateGGO {
    const j = json as PlateGGOJSON;
    return new PlateGGO(j.name, XYCoords.fromJson(j.root), j.b, j.h, j.isLabelVisible)
  }

  maxCoord(): XYCoordsJson {
    const segmentMaxCoords = this.segments.map(s => s.maxCoord());
    return {
      x: NumberUtils.maxAbs(...segmentMaxCoords.map(smc => smc.x)),
      y: NumberUtils.maxAbs(...segmentMaxCoords.map(smc => smc.y))
    }
  }

  getDeleteCommands(): string[] {
    return this.segments.map(s => s.getDeleteCommands()).reduce((prev, cur) => prev.concat(cur))
  }
}

export interface ShvellerGGOJSON extends GeogebraObjectJson {
  n: number
}

/**
 *
 * B1_______ B2
 *  | _______| t
 *  | |C1   D1
 * h|d| .C
 *  | |C2___D2
 *  |________| t
 * Root  b   B3
 */
export class ShvellerGGO implements GeogebraObject {
  kind: GGOKindType = "shveller";

  private segments: SegmentGGO[];

  Root_B1: SegmentGGO;
  B1_B2: SegmentGGO;
  B2_D1: SegmentGGO;
  D1_C1: SegmentGGO;
  C1_C2: SegmentGGO;
  C2_D2: SegmentGGO;
  D2_B3: SegmentGGO;
  B3_Root: SegmentGGO;

  constructor(
    public name: string,
    public root: XYCoords,
    public n: number,
    public isLabelVisible: boolean = false,
    public caption?: string,
    public labelMode: GGB.LabelMode = GGB.LabelMode.Caption
  ) {
    this.caption = this.caption || this.name;

    const withName = (elementName: string) => `${name}${elementName}`;

    const sortament = Sortament.Shveller[n + ""];
    if (!sortament) {
      throw new Error(`Shveller with number = ${n} has not been found in sortament!`)
    }
    const h = sortament.h;
    const b = sortament.b;
    const d = sortament.d;
    const t = sortament.t;

    const B1 = XY(root.x, root.y + h);
    const B2 = XY(B1.x + b, B1.y);
    const D1 = XY(B2.x, B2.y - t);
    const C1 = XY(D1.x - b + d, D1.y);
    const C2 = XY(C1.x, C1.y - h + t * 2);
    const B3 = XY(root.x + b, root.y);
    const D2 = XY(B3.x, B3.y + t);

    this.Root_B1 = new SegmentGGO(withName("RootB1"), root, B1);
    this.B1_B2 = new SegmentGGO(withName("B1B2"), B1, B2);
    this.B2_D1 = new SegmentGGO(withName("B2D1"), B2, D1);
    this.D1_C1 = new SegmentGGO(withName("D1C1"), D1, C1);
    this.C1_C2 = new SegmentGGO(withName("C1C2"), C1, C2);
    this.C2_D2 = new SegmentGGO(withName("C2D2"), C2, D2);
    this.D2_B3 = new SegmentGGO(withName("D2B3"), D2, B3);
    this.B3_Root = new SegmentGGO(withName("B3Root"), B3, root);

    this.segments = [this.Root_B1, this.B1_B2, this.B2_D1, this.D1_C1, this.C1_C2, this.C2_D2, this.D2_B3, this.B3_Root]
  }

  rotate(angle: Angle, point: XYCoords = this.root.copy()): ShvellerGGO {
    this.root.rotate(angle, point);
    this.segments.forEach(s => {
      s.rotate(angle, point)
    });
    return this
  }

  copy(): ShvellerGGO {
    return new ShvellerGGO(this.name, this.root.copy(), this.n)
  }

  getCommands(): string[] {
    const polygonVertices = this.segments.map(s => [s.rootPoint.name, s.endPoint.name]).reduce((prev, cur) => prev.concat(cur));
    return [
      ...this.segments.map(s => s.getCommands()).reduce((prev, cur) => prev.concat(cur)),
      `${this.name}=Polygon(${Array.from(polygonVertices).join(",")})`,
      `SetLineThickness(${this.name},0)`,
      `ShowLabel(${this.name},${this.isLabelVisible})`,
      `SetCaption(${this.name},"${this.caption}")`,
      `SetLabelMode(${this.name},${this.labelMode})`
    ]
  }

  toJson(): ShvellerGGOJSON {
    return {
      kind: this.kind,
      root: this.root.toJson(),
      name: this.name,
      n: this.n
    }
  }

  static fromJson(json: GeogebraObjectJson): ShvellerGGO {
    const j = json as ShvellerGGOJSON;
    return new ShvellerGGO(j.name, XYCoords.fromJson(j.root), j.n)
  }

  maxCoord(): XYCoordsJson {
    const segmentMaxCoords = this.segments.map(s => s.maxCoord());
    return {
      x: NumberUtils.maxAbs(...segmentMaxCoords.map(smc => smc.x)),
      y: NumberUtils.maxAbs(...segmentMaxCoords.map(smc => smc.y))
    }
  }

  getDeleteCommands(): string[] {
    return this.segments.map(s => s.getDeleteCommands()).reduce((prev, cur) => prev.concat(cur))
  }
}

export interface DvotavrGGOJSON extends GeogebraObjectJson {
  n: number
}

/**
 *
 *  B2___________B3
 *  t|____   ____|  |
 *  B1  C2|s|C3  B4 |
 *        |.|C      | h
 *  A2__C1| |C4__A3 |
 *  t|___________|  |
 * Root    b     A4
 */
export class DvotavrGGO implements GeogebraObject {
  kind: GGOKindType = "dvotavr";

  private segments: SegmentGGO[];

  Root_A2: SegmentGGO;
  A2_C1: SegmentGGO;
  C1_C2: SegmentGGO;
  C2_B1: SegmentGGO;
  B1_B2: SegmentGGO;
  B2_B3: SegmentGGO;
  B3_B4: SegmentGGO;
  B4_C3: SegmentGGO;
  C3_C4: SegmentGGO;
  C4_A3: SegmentGGO;
  A3_A4: SegmentGGO;
  A4_Root: SegmentGGO;

  constructor(
    public name: string,
    public root: XYCoords,
    public n: number,
    public isLabelVisible: boolean = false,
    public caption?: string,
    public labelMode: GGB.LabelMode = GGB.LabelMode.Caption
  ) {
    this.caption = this.caption || this.name;

    const withName = (elementName: string) => `${name}${elementName}`;

    const sortament = Sortament.Dvotavr[n + ""];
    if (!sortament) {
      throw new Error(`Dvotavr with number = ${n} has not been found in sortament!`)
    }
    const h = sortament.h;
    const b = sortament.b;
    const s = sortament.s;
    const t = sortament.t;

    const innerSide = b / 2 - s / 2;
    const leg = h - t * 2;
    const A2 = XY(root.x, root.y + t);
    const A4 = XY(root.x + b, root.y);
    const A3 = XY(A4.x, A4.y + t);
    const C1 = XY(A2.x + innerSide, A2.y);
    const C2 = XY(C1.x, C1.y + leg);
    const C3 = XY(C2.x + s, C2.y);
    const C4 = XY(C1.x + s, C1.y);
    const B1 = XY(C2.x - innerSide, C2.y);
    const B2 = XY(B1.x, B1.y + t);
    const B3 = XY(B2.x + b, B2.y);
    const B4 = XY(B3.x, B3.y - t);

    this.Root_A2 = new SegmentGGO(withName("RootA2"), root, A2);
    this.A2_C1 = new SegmentGGO(withName("A2C1"), A2, C1);
    this.C1_C2 = new SegmentGGO(withName("C1C2"), C1, C2);
    this.C2_B1 = new SegmentGGO(withName("C2B1"), C2, B1);
    this.B1_B2 = new SegmentGGO(withName("B1B2"), B1, B2);
    this.B2_B3 = new SegmentGGO(withName("B2B3"), B2, B3);
    this.B3_B4 = new SegmentGGO(withName("B3B4"), B3, B4);
    this.B4_C3 = new SegmentGGO(withName("B4C3"), B4, C3);
    this.C3_C4 = new SegmentGGO(withName("C3C4"), C3, C4);
    this.C4_A3 = new SegmentGGO(withName("C4A3"), C4, A3);
    this.A3_A4 = new SegmentGGO(withName("A3A4"), A3, A4);
    this.A4_Root = new SegmentGGO(withName("A4Root"), A4, root);

    this.segments = [
      this.Root_A2, this.A2_C1, this.C1_C2, this.C2_B1, this.B1_B2, this.B2_B3, this.B3_B4,
      this.B4_C3, this.C3_C4, this.C4_A3, this.A3_A4, this.A4_Root
    ]
  }

  rotate(angle: Angle, point: XYCoords = this.root.copy()): DvotavrGGO {
    this.root.rotate(angle, point);
    this.segments.forEach(s => {
      s.rotate(angle, point)
    });
    return this
  }

  copy(): DvotavrGGO {
    return new DvotavrGGO(this.name, this.root.copy(), this.n)
  }

  getCommands(): string[] {
    const polygonVertices = this.segments.map(s => [s.rootPoint.name, s.endPoint.name]).reduce((prev, cur) => prev.concat(cur));
    return [
      ...this.segments.map(s => s.getCommands()).reduce((prev, cur) => prev.concat(cur)),
      `${this.name}=Polygon(${Array.from(polygonVertices).join(",")})`,
      `SetLineThickness(${this.name},0)`,
      `ShowLabel(${this.name},${this.isLabelVisible})`,
      `SetCaption(${this.name},"${this.caption}")`,
      `SetLabelMode(${this.name},${this.labelMode})`,
      `SetFixed(${this.name},true,true)`
    ]
  }

  toJson(): DvotavrGGOJSON {
    return {
      kind: this.kind,
      root: this.root.toJson(),
      name: this.name,
      n: this.n
    }
  }

  static fromJson(json: GeogebraObjectJson): DvotavrGGO {
    const j = json as DvotavrGGOJSON;
    return new DvotavrGGO(j.name, XYCoords.fromJson(j.root), j.n)
  }

  maxCoord(): XYCoordsJson {
    const segmentMaxCoords = this.segments.map(s => s.maxCoord());
    return {
      x: NumberUtils.maxAbs(...segmentMaxCoords.map(smc => smc.x)),
      y: NumberUtils.maxAbs(...segmentMaxCoords.map(smc => smc.y))
    }
  }

  getDeleteCommands(): string[] {
    return this.segments.map(s => s.getDeleteCommands()).reduce((prev, cur) => prev.concat(cur))
  }
}
