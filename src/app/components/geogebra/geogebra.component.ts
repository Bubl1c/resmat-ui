import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { CoordsUtils } from "../../utils/GeometryUtils";
import { GGB } from "./geogebraDefinitions";
import { GeogebraObject, TextGGO } from "./geogebraCustomObjects";
import { NumberUtils } from "../../utils/NumberUtils";
import XY = CoordsUtils.XY;

declare const GGBApplet: any;

export class GeogebraComponentSettings {
  static defaults = {
    width: 400,
    height: 400
  };

  props: GGB.AppletProperties = {};

  constructor(public width?: number, public height?: number) {
    this.width = width || GeogebraComponentSettings.defaults.width;
    this.height = height || GeogebraComponentSettings.defaults.height;
  }

  setProps(props: GGB.AppletProperties): GeogebraComponentSettings {
    this.props = props;
    return this
  }
}

@Component({
  selector: 'geogebra',
  templateUrl: './geogebra.component.html',
  styleUrls: ['./geogebra.component.css']
})
export class GeogebraComponent implements OnInit, AfterViewInit {

  @Input() objects: GeogebraObject[];
  @Input() settings?: GeogebraComponentSettings;

  editorId: string;
  private editor?: GGB.Applet;
  private api?: GGB.API;

  constructor() {
    this.editorId = `geogebra-component-identifier-${Math.random().toString(36).substring(7)}`;
  }

  ngOnInit() {
    this.prepare()
  }

  ngAfterViewInit(): void {
    this.editor.inject(this.editorId);
  }

  private prepare(): void {
    if (!this.settings) {
      this.settings = new GeogebraComponentSettings();
    }
    if (!this.objects || this.objects.length === 0) {
      this.objects = []
    }
    const maxCoords = this.objects.map(o => o.maxCoord());
    const maxCoord = NumberUtils.maxAbs(...maxCoords.map(c => c.x), ...maxCoords.map(c => c.y));
    const zoomOut = Math.ceil((maxCoord + maxCoord * 0.3) / (this.settings.width / 100));
    const properties = {
      "appName": "classic",
      "width": this.settings.width,
      "height": this.settings.height,
      "showToolBar": true,
      "showMenuBar": true,
      "allowStyleBar": false,
      "showAlgebraInput": true,
      "enableLabelDrags": true,
      "enableShiftDragZoom": true,
      "enableRightClick": true,
      "showToolBarHelp": true,
      "errorDialogsActive": true,
      "showTutorialLink": true,
      "showLogging": true,
      "useBrowserForJS": false,
      "language": "Ukrainian",
      "country": "UA",
      "appletOnLoad": (api: GGB.API) => {
        api.setGridVisible(true);
        if (zoomOut > 1) {
          api.evalCommand(`ZoomOut(${zoomOut})`);
        }
        this.api = api;
        this.render(api);
      }
    } as GGB.AppletProperties;
    Object.keys(this.settings.props).forEach(k => {
      properties[k] = this.settings.props[k];
    });
    this.editor = new GGBApplet(properties) as GGB.Applet;
  }

  private render(api: GGB.API): void {
    this.objects.forEach(obj => {
      api.evalCommand(obj.getCommands().join("\n"));
    })
  }

