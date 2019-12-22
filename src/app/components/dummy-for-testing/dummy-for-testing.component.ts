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

@Component({
  selector: 'dummy-for-testing',
  templateUrl: './dummy-for-testing.component.html',
  styleUrls: ['./dummy-for-testing.component.css']
})
export class DummyForTestingComponent implements OnInit {

  demoObjects: GeogebraObject[];
  demoSettings: GeogebraComponentSettings = new GeogebraComponentSettings(800, 800).setProps({
    "perspective": "G",
    "customToolbar": "0|41|42",
    "showMenuBar": false,
    "enableLabelDrags": false,
    "showToolBarHelp": false
  });

  demoObjects2: GeogebraObject[];
  demoSettings2: GeogebraComponentSettings = new GeogebraComponentSettings(800, 800).setProps({
    "perspective": "G",
    "customToolbar": "0|41|42",
    "showMenuBar": false,
    "enableLabelDrags": false,
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

  constructor() {
    this.makeDemoObjects();

    const shveller = new ShvellerGGO(`Швеллер`, XY(-50, -5), 5, { isLabelVisible: true, caption: "Швеллер (n=5)"}).rotate(new Angle(180));
    const kutyk = new KutykGGO(
      `Кутик`,
      //TODO: hack how to bind objects
      shveller.getPointCoords("B1"),
      35,
      5,
      { isLabelVisible: true, caption: "Кутик (b=35, t=5)" }
    );
    const C = XY(kutyk.root.x, kutyk.root.y + 20);
    this.demoObjects2 = [
      shveller,
      kutyk,
      new CustomAxesGGO("CustomAxis", C, 50).rotate(new Angle(45)),
      new EllipseGGO("Ellipse1", C, XY(40, 0), XY(20, -20)).rotate(new Angle(-45)),
    ];

    this.playgroundObjects = [
      // new DvotavrGGO(`Двотавр`, XY(-50, -5), 10, false)
      new PointGGO(`TestPoint`, XY(-5.555, 5.5555555), {
        isVisible: true,
        isLabelVisible: true,
        labelMode: GGB.LabelMode.NameValue
      }),
      kutyk
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
        (coords: XYCoords, angle: number) => new KutykGGO(`Кутик${angle}`, coords, 100, 10, { isLabelVisible: angle === 0, caption: (angle === 0 ? "Кутик (b=100, t=10)" : null) }).rotate(new Angle(angle))
      ),
      ...make(
        XY(110, 120),
        (coords: XYCoords, angle: number) => new PlateGGO(`Пластина${angle}`, coords, 20, 100, { isLabelVisible: angle === 0, caption: (angle === 0 ? "Пластина (b=20, h=100)" : null)}).rotate(new Angle(angle))
      ),
      ...make(
        XY(110, -120),
        (coords: XYCoords, angle: number) => new ShvellerGGO(`Швеллер${angle}`, coords, 10, { isLabelVisible: angle === 0, caption: (angle === 0 ? "Швеллер (n=10)" : null) }).rotate(new Angle(angle))
      ),
      ...make(
        XY(-110, -120),
        (coords: XYCoords, angle: number) => new DvotavrGGO(`Двотавр${angle}`, coords, 10, { isLabelVisible: angle === 0, caption: (angle === 0 ? "Двотавр (n=10)" : null) }).rotate(new Angle(angle))
      )
    ];
  }

}
