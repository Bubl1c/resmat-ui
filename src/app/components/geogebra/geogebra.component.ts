import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Sortament } from "../../utils/sortament";
import { GeometryUtils } from "../../utils/GeometryUtils";

declare const GGBApplet: any;

export namespace CoordsUtils {
  export function XY(x: number, y: number): XYCoords {
    return new XYCoords(x, y)
  }
}

import XY = CoordsUtils.XY;
import { NumberUtils } from "../../utils/NumberUtils";

interface XYCoordsJson {
  x: number
  y: number
}

export class XYCoords implements XYCoordsJson {
  static fromJson(json: XYCoordsJson): XYCoords {
    return new XYCoords(json.x, json.y)
  }

  constructor(public x: number, public y: number) {}
  copy(): XYCoords {
    return new XYCoords(this.x, this.y)
  }

  rotate(angle: Angle, point: XYCoords = new XYCoords(0, 0)): XYCoords {
    //Translate to a new coordinate system with center at point
    let translatedX = this.x - point.x;
    let translatedY = this.y - point.y;
    //Rotate clockwise
    const cos = Math.cos(angle.radians);
    const sin = Math.sin(angle.radians);
    const rotatedX = translatedX * cos + translatedY * sin;
    const rotatedY = - translatedX * sin + translatedY * cos;
    //Go back to the original coordinate system
    this.x = NumberUtils.accurateRound(rotatedX + point.x, 2);
    this.y = NumberUtils.accurateRound(rotatedY + point.y, 2);
    return this
  }

  getCommand(): string {
    return `(${this.x},${this.y})`
  }

  toJson(): XYCoordsJson {
    return {
      x: this.x,
      y: this.y
    }
  }
}

enum AngleType {
  Degrees,
  Radians
}
export class Angle {
  public degrees: number;
  public radians: number;

  constructor(angle: number, angleType: AngleType = AngleType.Degrees) {
    switch (angleType) {
      case AngleType.Degrees:
        this.degrees = angle;
        this.radians = angle * (Math.PI/180);
        break;
      case AngleType.Radians:
        this.degrees = angle / (Math.PI/180);
        this.radians = angle;
        break;
      default:
        throw new Error("Unhandled angle type: " + angleType)
    }
  }
}

export type GGOKind = "text" | "point" | "vector" | "segment" | "custom_axes" | "ellipse" | "kutyk" | "plate" | "shveller" | "dvotavr";

export interface GeogebraObjectJson {
  kind: GGOKind
  root: XYCoordsJson
  name: string
}

export interface GeogebraObject<T> extends GeogebraObjectJson {
  rotate(angle: Angle, point: XYCoords): T
  copy(): T
  getCommands(): string[]
  toJson(): GeogebraObjectJson
}

