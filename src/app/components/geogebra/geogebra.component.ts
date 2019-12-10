import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Sortament } from "../../utils/sortament";

declare const GGBApplet: any;

export namespace CoordsUtils {
  export function XY(x: number, y: number): XYCoords {
    return new XYCoords(x, y)
  }
}

import XY = CoordsUtils.XY;
import { GeometryUtils } from "../../utils/GeometryUtils";

export class XYCoords {
  constructor(public x: number, public y: number) {}
  copy(): XYCoords {
    return new XYCoords(this.x, this.y)
  }

  rotate(angle: Angle, point: XYCoords = new XYCoords(0, 0)): XYCoords {
    //Move to a new coordinate system with center at point
    let x = this.x - point.x;
    let y = this.y - point.y;
    //Rotate
    const rotatedX = x * Math.cos(-angle.radians) - y * Math.sin(-angle.radians);
    const rotatedY = x * Math.sin(-angle.radians) + y * Math.cos(-angle.radians);
    //Go back to the original coordinate system
    this.x = rotatedX + point.x;
    this.y = rotatedY + point.y;
    return this
  }

  getCommand(): string {
    return `(${this.x},${this.y})`
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

export interface GeogebraObject<T> {
  root: XYCoords
  name: string
  rotate(angle: Angle, point: XYCoords): T
  copy(): T
  getCommands(): string[]
}

/**
 * https://wiki.geogebra.org/en/Text_Command
 */
export class TextGGO implements GeogebraObject<TextGGO> {
  constructor(public root: XYCoords, public name: string, public substituteVariables: boolean = false, public laTeXFormula: boolean = false) {}

  rotate(angle: Angle, point: XYCoords = new XYCoords(0, 0)): TextGGO {
    this.root.rotate(angle, point);
    return this;
  }

  copy(): TextGGO {
    return new TextGGO(this.root.copy(), this.name, this.substituteVariables, this.laTeXFormula);
  }

  getCommands(): string[] {
    return [
      `Text("${this.name}", (${this.root.x}, ${this.root.y}), ${this.substituteVariables}, ${this.laTeXFormula})`
    ]
  }
}

export class PointGGO implements GeogebraObject<PointGGO> {
  static xy(x: number, y: number, name: string, isVisible: boolean = false): PointGGO {
    return new PointGGO(XY(x, y), name, isVisible)
  }

  constructor(public root: XYCoords, public name: string, public isVisible: boolean = false) {}

  rotate(angle: Angle, point: XYCoords = new XYCoords(0, 0)): PointGGO {
    this.root.rotate(angle, point);
    return this
  }

  copy(): PointGGO {
    return new PointGGO(this.root.copy(), this.name, this.isVisible);
  }

  getCommands(): string[] {
    const pointCmd = `${this.name}=${this.root.getCommand()}`;
    return this.isVisible
      ? [pointCmd]
      : [pointCmd, `SetVisibleInView(${this.name},1,false)`];
  }
}

export class VectorWithExistingPointsGGO implements GeogebraObject<VectorWithExistingPointsGGO> {
  root: XYCoords = null;

  constructor(public startPointName: string, public endPointName: string, public name: string, public isLabelVisible: boolean = false) {}

  getCommands(): string[] {
    const vectorCmd = `${this.name}=Vector(${this.startPointName},${this.endPointName})`;
    return this.isLabelVisible
      ? [vectorCmd]
      : [vectorCmd, `ShowLabel(${this.name},false)`];
  }

  copy(): VectorWithExistingPointsGGO {
    return new VectorWithExistingPointsGGO(this.startPointName, this.endPointName, this.name, this.isLabelVisible);
  }

  rotate(angle: Angle, point: XYCoords): VectorWithExistingPointsGGO {
    throw new Error("VectorWithExistingPoints does not support rotation. Please rotate underlying points instead.")
  }
}

export class VectorGGO implements GeogebraObject<VectorGGO> {
  rootPoint: PointGGO;
  endPoint: PointGGO;
  customLabel?: TextGGO;

  constructor(public root: XYCoords, public end: XYCoords, public name: string, public isLabelVisible: boolean = false) {
    const withName = (elementName: string) => `${this.name}${elementName}`;
    this.rootPoint = new PointGGO(this.root, withName("Root"));
    this.endPoint = new PointGGO(this.end, withName("End"));
  }

  rotate(angle: Angle, point: XYCoords = this.root): VectorGGO {
    this.rootPoint.rotate(angle, point);
    this.endPoint.rotate(angle, point);
    this.customLabel && this.customLabel.rotate(angle, point);
    return this;
  }

  copy(): VectorGGO {
    return new VectorGGO(this.root.copy(), this.end.copy(), this.name, this.isLabelVisible);
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
}

export class SegmentGGO implements GeogebraObject<SegmentGGO> {
  rootPoint: PointGGO;
  endPoint: PointGGO;
  parentName?: string;

  constructor(public root: XYCoords, public end: XYCoords, public name: string, public isLabelVisible: boolean = false) {
    const withName = (elementName: string) => `${this.name}${elementName}`;
    this.rootPoint = new PointGGO(this.root, withName("Root"));
    this.endPoint = new PointGGO(this.end, withName("End"));
  }

  rotate(angle: Angle, point: XYCoords = this.root): SegmentGGO {
    this.rootPoint = this.rootPoint.rotate(angle, point);
    this.endPoint = this.endPoint.rotate(angle, point);
    return this;
  }

  copy(): SegmentGGO {
    return new SegmentGGO(this.root.copy(), this.end.copy(), this.name, this.isLabelVisible);
  }

  setParent(parentName: string): SegmentGGO {
    this.parentName = parentName;
    return this;
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
}

export class CustomAxisGGO implements GeogebraObject<CustomAxisGGO> {
  xAxis: VectorGGO;
  yAxis: VectorGGO;

  constructor(
    public root: XYCoords,
    public name: string,
    public size: number = 5,
    public xAxisName: string = "X",
    public yAxisName: string = "Y"
  ) {
    const withName = (elementName: string) => `${this.name}${elementName}`;
    this.xAxis = new VectorGGO(XY(root.x - size, root.y), XY(root.x + size, root.y), withName(xAxisName));
    this.xAxis.setCustomLabel(new TextGGO(this.xAxis.endPoint.root, xAxisName));
    this.yAxis = new VectorGGO(XY(root.x, root.y - size), XY(root.x, root.y + size), withName(yAxisName));
    this.yAxis.setCustomLabel(new TextGGO(this.yAxis.endPoint.root, yAxisName));
  }

  rotate(angle: Angle, point: XYCoords = this.root): CustomAxisGGO {
    this.xAxis.rotate(angle, point);
    this.yAxis.rotate(angle, point);
    return this;
  }

  copy(): CustomAxisGGO {
    return new CustomAxisGGO(this.root.copy(), this.name, this.size, this.xAxisName, this.yAxisName);
  }

  getCommands(): string[] {
    return [
      ...this.xAxis.getCommands(),
      ...this.yAxis.getCommands()
    ];
  }
}

export class EllipseGGO implements GeogebraObject<EllipseGGO> {
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
    this.f1Point = new PointGGO(f1, withName("F1Point"));
    this.f2Point = new PointGGO(f2, withName("F2Point"));
    this.ellipsePoint = new PointGGO(ellipsePoint, withName("EllipsePoint"));
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
}

/**
 * O        b    A
 *  -------------
 *  | ----------- A1
 *  | |C1
 * b| |   .C
 *  |_|
 *  B t B1
 */
export class KutykGGO implements GeogebraObject<KutykGGO> {
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

    this.C = new PointGGO(C, withName("C"), true);

    this.Root_A = new SegmentGGO(root, A, withName("Root_A"));
    this.A_A1 = new SegmentGGO(A, A1, withName("A_A1"));
    this.Root_B = new SegmentGGO(root, B, withName("Root_B"));
    this.B_B1 = new SegmentGGO(B, B1, withName("B_B1"));
    this.C1_A1 = new SegmentGGO(C1, A1, withName("C1_A1"));
    this.C1_B1 = new SegmentGGO(C1, B1, withName("C1_B1"));

    this.segments = [this.Root_A, this.A_A1, this.Root_B, this.B_B1, this.C1_A1, this.C1_B1]
  }

  rotate(angle: Angle, point: XYCoords = this.root): KutykGGO {
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
}

/**
 * B            C
 *  -----------
 *  |          |
 *  |    .root | h
 *  |          |
 *  |_________ |
 * A     b      D
 */
export class PlateGGO implements GeogebraObject<PlateGGO> {
  private segments: SegmentGGO[];

  A_B: SegmentGGO;
  B_C: SegmentGGO;
  C_D: SegmentGGO;
  D_A: SegmentGGO;

  constructor(
    public name: string,
    public root: XYCoords,
    public b: number,
    public h: number
  ) {
    const withName = (elementName: string) => `${name}${elementName}`;

    const A = this.root.copy();
    const B = XY(A.x, A.y +h);
    const C = XY(A.x + b, A.y + h);
    const D = XY(A.x + b, A.y);

    this.A_B = new SegmentGGO(A, B, withName("A_B"));
    this.B_C = new SegmentGGO(B, C, withName("B_C"));
    this.C_D = new SegmentGGO(C, D, withName("C_D"));
    this.D_A = new SegmentGGO(D, A, withName("B_B1"));

    this.segments = [this.A_B, this.B_C, this.C_D, this.D_A]
  }

  rotate(angle: Angle, point: XYCoords = this.root): PlateGGO {
    this.root.rotate(angle, point);
    this.segments.forEach(s => {
      s.rotate(angle, point)
    });
    return this
  }

  copy(): PlateGGO {
    return new PlateGGO(this.name, this.root.copy(), this.b, this.h)
  }

  getCommands(): string[] {
    const polygonVertices = [
      this.A_B.rootPoint.name,
      this.B_C.rootPoint.name,
      this.C_D.rootPoint.name,
      this.D_A.rootPoint.name
    ];
    return [
      ...this.segments.map(s => s.getCommands()).reduce((prev, cur) => prev.concat(cur)),
      `${this.name}=Polygon(${Array.from(polygonVertices).join(",")})`,
      `SetLineThickness(${this.name},0)`
    ]
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

  ngOnInit() {
    this.editorId = `geogebra-component-identifier-${Math.random().toString(36).substring(7)}`;
    this.editor = new GGBApplet(this.makeParams());
  }

  ngAfterViewInit(): void {
    this.editor.inject(this.editorId);
    this.editor.eva
  }

  getXml() {
    let that = this;
    console.log(that.editor.getXml())
  }

  makeParams() {
    let componentThis = this;
    let parameters = {
      "prerelease": false,
      "width": 1000,
      "height": 600,
      "showToolBar": true,
      "borderColor": null,
      "showMenuBar": false,
      "showAlgebraInput": false,
      "showResetIcon": true,
      "enableLabelDrags": false,
      "enableShiftDragZoom": true,
      "enableRightClick": true,
      "capturingThreshold": null,
      "showToolBarHelp": false,
      "errorDialogsActive": true,
      "useBrowserForJS": true,
      "showLogging": "false",
      "appletOnLoad": null
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
      api.registerAddListener(addListener);
      api.registerRemoveListener(removeListener);
      api.registerRenameListener(renameListener);
      api.registerClearListener(clearListener);
      api.registerUpdateListener(updateListener);
      componentThis.api = api;
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
        ...new CustomAxisGGO(XY(0, 0), "CustomAxis", 20).rotate(new Angle(45)).getCommands(),
        ...new EllipseGGO("Ellipse1", XY(10, 10), XY(-10, -10), XY(15, -15)).rotate(new Angle(45), XY(0, 0)).getCommands(),
        ...new KutykGGO("Kutyk0", XY(2, 2), 20, 3).rotate(new Angle(0)).getCommands(),
        ...new PlateGGO("Plate", XY(-5, 2), 2, 5).getCommands(),
        `ZoomOut(5)`
      ];
      cmds.forEach(cmd => api.evalCommand(cmd))
    };
    return parameters
  }

}
