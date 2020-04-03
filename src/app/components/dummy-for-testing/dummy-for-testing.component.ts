import { Component, OnInit } from '@angular/core';
import { Angle, CoordsUtils, XYCoords } from "../../utils/geometryUtils";
import { GeogebraComponentSettings } from "../geogebra/geogebra.component";
import XY = CoordsUtils.XY;
import { GGB } from "../geogebra/geogebra-definitions";
import { GeogebraObject } from "../geogebra/custom-objects/geogebra-object";
import { ShvellerGGO } from "../geogebra/custom-objects/polygon/shveller.polygon-ggo";
import { KutykGGO } from "../geogebra/custom-objects/polygon/kutyk.polygon-ggo";
import { CustomAxesGGO } from "../geogebra/custom-objects/custom-axes-ggo";
import { EllipseGGO } from "../geogebra/custom-objects/ellipse-ggo";
import { PointGGO } from "../geogebra/custom-objects/point-ggo";
import { PlateGGO } from "../geogebra/custom-objects/polygon/plate.polygon-ggo";
import { DvotavrGGO } from "../geogebra/custom-objects/polygon/dvotavr.polygon-ggo";
import { Headers, Http, RequestOptions, RequestOptionsArgs, Response } from "@angular/http";
import { HttpUtils } from "../../utils/HttpUtils";
import { CurrentSession } from "../../current-session";
import { Router } from "@angular/router";
import { SizeGGO } from "../geogebra/custom-objects/size-ggo";
import { TextGGO } from "../geogebra/custom-objects/text-ggo";

@Component({
  selector: 'dummy-for-testing',
  templateUrl: './dummy-for-testing.component.html',
  styleUrls: ['./dummy-for-testing.component.css']
})
export class DummyForTestingComponent implements OnInit {

  demoObjectsTesting: {[key:string]: GeogebraObject[]} = {};

  demoObjects: GeogebraObject[];
  demoSettings: GeogebraComponentSettings = new GeogebraComponentSettings(800, 800).setProps({
    "perspective": "G",
    "customToolbar": "0|41|42",
    "showMenuBar": false,
    "enableLabelDrags": true,
    "showToolBarHelp": false
  });

  playgroundObjects: GeogebraObject[];
  playgroundSettings: GeogebraComponentSettings = new GeogebraComponentSettings(800, 800).setProps({
    "perspective": "G",
    showToolBar: false,
    "showMenuBar": false,
    "enableLabelDrags": true,
    "showToolBarHelp": false,
    language: "English",
    rounding: "5"
  });

