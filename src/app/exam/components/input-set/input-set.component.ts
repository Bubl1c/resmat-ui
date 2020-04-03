import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MathSymbolConverter } from "../../../utils/MathSymbolConverter";
import { GeogebraObject, GeogebraObjectSettings } from "../../../components/geogebra/custom-objects/geogebra-object";
import { KutykGGO } from "../../../components/geogebra/custom-objects/polygon/kutyk.polygon-ggo";
import { Angle, XYCoords } from "../../../utils/geometryUtils";
import { ShvellerGGO } from "../../../components/geogebra/custom-objects/polygon/shveller.polygon-ggo";
import { DvotavrGGO } from "../../../components/geogebra/custom-objects/polygon/dvotavr.polygon-ggo";
import { PlateGGO } from "../../../components/geogebra/custom-objects/polygon/plate.polygon-ggo";
import { GeogebraComponentSettings } from "../../../components/geogebra/geogebra.component";
import { GGB } from "../../../components/geogebra/geogebra-definitions";
import { CustomAxesGGO } from "../../../components/geogebra/custom-objects/custom-axes-ggo";
import LabelMode = GGB.LabelMode;
import { GeogebraObjectUtils } from "../../../components/geogebra/custom-objects/geogebra-object-utils";
import {
  GeometryShapeInGroupSettingsJson,
  GeometryShapeJson,
  GeometryShapeUtils
} from "../../../components/geogebra/custom-objects/geometry-shape";
import { EllipseGGO } from "../../../components/geogebra/custom-objects/ellipse-ggo";
import { GeogebraObjectGroup } from "../../../components/geogebra/custom-objects/object-group-ggo";

export const enum InputSetStatus {
  Initial = 0,  //Not submitted yet
  Verifying = 2, //Submitted, waiting for result
  Incorrect = -1,
  Correct = 1
}

export type ResmatImageType = "img-url" | "geogebra";
export const ResmatImageTypes = {
  ImageUrl: "img-url",
  Geogebra: "geogebra"
};

export class InputSetGroup {
  constructor(
    public id: number,
    public name: string,
    public imageType: ResmatImageType,
    public image: string,
    public groupGraphSettings?: GeometryShapeInGroupSettingsJson,
    public groupShapeGraphSettings?: GeometryShapeInGroupSettingsJson) {
  }
}

export class InputSetData {
  status: number = InputSetStatus.Initial;
  constructor(public id: number,
              public sequence: number,
              public description: string,
              public variables: InputVariable[],
              public groups: InputSetGroup[]) {}
}

export class VarirableAnswer {
  correct: boolean;
  constructor(public id: number, public value: number | null, public label?: string) {
    this.label = this.label || undefined;
  }

  static roundToFixed(value: number, accuracy: number): string {
    return typeof value === 'undefined' ? '0' : value.toFixed(accuracy);
  }
}

export class InputSetAnswer {
  allCorrect: boolean;
  constructor(public inputSetId: number, public inputAnswers: VarirableAnswer[]) {}

  find(variableId: number): VarirableAnswer | null {
    let variable = this.inputAnswers.find(va => va.id === variableId);
    return variable ? variable : null
  }
}

export class InputVariable {
  public value: number;
  public correct: boolean;

  constructor(public id: number,
              public name: string,
              public groupName: string = '',
              public units: string = '',
              public description: string = '',
              public required: boolean = false,
              //Result input width = 100 * inputWidthRate px. See the template
              public inputWidthRate: number = 1,
              value?: number) {
    this.name = MathSymbolConverter.convertString(name);
    if(typeof value !== 'undefined') {
      this.value = value
    }
  }
}

