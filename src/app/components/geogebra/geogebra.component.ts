import { AfterViewInit, Component, OnInit } from '@angular/core';

declare const GGBApplet: any;

export class XYCoords {
  constructor(public x: number, public y: number) {}
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
  getCommands(name: string): string[]
  rotated(angle: Angle, point: XYCoords): T
}

export class PointGGO implements GeogebraObject<PointGGO> {
  constructor(public xCoord: number, public yCoord: number, public isVisible: boolean = false) {}

  getCommands(name: string): string[] {
    const pointCmd = `${name}=(${this.xCoord},${this.yCoord})`;
    return this.isVisible
      ? [pointCmd]
      : [pointCmd, `SetVisibleInView(${name},1,false)`];
  }

  rotated(angle: Angle, point: XYCoords = new XYCoords(0, 0)): PointGGO {
    const x = this.xCoord - point.x;
    const y = this.yCoord - point.y;
    const rotatedX = x * Math.cos(-angle.radians) - y * Math.sin(-angle.radians);
    const rotatedY = x * Math.sin(-angle.radians) + y * Math.cos(-angle.radians);
    return new PointGGO(rotatedX + point.x, rotatedY + point.y, this.isVisible)
  }
}

export class VectorGGO implements GeogebraObject<VectorGGO> {
  constructor(public startPointName: string, public endPointName: string, public isLabelVisible: boolean = false) {}

  getCommands(name: string): string[] {
    const vectorCmd = `${name}=Vector(${this.startPointName},${this.endPointName})`;
    return this.isLabelVisible
      ? [vectorCmd]
      : [vectorCmd, `ShowLabel(${name},false)`];
  }

  rotated(angle: Angle, point: XYCoords = new XYCoords(0, 0)): VectorGGO {
    return this
  }
}

export class CustomAxisGGO implements GeogebraObject<CustomAxisGGO> {
  private rotationAngle: Angle;
  private rotationPoint: XYCoords;

  constructor(public centerCoords: XYCoords, public xAxisName: string = "X", public yAxisName: string = "Y") {
    this.rotationAngle = new Angle(0);
    this.rotationPoint = centerCoords;
  }

  rotated(angle: Angle, point?: XYCoords): CustomAxisGGO {
    this.rotationAngle = angle;
    this.rotationPoint = point || this.rotationPoint;
    return this
  }

  getCommands(name: string): string[] {
    let axisCommands = (axisName: string, xChange: number, yChange: number) => {
      const withAxisName = (elementName: string) => `${name}${axisName}${elementName}`;
      const startPointName = withAxisName("startPoint");
      const endPointName = withAxisName("endPoint");
      const axisVectorName = withAxisName("axisVector");
      const textPointName = withAxisName("textPoint");
      return [
        ...new PointGGO(this.centerCoords.x - xChange, this.centerCoords.y - yChange).rotated(this.rotationAngle, this.rotationPoint).getCommands(startPointName),
        ...new PointGGO(this.centerCoords.x + xChange, this.centerCoords.y + yChange).rotated(this.rotationAngle, this.rotationPoint).getCommands(endPointName),
        ...new VectorGGO(startPointName, endPointName).getCommands(axisVectorName),
        ...new PointGGO(this.centerCoords.x + xChange, this.centerCoords.y + yChange).rotated(this.rotationAngle, this.rotationPoint).getCommands(textPointName),
        `Text("${axisName}", ${textPointName}, false, true)`
      ]
    };
    return [
      ...new PointGGO(this.centerCoords.x, this.centerCoords.y).rotated(this.rotationAngle, this.rotationPoint).getCommands(`${name}_center`),
      ...axisCommands(this.xAxisName, 5, 0),
      ...axisCommands(this.yAxisName, 0, 5)
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
      const cmds = new CustomAxisGGO(new XYCoords(2, 2)).rotated(new Angle(10)).getCommands("CustomAxis");
      cmds.forEach(cmd => api.evalCommand(cmd))
    };
    return parameters
  }

}