export namespace GeogebraObject {
  export function fromJson(json: GeogebraObjectJson): GeogebraObject<any> {
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
        throw new Error(`Unhandled GeogebraObject kind ${json.kind} in json ${json}`)
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
export class TextGGO implements GeogebraObject<TextGGO> {
  kind: GGOKind = "text";

  constructor(public name: string, public root: XYCoords, public substituteVariables: boolean = false, public laTeXFormula: boolean = false) {}

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
}

enum GGLabelMode {
  Name,
  NameValue,
  Value,
  Caption,
  CaptionValue
}

export interface PointGGOJSON extends GeogebraObjectJson {
  isVisible: boolean
  labelMode: GGLabelMode
}
export class PointGGO implements GeogebraObject<PointGGO> {
  kind: GGOKind = "point";

  constructor(public name: string, public root: XYCoords, public isVisible: boolean = false, public labelMode: GGLabelMode = GGLabelMode.Name) {}

  rotate(angle: Angle, point: XYCoords = new XYCoords(0, 0)): PointGGO {
    this.root.rotate(angle, point);
    return this
  }

  copy(): PointGGO {
    return new PointGGO(this.name, this.root.copy(), this.isVisible);
  }

  getCommands(): string[] {
    const pointCmd = `${this.name}=${this.root.getCommand()}`;
    return [
      pointCmd,
      `SetLabelMode(${this.name},${this.labelMode})`,
      `SetVisibleInView(${this.name},1,${this.isVisible})`
    ]
  }

  toJson(): PointGGOJSON {
    return this.copy()
  }

  static fromJson(json: GeogebraObjectJson): PointGGO {
    const j = json as PointGGOJSON;
    return new PointGGO(j.name, XYCoords.fromJson(j.root), j.isVisible, j.labelMode)
  }
}

export interface VectorGGOJSON extends GeogebraObjectJson {
  end: XYCoordsJson
  isLabelVisible: boolean
}
export class VectorGGO implements GeogebraObject<VectorGGO> {
  kind: GGOKind = "vector";

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
}

export interface SegmentGGOJSON extends GeogebraObjectJson {
  end: XYCoordsJson
  isLabelVisible: boolean
}
export class SegmentGGO implements GeogebraObject<SegmentGGO> {
  kind: GGOKind = "segment";

  rootPoint: PointGGO;
  endPoint: PointGGO;
  parentName?: string;

  constructor(public name: string, public root: XYCoords, public end: XYCoords, public isLabelVisible: boolean = false) {
    const withName = (elementName: string) => `${this.name}${elementName}`;
    this.rootPoint = new PointGGO(withName("Root"), this.root.copy());
    this.endPoint = new PointGGO(withName("End"), this.end.copy());
  }

  rotate(angle: Angle, point: XYCoords = this.root): SegmentGGO {
    this.rootPoint = this.rootPoint.rotate(angle, point);
    this.endPoint = this.endPoint.rotate(angle, point);
    return this;
  }

  copy(): SegmentGGO {
    return new SegmentGGO(this.name, this.root.copy(), this.end.copy(), this.isLabelVisible);
  }

  getCommands(): string[] {
    const parentNameParameter = this.parentName ? `,${this.parentName}` : "";
    return [
      ...this.rootPoint.getCommands(),
      ...this.endPoint.getCommands(),
      `${this.name}=Segment(${this.rootPoint.name},${this.endPoint.name}${parentNameParameter})`,
      `ShowLabel(${this.name},${this.isLabelVisible})`
    ]
  }

  toJson(): SegmentGGOJSON {
    return {
      kind: this.kind,
      root: this.root.toJson(),
      end: this.end.toJson(),
      name: this.name,
      isLabelVisible: this.isLabelVisible
    }
  }

  static fromJson(json: GeogebraObjectJson): SegmentGGO {
    const j = json as SegmentGGOJSON;
    return new SegmentGGO(j.name, XYCoords.fromJson(j.root), XYCoords.fromJson(j.end), j.isLabelVisible)
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
export class CustomAxesGGO implements GeogebraObject<CustomAxesGGO> {
  kind: GGOKind = "custom_axes";

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
}

export interface EllipseGGOJSON extends GeogebraObjectJson {
  f1: XYCoordsJson,
  f2: XYCoordsJson,
  ellipsePoint: XYCoordsJson
}
export class EllipseGGO implements GeogebraObject<EllipseGGO> {
  kind: GGOKind = "ellipse";

  root: XYCoords;
  f1Point: PointGGO;
  f2Point: PointGGO;
  ellipsePoint: PointGGO;

  constructor(
    public name: string,
    f1: XYCoords,
    f2: XYCoords,
    ellipsePoint: XYCoords
  ) {
    const withName = (elementName: string) => `${name}${elementName}`;
    const center = GeometryUtils.evalSegmentCenter(f1.x, f1.y, f2.x, f2.y);
    this.root = XY(center.x, center.y);
    this.f1Point = new PointGGO(withName("F1Point"), f1.copy(),true);
    this.f2Point = new PointGGO(withName("F2Point"), f2.copy(), true);
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
}

export interface KutykGGOJSON extends GeogebraObjectJson {
  b: number
  t: number
}
/**
 * Root     b    A
 *  -------------
 *  | ----------- A1
 *  | |C1
 * b| |   .C
 *  |_|
 *  B t B1
 */
export class KutykGGO implements GeogebraObject<KutykGGO> {
  kind: GGOKind = "kutyk";

  private segments: SegmentGGO[];
  C: PointGGO;

  Root_A: SegmentGGO;
  A_A1: SegmentGGO;
  Root_B: SegmentGGO;
  B_B1: SegmentGGO;
  C1_A1: SegmentGGO;
  C1_B1: SegmentGGO;

  constructor(
    public name: string,
    public root: XYCoords,
    public b: number,
    public t: number
  ) {
    const withName = (elementName: string) => `${name}${elementName}`;

    const sortamentNumber = b/10;
    const sortament = Sortament.Kutyk["" + sortamentNumber + "_" + t];
    if (!sortament) {
      throw new Error(`Kutyk with b = ${b} and t = ${t} has not been found in sortament!`)
    }
    const A = XY(root.x + b, root.y);
    const A1 = XY(A.x, A.y - t);
    const B = XY(root.x, root.y - b);
    const B1 = XY(B.x + t, B.y);
    const C1 = XY(root.x + t, root.y - t);
    const C = XY(root.x + sortament.z_0, root.y - sortament.z_0);

    this.C = new PointGGO(withName("C"), C, true);

    this.Root_A = new SegmentGGO(withName("RootA"), root, A);
    this.A_A1 = new SegmentGGO(withName("AA1"), A, A1);
    this.Root_B = new SegmentGGO(withName("RootB"), root, B);
    this.B_B1 = new SegmentGGO(withName("BB1"), B, B1);
    this.C1_A1 = new SegmentGGO(withName("C1A1"), C1, A1);
    this.C1_B1 = new SegmentGGO(withName("C1B1"), C1, B1);

    this.segments = [this.Root_A, this.A_A1, this.Root_B, this.B_B1, this.C1_A1, this.C1_B1]
  }

  rotate(angle: Angle, point: XYCoords = this.root.copy()): KutykGGO {
    this.C.rotate(angle, point);
    this.segments.forEach(s => {
      s.rotate(angle, point)
    });
    return this
  }

  copy(): KutykGGO {
    return new KutykGGO(this.name, this.root.copy(), this.b, this.t)
  }

  getCommands(): string[] {
    const polygonVertices = [
      this.Root_A.rootPoint.name,
      this.Root_A.endPoint.name,
      this.A_A1.endPoint.name,
      this.C1_B1.rootPoint.name,
      this.C1_B1.endPoint.name,
      this.B_B1.rootPoint.name
    ];
    return [
      ...this.C.getCommands(),
      ...this.segments.map(s => s.getCommands()).reduce((prev, cur) => prev.concat(cur)),
      `${this.name}=Polygon(${Array.from(polygonVertices).join(",")})`,
      `SetLineThickness(${this.name},0)`
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
export class PlateGGO implements GeogebraObject<PlateGGO> {
  kind: GGOKind = "plate";

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
    public isLabelVisible: Boolean = false
  ) {
    const withName = (elementName: string) => `${name}${elementName}`;

    const Root = this.root.copy();
    const B = XY(Root.x, Root.y +h);
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
    const polygonVertices = [
      this.Root_B.rootPoint.name,
      this.B_C1.rootPoint.name,
      this.C1_D.rootPoint.name,
      this.D_Root.rootPoint.name
    ];
    return [
      ...this.segments.map(s => s.getCommands()).reduce((prev, cur) => prev.concat(cur)),
      `${this.name}=Polygon(${Array.from(polygonVertices).join(",")})`,
      `SetLineThickness(${this.name},0)`,
      `ShowLabel(${this.name},${this.isLabelVisible})`
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
export class ShvellerGGO implements GeogebraObject<ShvellerGGO> {
  kind: GGOKind = "shveller";

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
    public n: number
  ) {
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
    const C2 = XY(C1.x, C1.y - h + t*2);
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
    const polygonVertices = [
      this.Root_B1.rootPoint.name,
      this.Root_B1.endPoint.name,
      this.B1_B2.endPoint.name,
      this.B2_D1.endPoint.name,
      this.D1_C1.endPoint.name,
      this.C1_C2.endPoint.name,
      this.C2_D2.endPoint.name,
      this.D2_B3.endPoint.name
    ];
    return [
      ...this.segments.map(s => s.getCommands()).reduce((prev, cur) => prev.concat(cur)),
      `${this.name}=Polygon(${Array.from(polygonVertices).join(",")})`,
      `SetLineThickness(${this.name},0)`
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
export class DvotavrGGO implements GeogebraObject<DvotavrGGO> {
  kind: GGOKind = "dvotavr";

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
    public n: number
  ) {
    const withName = (elementName: string) => `${name}${elementName}`;

    const sortament = Sortament.Dvotavr[n + ""];
    if (!sortament) {
      throw new Error(`Dvotavr with number = ${n} has not been found in sortament!`)
    }
    const h = sortament.h;
    const b = sortament.b;
    const s = sortament.s;
    const t = sortament.t;

    const innerSide = b/2 - s/2;
    const leg = h - t*2;
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
    const polygonVertices = [
      this.Root_A2.rootPoint.name,
      this.Root_A2.endPoint.name,
      this.A2_C1.endPoint.name,
      this.C1_C2.endPoint.name,
      this.C2_B1.endPoint.name,
      this.B1_B2.endPoint.name,
      this.B2_B3.endPoint.name,
      this.B3_B4.endPoint.name,
      this.B4_C3.endPoint.name,
      this.C3_C4.endPoint.name,
      this.C4_A3.endPoint.name,
      this.A3_A4.endPoint.name,
      this.A4_Root.endPoint.name
    ];
    return [
      ...this.segments.map(s => s.getCommands()).reduce((prev, cur) => prev.concat(cur)),
      `${this.name}=Polygon(${Array.from(polygonVertices).join(",")})`,
      `SetLineThickness(${this.name},0)`
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
}

@Component({
  selector: 'geogebra',
  templateUrl: './geogebra.component.html',
  styleUrls: ['./geogebra.component.css']
})
export class GeogebraComponent implements OnInit, AfterViewInit {

  constructor() { }

  editor;
  editorId: string;
  api;
  xml;
  updated: boolean;

  ngOnInit() {
    this.editorId = `geogebra-component-identifier-${Math.random().toString(36).substring(7)}`;
    this.editor = new GGBApplet(this.makeParams());
  }

  ngAfterViewInit(): void {
    this.editor.inject(this.editorId);
    const that = this;
    // setInterval(() => {
    //   if(that.updated) {
    //     // if (this.editor.getAppletObject().getXML() !== that.xml) {
    //     //   console.log("Setting Xml");
    //     //   this.editor.getAppletObject().setXML(this.xml);
    //     // }
    //     console.log("Undoing");
    //     this.editor.getAppletObject().setXML(this.xml);
    //     that.updated = false;
    //   }
    // }, 10000)
  }

  getXml() {
    let that = this;
    console.log(that.editor.getAppletObject().getXml())
  }

  makeParams() {
    let componentThis = this;
    let parameters = {
      // "id": componentThis.editorId,
      // "prerelease": false,
      // "width": 1000,
      // "height": 600,
      // "borderColor": null,
      // "showToolBar": false,
      // "showMenuBar": false,
      // "showAlgebraInput": false,
      // "allowStyleBar": false,
      // "showResetIcon": false,
      // "enableLabelDrags": false,
      // "enableShiftDragZoom": false,
      // "enableRightClick": false,
      // "capturingThreshold": null,
      // "showToolBarHelp": false,
      // "errorDialogsActive": true,
      // "useBrowserForJS": false,
      // "showLogging": "false",
      // "appletOnLoad": null,
      // "enableCAS": false,
      "appName":"classic",
      "width":800,
      "height":600,
      "showToolBar":true,
      "borderColor":null,
      "showMenuBar":false,
      "allowStyleBar":false,
      "showAlgebraInput":true,
      "customToolbar":"0|41|42|",
      "enableLabelDrags":false,
      "enableShiftDragZoom":true,
      "enableRightClick":false,
      "capturingThreshold":null,
      "showToolBarHelp":false,
      "errorDialogsActive":true,
      "showTutorialLink":true,
      "showLogging":true,
      "useBrowserForJS":false,
      "appletOnLoad": null,
      "perspective": "G"
    };
    parameters.appletOnLoad = function(api) {
      let strLength = 150;
      function addListener(objName) {
        printConstructionState("Add", objName);
      }

      function removeListener(objName) {
        printConstructionState("Remove", objName);
      }

      function renameListener(oldObjName, newObjName) {
        printConstructionState("Rename", `${oldObjName} -> ${newObjName}`);
      }

      function updateListener(objName) {
        let strVal = api.getValueString(objName);
        console.log(`Update: ${strVal}`);
        componentThis.updated = true;
      }

      function clearListener() {
        console.log(`Clear`);
        console.clear()
      }

      function printConstructionState(command, name) {
        let objNumber = api.getObjectNumber();
        let strState = "Number of objects: " + objNumber;
        for (let i = 0; i < objNumber; i++) {
          let strName = api.getObjectName(i);
          let strType = api.getObjectType(strName);
          let strCommand = api.getCommandString(strName);
          let latexCommand = api.getLaTeXString(strName);
          strState += "\n" + strType + " " + strName + ", " + strCommand + ", " + latexCommand;
        }
        console.log(`${command} ${name} - New state: ${strState}`);
      }
      // register add, remove, rename and update listeners
      // api.registerAddListener(addListener);
      // api.registerRemoveListener(removeListener);
      // api.registerRenameListener(renameListener);
      // api.registerClearListener(clearListener);
      // api.registerUpdateListener(updateListener);
      // api.evalCommand("A=(-3.15,3.28)");
      // api.evalCommand("B=(-2.15,2.48)");
      // api.evalCommand("line1: 0.8x + y = 0.76");
      // api.evalCommand("ellipse1: (x + 3.83)² + (y - 1.56)² = 2.14");
      // api.setVisible("A", false);
      // api.setLabelVisible("ellipse1");
      // api.evalCommand("SegmentStartPoint=(-4.0,-2.0)");
      // api.evalCommand("SegmentEndPoint=(-2.0,-2.0)");
      // api.evalCommand("segment1=Segment(SegmentStartPoint,SegmentEndPoint)");
      // api.evalCommand("VectorStartPoint=(-4.0,-5.0)");
      // api.evalCommand("VectorEndPoint=(-2.0,-5.0)");
      // api.evalCommand("vector1=Vector(VectorStartPoint,VectorEndPoint)");
      // api.evalCommand("Text(\"\\cos (2\\theta) = \\cos^2 \\theta - \\sin^2 \\theta\", (2, 1), false, true)")
      // api.setVisible("VectorEndPoint", false);
      // api.evalCommand("ShowAxes(false)");
      // api.evalCommand("SetVisibleInView(VectorEndPoint,1,false)");
      // api.evalCommand("ShowLabel(vector1,false)");
      const cmds = [
        // ...new CustomAxesGGO(XY(0, 0), "CustomAxis", 20).rotate(new Angle(45)).rotate(new Angle(45)).getCommands(),
        // ...new EllipseGGO("Ellipse1", XY(10, 10), XY(-10, -10), XY(15, -15)).rotate(new Angle(45), XY(0, 0)).getCommands(),
        // ...new KutykGGO("Kutyk0", XY(2, 2), 20, 3).rotate(new Angle(45)).getCommands(),
        // ...new PlateGGO("P0", XY(-5, 2), 2, 5, true).getCommands(),
        ...new DvotavrGGO("Dvotavr0", XY(0, 0), 10).getCommands(),
        `ZoomOut(20)`
      ];
      api.evalCommand(cmds.join("\n"));
      // cmds.forEach(cmd => api.evalCommand(cmd))
      api.setGridVisible(true);
      componentThis.xml = componentThis.editor.getAppletObject().getXML()
    };
    return parameters
  }

}