  makeParams() {
    // let componentThis = this;
    // let parameters = {
    //   "appName":"classic",
    //   "width":800,
    //   "height":600,
    //   "showToolBar":true,
    //   "borderColor":null,
    //   "showMenuBar":false,
    //   "allowStyleBar":false,
    //   "showAlgebraInput":true,
    //   "customToolbar":"0|41|42|",
    //   "enableLabelDrags":false,
    //   "enableShiftDragZoom":true,
    //   "enableRightClick":false,
    //   "capturingThreshold":null,
    //   "showToolBarHelp":false,
    //   "errorDialogsActive":true,
    //   "showTutorialLink":true,
    //   "showLogging":true,
    //   "useBrowserForJS":false,
    //   "appletOnLoad": null,
    //   "perspective": "G"
    // };
    // parameters.appletOnLoad = function(api) {
    //   let strLength = 150;
    //   function addListener(objName) {
    //     printConstructionState("Add", objName);
    //   }
    //
    //   function removeListener(objName) {
    //     printConstructionState("Remove", objName);
    //   }
    //
    //   function renameListener(oldObjName, newObjName) {
    //     printConstructionState("Rename", `${oldObjName} -> ${newObjName}`);
    //   }
    //
    //   function updateListener(objName) {
    //     let strVal = api.getValueString(objName);
    //     console.log(`Update: ${strVal}`);
    //     componentThis.updated = true;
    //   }
    //
    //   function clearListener() {
    //     console.log(`Clear`);
    //     console.clear()
    //   }
    //
    //   function printConstructionState(command, name) {
    //     let objNumber = api.getObjectNumber();
    //     let strState = "Number of objects: " + objNumber;
    //     for (let i = 0; i < objNumber; i++) {
    //       let strName = api.getObjectName(i);
    //       let strType = api.getObjectType(strName);
    //       let strCommand = api.getCommandString(strName);
    //       let latexCommand = api.getLaTeXString(strName);
    //       strState += "\n" + strType + " " + strName + ", " + strCommand + ", " + latexCommand;
    //     }
    //     console.log(`${command} ${name} - New state: ${strState}`);
    //   }
    //   // register add, remove, rename and update listeners
    //   // api.registerAddListener(addListener);
    //   // api.registerRemoveListener(removeListener);
    //   // api.registerRenameListener(renameListener);
    //   // api.registerClearListener(clearListener);
    //   // api.registerUpdateListener(updateListener);
    //   // api.evalCommand("A=(-3.15,3.28)");
    //   // api.evalCommand("B=(-2.15,2.48)");
    //   // api.evalCommand("line1: 0.8x + y = 0.76");
    //   // api.evalCommand("ellipse1: (x + 3.83)² + (y - 1.56)² = 2.14");
    //   // api.setVisible("A", false);
    //   // api.setLabelVisible("ellipse1");
    //   // api.evalCommand("SegmentStartPoint=(-4.0,-2.0)");
    //   // api.evalCommand("SegmentEndPoint=(-2.0,-2.0)");
    //   // api.evalCommand("segment1=Segment(SegmentStartPoint,SegmentEndPoint)");
    //   // api.evalCommand("VectorStartPoint=(-4.0,-5.0)");
    //   // api.evalCommand("VectorEndPoint=(-2.0,-5.0)");
    //   // api.evalCommand("vector1=Vector(VectorStartPoint,VectorEndPoint)");
    //   // api.evalCommand("Text(\"\\cos (2\\theta) = \\cos^2 \\theta - \\sin^2 \\theta\", (2, 1), false, true)")
    //   // api.setVisible("VectorEndPoint", false);
    //   // api.evalCommand("ShowAxes(false)");
    //   // api.evalCommand("SetVisibleInView(VectorEndPoint,1,false)");
    //   // api.evalCommand("ShowLabel(vector1,false)");
    //   const cmds = [
    //     // ...new CustomAxesGGO(XY(0, 0), "CustomAxis", 20).rotate(new Angle(45)).rotate(new Angle(45)).getCommands(),
    //     // ...new EllipseGGO("Ellipse1", XY(10, 10), XY(-10, -10), XY(15, -15)).rotate(new Angle(45), XY(0, 0)).getCommands(),
    //     // ...new KutykGGO("Kutyk0", XY(2, 2), 20, 3).rotate(new Angle(45)).getCommands(),
    //     // ...new PlateGGO("P0", XY(-5, 2), 2, 5, true).getCommands(),
    //     ...new DvotavrGGO("Dvotavr0", XY(0, 0), 10).getCommands(),
    //     `ZoomOut(20)`
    //   ];
    //   api.evalCommand(cmds.join("\n"));
    //   // cmds.forEach(cmd => api.evalCommand(cmd))
    //   api.setGridVisible(true);
    //   componentThis.xml = componentThis.editor.getAppletObject().getXML()
    // };
    // return parameters
  }

}
