import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DropdownOption } from "../dropdown/dropdown.component";
import { Angle, CoordsUtils } from "../../utils/geometryUtils";
import XY = CoordsUtils.XY;
import {
  GeogebraObject,
  GeogebraObjectSettings,
  GGOKind,
  GGOKindType
} from "../geogebra/custom-objects/geogebra-object";
import { KutykGGO } from "../geogebra/custom-objects/polygon/kutyk.polygon-ggo";
import { PlateGGO } from "../geogebra/custom-objects/polygon/plate.polygon-ggo";
import { ShvellerGGO } from "../geogebra/custom-objects/polygon/shveller.polygon-ggo";
import { DvotavrGGO } from "../geogebra/custom-objects/polygon/dvotavr.polygon-ggo";
import { GeogebraObjectUtils } from "../geogebra/custom-objects/geogebra-object-utils";

@Component({
  selector: 'geogebra-create-object',
  templateUrl: './geogebra-create-object.component.html',
  styleUrls: ['./geogebra-create-object.component.css']
})
export class GeogebraCreateObjectComponent implements OnInit {

  @Output() onSaved = new EventEmitter<GeogebraObject>();

  object: GeogebraObject;

  kinds: DropdownOption[] = [GGOKind.kutyk, GGOKind.plate, GGOKind.shveller, GGOKind.dvotavr].map(ut => new DropdownOption(ut.id, ut.name));

  angles: DropdownOption[] = [0, 90, 180, 270].map(angle => new DropdownOption(angle, `На ${angle} градусів`));

  // objectPropDefs = new Map<GGOKindType, Array<[string, string, number]>>([
  //   ["kutyk", GGOKind.kutyk.requiredFieldDefs],
  //   ["plate", GGOKind.plate.requiredFieldDefs],
  //   ["shveller", GGOKind.shveller.requiredFieldDefs],
  //   ["dvotavr", GGOKind.dvotavr.requiredFieldDefs]
  // ]);

  objectProps: Array<{prop: string, val: number}>;
  objectAngle: number = 0;

  // kindProps = {
  //   `${GGOKind.all}`: {}
  // };
  //
  constructor() {
    this.reset("kutyk")
  }

  reset(kind: GGOKindType) {
    const id = GeogebraObjectUtils.nextId();
    this.objectAngle = 0;
    const ds: GeogebraObjectSettings = {
      isLabelVisible: true
    };
    const prop = (prop: string, val: number) => {return {prop: prop, val: val}};
    switch (kind) {
      case "kutyk":
        const kutyk = new KutykGGO(id,"Кутик1", XY(0, 0), 20, 3, ds);
        this.objectProps = [
          prop("b", kutyk.b),
          prop("t", kutyk.t)
        ];
        this.object = kutyk;
        break;
      case "plate":
        const plate = new PlateGGO(id, "Пластина1", XY(0, 0), 20, 5, ds);
        this.objectProps = [
          prop("b", plate.b),
          prop("h", plate.h)
        ];
        this.object = plate;
        break;
      case "shveller":
        const shveller = new ShvellerGGO(id, "Швеллер1", XY(0, 0), 5, ds);
        this.objectProps = [
          prop("n", shveller.n)
        ];
        this.object = shveller;
        break;
      case "dvotavr":
        const dvotavr = new DvotavrGGO(id, "Двотавр1", XY(0, 0), 10, ds);
        this.objectProps = [
          prop("n", dvotavr.n)
        ];
        this.object = dvotavr;
        break;
      default:
        throw new Error("Unhandled object kind " + this.object.kind)
    }
  }

  ngOnInit() {
  }

  kindChanged(option: DropdownOption) {
    this.object.kind = GGOKind.withId(option.id).id;
    this.reset(this.object.kind)
  }

  angleChanged(option: DropdownOption) {
    this.objectAngle = option.id
  }

  save() {
    try {
      this.objectProps.forEach(prop => {
        this.object[prop.prop] = prop.val
      });
      this.onSaved.emit(this.object.copy().rotate(new Angle(this.objectAngle), this.object.root));
      // this.reset(this.object.kind)
    } catch (e) {
      alert(e.message);
      console.error(e)
    }
  }

}
