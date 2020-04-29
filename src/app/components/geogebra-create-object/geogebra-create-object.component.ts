import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DropdownOption } from "../dropdown/dropdown.component";
import { Angle, CoordsUtils, XYCoords } from "../../utils/geometryUtils";
import XY = CoordsUtils.XY;
import {
  GeogebraObject, GeogebraObjectJson,
  GeogebraObjectSettings,
  GGOKind,
  GGOKindType
} from "../geogebra/custom-objects/geogebra-object";
import { KutykGGO } from "../geogebra/custom-objects/polygon/kutyk.polygon-ggo";
import { PlateGGO } from "../geogebra/custom-objects/polygon/plate.polygon-ggo";
import { ShvellerGGO } from "../geogebra/custom-objects/polygon/shveller.polygon-ggo";
import { DvotavrGGO } from "../geogebra/custom-objects/polygon/dvotavr.polygon-ggo";
import { GeogebraObjectUtils } from "../geogebra/custom-objects/geogebra-object-utils";
import { GeometryShapeJson, GeometryShapeUtils } from "../geogebra/custom-objects/geometry-shape";

@Component({
  selector: 'geogebra-create-object',
  templateUrl: './geogebra-create-object.component.html',
  styleUrls: ['./geogebra-create-object.component.css']
})
export class GeogebraCreateObjectComponent implements OnInit {

  @Output() onSaved = new EventEmitter<GeometryShapeJson>();

  availableGgoKinds: GGOKind[] = [GGOKind.kutyk, GGOKind.plate, GGOKind.shveller, GGOKind.dvotavr];

  shapeJson: GeometryShapeJson;
  shapeDimensions: Array<{prop: string, val: number, description: string}>;

  kinds: DropdownOption[];
  selectedKind: DropdownOption;

  angles: DropdownOption[];
  selectedAngle: DropdownOption;

  constructor() {
    this.kinds = [GGOKind.kutyk, GGOKind.plate, GGOKind.shveller, GGOKind.dvotavr].map(ut => new DropdownOption(ut.id, ut.name));
    this.selectedKind = this.kinds[0];

    this.angles = [0, 90, 180, 270].map(angle => new DropdownOption(angle, `На ${angle} градусів`));
    this.selectedAngle = this.angles[0];

    this.shapeDimensions = [];

    this.reset(this.availableGgoKinds[0])
  }

  reset(kind: GGOKind) {
    this.shapeDimensions.length = 0;
    kind.requiredFieldDefs.forEach(f => {
      const [fName, fDescription, fDefaultValue] = f;
      this.shapeDimensions.push({ prop: fName, val: fDefaultValue, description: fDescription })
    });
    this.shapeJson = {
      id: -1,
      name: "",
      rotationAngle: this.selectedAngle.id,
      shapeType: kind.shapeType,
      root: XY(0, 0),
      dimensions: {},
      sizeDirections: {},
      settings: {},
      props: {}
    };
  }

  ngOnInit() {
  }

  kindChanged(option: DropdownOption) {
    this.selectedKind = option;
    const kind = GGOKind.withId(option.id);
    this.shapeJson.shapeType = GGOKind.withId(option.id).shapeType;
    this.reset(kind)
  }

  angleChanged(option: DropdownOption) {
    this.selectedAngle = option;
    this.shapeJson.rotationAngle = option.id
  }

  save() {
    try {
      this.shapeJson.dimensions = this.shapeDimensions.reduce((acc, d) => {
        acc[d.prop] = d.val;
        return acc;
      }, {});
      this.shapeJson.rotationPoint = this.shapeJson.root;
      this.onSaved.emit(this.shapeJson);
      this.reset(GGOKind.withId(this.selectedKind.id))
    } catch (e) {
      alert(e.message);
      console.error(e)
    }
  }

}