  constructor(private http: Http) {
    this.makeDemoObjects();

    this.demoObjectsTesting["test1"] = [
      new PlateGGO(1, "Plate", XY(5, 2), 2, 6).rotate(new Angle(180), XY(5, 2)),
      new PlateGGO(2, "Plate2", XY(3, 2), 3, 2).rotate(new Angle(180), XY(3, 2)),
      // new PlateGGO(1, "Plate", XY(5, 5), 20, 10, undefined),
      // new PlateGGO(2, "Plate", XY(5, -5), 20, 10).rotate(new Angle(90)),
      // new PlateGGO(3, "Plate", XY(-5, -5), 20, 10).rotate(new Angle(180)),
      // new PlateGGO(4, "Plate", XY(-5, 5), 20, 10, undefined, {
      //   b: "down",
      //   h: "left"
      // }).rotate(new Angle(270))
    ];

    this.demoObjectsTesting["test2"] = [
      new ShvellerGGO(1,`Двотавр`, XY(5, 5), 10, undefined, {
        b: "up",
        h: "right",
        d: "up",
        t: "up",
      }),
      new ShvellerGGO(2,`Двотавр`, XY(-80, -120), 10, undefined, {
        b: "down",
        h: "left",
        d: "down",
        t: "down",
      }),
      new ShvellerGGO(3,`Двотавр`, XY(-20, 5), 10, undefined, {
        b: "up",
        h: "right",
        d: "up",
        t: "up",
      }).rotate(new Angle(-90)),
      new ShvellerGGO(4,`Двотавр`, XY(80, -20), 10, undefined, {
        b: "up",
        h: "right",
        d: "down",
        t: "down",
      }).rotate(new Angle(180)),
    ];

    this.demoObjectsTesting["test3"] = [
      new DvotavrGGO(1,`Двотавр`, XY(5, 5), 10, undefined, {
        b: "up",
        h: "right",
        s: "up",
        t: "right",
      }),
      new DvotavrGGO(2,`Двотавр`, XY(-80, -120), 10, undefined, {
        b: "down",
        h: "left",
        s: "down",
        t: "left",
      }),
      new DvotavrGGO(3,`Двотавр`, XY(-20, 5), 10, undefined, {
        b: "up",
        h: "right",
        s: "up",
        t: "right",
      }).rotate(new Angle(-90)),
      new DvotavrGGO(4,`Двотавр`, XY(80, -20), 10, undefined, {
        b: "up",
        h: "right",
        s: "up",
        t: "right",
      }).rotate(new Angle(180)),
    ];

    this.demoObjectsTesting["test4"] = [
      new KutykGGO(1, "Kutyk", XY(5, 5), 20, 3, undefined, {
        z0: "right"
      }),
      new KutykGGO(2, "Kutyk", XY(5, -5), 20, 3).rotate(new Angle(90)),
      new KutykGGO(3, "Kutyk", XY(-5, -5), 20, 3).rotate(new Angle(180)),
      new KutykGGO(4, "Kutyk", XY(-5, 5), 20, 3).rotate(new Angle(270))
    ];

    const shveller = new ShvellerGGO(1, `Швеллер`, XY(-50, -5), 5, { shapeSizeToCalculateSizeDepth: 50 }).rotate(new Angle(180));
    const kutyk = new KutykGGO(
      2,
      `Кутик`,
      //TODO: hack how to bind objects
      shveller.getPointCoords("B1"),
      3.5,
      0.5,
      { shapeSizeToCalculateSizeDepth: 50 }
    );
    const C = XY(kutyk.root.x, kutyk.root.y + 20);
    const size = [shveller.getDimensions(), kutyk.getDimensions()].reduce((s, k) => ({ width: s.width + k.width, height: s.height + k.height }));
    const maxSize = Math.max(size.width, size.height);
    this.demoObjectsTesting["test5"] = [
      shveller,
      kutyk,
      new CustomAxesGGO(3, "CustomAxis", C, maxSize, maxSize, { xAxisName: "U", yAxisName: "V" }).rotate(new Angle(45)),
      new EllipseGGO(4, "Ellipse1", C, 40, 20, { lineThickness: 2 }).rotate(new Angle(-45))
    ];

    this.playgroundObjects = [
      // new DvotavrGGO(1,`Двотавр`, XY(5, 5), 10, undefined, {
      //   b: "up",
      //   h: "right",
      //   s: "up",
      //   t: "right",
      // }),
      // new DvotavrGGO(2,`Двотавр`, XY(-80, -120), 10, undefined, {
      //   b: "down",
      //   h: "left",
      //   s: "down",
      //   t: "left",
      // }),
      // new DvotavrGGO(3,`Двотавр`, XY(-20, 5), 10, undefined, {
      //   b: "up",
      //   h: "right",
      //   s: "up",
      //   t: "right",
      // }).rotate(new Angle(-90)),
      // new DvotavrGGO(4,`Двотавр`, XY(80, -20), 10, undefined, {
      //   b: "up",
      //   h: "right",
      //   s: "up",
      //   t: "right",
      // }).rotate(new Angle(180)),
      new ShvellerGGO(1,`Двотавр`, XY(5, 5), 10, undefined, {
        b: "up",
        h: "right",
        d: "up",
        t: "up",
      }),
      new ShvellerGGO(2,`Двотавр`, XY(-80, -120), 10, undefined, {
        b: "down",
        h: "left",
        d: "down",
        t: "down",
      }),
      new ShvellerGGO(3,`Двотавр`, XY(-20, 5), 10, undefined, {
        b: "up",
        h: "right",
        d: "up",
        t: "up",
      }).rotate(new Angle(-90)),
      new ShvellerGGO(4,`Двотавр`, XY(80, -20), 10, undefined, {
        b: "up",
        h: "right",
        d: "down",
        t: "down",
      }).rotate(new Angle(180)),
      // new PointGGO(2, `TestPoint`, XY(-5.555, 5.5555555), {
      //   isVisible: true,
      //   isLabelVisible: true,
      //   labelMode: GGB.LabelMode.NameValue
      // }),
      // new SizeGGO('Sizes', XY(1, 1), XY(5, 1), "up", "5", 5),
      // new SizeGGO('Sizes', XY(1, -1), XY(5, -1), "down", "100", 5),
      // new SizeGGO('Sizes', XY(-1, -1), XY(-1, -5), "left", "5", 5),
      // new SizeGGO('Sizes', XY(-4, 1), XY(-4, 10), "right", "5", 5)
      // kutyk
    ]
  }

  ngOnInit() {
  }

  newGGBObject(object: GeogebraObject): void {
    console.log("New ggb object", object);
    if (this.playgroundObjects.find(po => po.name === object.name)) {
      alert("Об'єкт з таким іменем вже існує");
      return;
    }
    this.playgroundObjects.push(object)
  }

  removeGGBObject(index: number): void {
    console.log("Remove ggb object", index);
    this.playgroundObjects.splice(index, 1)
  }

  private makeDemoObjects() {
    const make = (root: XYCoords, func: (coords: XYCoords, angle: number) => GeogebraObject): GeogebraObject[] => {
      const n = 6;
      const change = [
        { angle: 0, x: n, y: n*2},
        { angle: 90, x: n/3, y: -n/3},
        { angle: 180, x: -n, y: -n*2},
        { angle: 270, x: -n/3, y: n/3}
      ];
      return change.map(ch => func(XY(root.x + ch.x, root.y + ch.y), ch.angle))
    };
    this.demoObjects = [
      ...make(
        XY(-110, 120),
        (coords: XYCoords, angle: number) => new KutykGGO(1, `Кутик${angle}`, coords, 10, 1, { isLabelVisible: angle === 0, caption: (angle === 0 ? "Кутик (b=100, t=10)" : null) }).rotate(new Angle(angle))
      ),
      ...make(
        XY(110, 120),
        (coords: XYCoords, angle: number) => new PlateGGO(2, `Пластина${angle}`, coords, 2, 10, { isLabelVisible: angle === 0, caption: (angle === 0 ? "Пластина (b=20, h=100)" : null)}).rotate(new Angle(angle))
      ),
      ...make(
        XY(110, -120),
        (coords: XYCoords, angle: number) => new ShvellerGGO(3, `Швеллер${angle}`, coords, 10, { isLabelVisible: angle === 0, caption: (angle === 0 ? "Швеллер (n=10)" : null) }).rotate(new Angle(angle))
      ),
      ...make(
        XY(-110, -120),
        (coords: XYCoords, angle: number) => new DvotavrGGO(4, `Двотавр${angle}`, coords, 10, { isLabelVisible: angle === 0, caption: (angle === 0 ? "Двотавр (n=10)" : null) }).rotate(new Angle(angle))
      )
    ];
  }

}