export class VariableGroup {
  public geogebraObjects: GeogebraObject[];
  public geogebraSettings: GeogebraComponentSettings;
  constructor(public name: string,
              public variables: InputVariable[],
              public imageType: ResmatImageType,
              public image: string,
              public groupGraphSettings?: GeometryShapeInGroupSettingsJson,
              public groupShapeGraphSettings?: GeometryShapeInGroupSettingsJson) {
    if (imageType === ResmatImageTypes.Geogebra) {
      const json = JSON.parse(image) as GeometryShapeJson[];
      const objects: GeogebraObject[] = json.map(j => GeometryShapeUtils.parseGeometryShape(j));
      this.geogebraSettings = GeogebraComponentSettings.GRID_ONLY_NO_CONTROLS_WITH_LABEL_DRAG(
        groupGraphSettings && groupGraphSettings.customAxesSettings,
        groupGraphSettings && groupGraphSettings.isInverted,
        400,
        400
      );
      let customAxes: CustomAxesGGO[] = [];
      if (groupShapeGraphSettings && groupShapeGraphSettings.customAxesSettings) {
        const cas = groupShapeGraphSettings.customAxesSettings;
        customAxes = objects.map(o => {
          const oDim = o.getDimensions();
          const oCenter = XYCoords.fromJson(o.getCenterCoords());
          const ca = new CustomAxesGGO(
            GeogebraObjectUtils.nextId(),
            "CustomAxes" + o.id,
            oCenter,
            oDim.width,
            oDim.height,
            {
              xAxisName: `${cas.xAxisName}${o.id}`,
              yAxisName: `${cas.yAxisName}${o.id}`
            }
          );
          return groupShapeGraphSettings.isInverted ? ca.rotate(new Angle(180)) : ca
        })
      }
      this.geogebraObjects = [
        ...objects,
        ...customAxes
      ]
    }
  }
}

@Component({
  selector: 'input-set',
  templateUrl: './input-set.component.html',
  styleUrls: ['./input-set.component.css']
})
export class InputSetComponent implements OnInit {

  @Input() description: string;
  @Input() data: InputSetData;

  @Input() hideHeader: boolean;
  @Input() readonly: boolean = false;

  groups: VariableGroup[];

  @Output() onSubmitted: EventEmitter<InputSetAnswer>;
  @Output() onContinue: EventEmitter<any>;

  constructor() {
    this.groups = [];
    this.onSubmitted = new EventEmitter<InputSetAnswer>();
    this.onContinue = new EventEmitter<number>();
  }

  ngOnInit() {
    this.groupVariables()
  }

  isVerified(): boolean {
    return this.data.status === InputSetStatus.Incorrect || this.data.status === InputSetStatus.Correct
  }

  submit() {
    if(this.readonly) {
      return;
    }
    this.data.status = InputSetStatus.Verifying;

    console.log("Submitting: ", this.groups, this.data.variables);

    this.onSubmitted.emit(
      new InputSetAnswer(
        this.data.id,
        this.data.variables.map(v => new VarirableAnswer(v.id, this.numberOrNull(v.value)))
      )
    )
  }

  nextAssignment() {
    if(this.readonly) {
      return;
    }
    this.onContinue.emit();
  }



  private numberOrNull(num: number): number | null {
    return typeof num === 'number' ? num : null;
  }

  private groupVariables() {
    let varGroups: { [key:string]:InputVariable[] } = {};

    this.data.variables.forEach(variable => {
      let groupVariables: InputVariable[] = varGroups[variable.groupName];
      if(groupVariables) {
        groupVariables.push(variable)
      } else {
        varGroups[variable.groupName] = [variable]
      }
    });

    for(let groupName in varGroups) {
      const group = this.data.groups.find(g => g.name === groupName);
      const imageType = group ? group.imageType : ResmatImageTypes.ImageUrl;
      const image = group ? group.image : "";
      this.groups.push(new VariableGroup(
        groupName,
        varGroups[groupName],
        imageType as ResmatImageType,
        image,
        group && group.groupGraphSettings,
        group && group.groupShapeGraphSettings)
      )
    }
  }

}
