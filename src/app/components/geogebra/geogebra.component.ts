import { AfterViewInit, Component, DoCheck, Input, IterableDiffer, IterableDiffers, OnInit } from '@angular/core';
import { CoordsUtils } from "../../utils/GeometryUtils";
import { GGB } from "./geogebra-definitions";
import { GeogebraObject } from "./custom-objects/geogebra-object";
import { CustomAxesGGO } from "./custom-objects/custom-axes-ggo";
import { CustomAxesSettings } from "./custom-objects/geometry-shape";
import XY = CoordsUtils.XY;
import LabelMode = GGB.LabelMode;

declare const GGBApplet: any;

interface IterableChangeRecord<V> {
  currentIndex: number | null
  previousIndex: number | null
  item: V
  trackById: any
}

interface IterableChanges<V> {
  forEachItem(fn: (record: IterableChangeRecord<V>) => void): void
  forEachOperation(fn: (record: IterableChangeRecord<V>, previousIndex: number, currentIndex: number) => void): void
  forEachPreviousItem(fn: (record: IterableChangeRecord<V>) => void): void
  forEachAddedItem(fn: (record: IterableChangeRecord<V>) => void): void
  forEachMovedItem(fn: (record: IterableChangeRecord<V>) => void): void
  forEachRemovedItem(fn: (record: IterableChangeRecord<V>) => void): void
  forEachIdentityChange(fn: (record: IterableChangeRecord<V>) => void): void
}

export class GeogebraComponentSettings {
  static defaults = {
    width: 500,
    height: 500
  };

  static GRID_ONLY_NO_CONTROLS_WITH_LABEL_DRAG(
    customAxesSettings?: CustomAxesSettings,
    isInverted: boolean = true,
    width?: number,
    height?: number
  ): GeogebraComponentSettings {
    return new GeogebraComponentSettings(
      width || GeogebraComponentSettings.defaults.width,
      height || GeogebraComponentSettings.defaults.height,
      customAxesSettings
    ).setProps({
      perspective: "G",
      showToolBar: false,
      showMenuBar: false,
      enableLabelDrags: true,
      showToolBarHelp: false,
      enableRightClick: false
    })
  }

  props: GGB.AppletProperties = {};

  constructor(public width?: number, public height?: number, public customAxesSettings?: CustomAxesSettings, public isInverted: boolean = true) {
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
export class GeogebraComponent implements OnInit, AfterViewInit, DoCheck {

  @Input() objects: GeogebraObject[];
  @Input() settings?: GeogebraComponentSettings;

  editorId: string;
  private editor?: GGB.Applet;
  private api?: GGB.API;

  iterableDiffer: IterableDiffer;

  constructor(iterableDiffers: IterableDiffers) {
    this.editorId = `geogebra-component-identifier-${Math.random().toString(36).substring(7)}`;
    this.iterableDiffer = iterableDiffers.find([]).create(null);
  }

  ngOnInit() {
    this.prepare()
  }

  ngAfterViewInit(): void {
    this.editor.inject(this.editorId);
  }

  ngDoCheck() {
    let changes: IterableChanges<GeogebraObject> = this.iterableDiffer.diff(this.objects);
    if (changes && this.api) {
      console.log("Changes: ", changes);
      changes.forEachAddedItem(record => {
        this.render(this.api, record.item)
      });
      changes.forEachRemovedItem(record => {
        this.deleteObject(this.api, record.item)
      })
      // changes.
      // this.api.newConstruction();
      // this.render(this.api);
    }
  }

  private prepare(): void {
    this.iterableDiffer = this.iterableDiffer.diff(this.objects);
    if (!this.settings) {
      this.settings = new GeogebraComponentSettings();
    }
    if (!this.objects) {
      this.objects = []
    }
    const properties = {
      "appName": "classic",
      "width": this.settings.width,
      "height": this.settings.height,
      "showToolBar":true,
      "borderColor":null,
      "showMenuBar":true,
      "allowStyleBar":false,
      "showAlgebraInput":true,
      "enableLabelDrags":true,
      "enableShiftDragZoom":true,
      "enableRightClick":true,
      "showToolBarHelp":true,
      "errorDialogsActive":true,
      "showTutorialLink":true,
      "showLogging":true,
      "useBrowserForJS":false,
      "language": "Ukrainian",
      "country": "UA",
      "appletOnLoad": (api: GGB.API) => {
        api.setGridVisible(true);
        this.api = api;
        this.render(api);
      }
    } as GGB.AppletProperties;
    Object.keys(this.settings.props).forEach(k => {
      properties[k] = this.settings.props[k];
    });
    this.editor = new GGBApplet(properties) as GGB.Applet;
  }

  private render(api: GGB.API, object?: GeogebraObject): void {
    const toRender = object ? [object] : this.objects;
    console.log("Rendering ", toRender);
    toRender.forEach(obj => {
      this.addObject(api, obj);
    });
    this.prepareView(api)
  }

  private addObject(api: GGB.API, object: GeogebraObject): void {
    try {
      const commands = object.getCommands();
      api.evalCommand(commands.join("\n"));
    } catch (e) {
      console.error(`Failed to add geogebra object: ${object}`, e)
    }
  }

  private deleteObject(api: GGB.API, object: GeogebraObject): void {
    api.evalCommand(object.getDeleteCommands().join("\n"));
  }

  private prepareView(api: GGB.API) {
    const maxCoords = this.objects.map(o => o.maxCoord());
    const maxXY = maxCoords.reduce((c, p) => ({ x: Math.max(c.x, p.x), y: Math.max(c.y, p.y) }));
    const minCoords = this.objects.map(o => o.minCoord());
    const minXY = minCoords.reduce((c, p) => ({ x: Math.min(c.x, p.x), y: Math.min(c.y, p.y) }));
    let min = Math.min(minXY.x, minXY.y);
    let max = Math.max(maxXY.x, maxXY.y);
    const avg = Math.abs(min + max) / 2;
    min = Math.floor(min - 1);
    max = Math.ceil(max + 1);
    console.log(`Zoom (${minXY.x},${minXY.y},${maxXY.x},${maxXY.y}) (${min},${min},${max},${max})`);
    api.evalCommand(`ZoomIn(${min},${min},${max},${max})`);
    const axesSize = Math.max(Math.abs(min), Math.abs(max));
    this.renderCustomAxesIfDefined(api, axesSize, axesSize);
  }

  private renderCustomAxesIfDefined(api: GGB.API, xSize: number, ySize: number) {
    if (this.settings.customAxesSettings) {
      api.setAxesVisible(false, false);
      const ca = new CustomAxesGGO(
        100500,
        "RootAxes",
        XY(0, 0),
        xSize*0.95,
        ySize*0.95,
        {
          xAxisName: this.settings.customAxesSettings.xAxisName,
          yAxisName: this.settings.customAxesSettings.yAxisName
        },
        { rootPoint: { isLabelVisible: true, labelMode: LabelMode.Caption, caption: "O"} },
        undefined,
        undefined,
        true
      );
      this.addObject(api, this.settings.isInverted ? ca.invert() : ca);
    }
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
