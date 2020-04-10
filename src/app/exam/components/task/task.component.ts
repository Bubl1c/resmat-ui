import { Component, OnInit, Input } from "@angular/core";
import { MathSymbolConverter } from "../../../utils/MathSymbolConverter";
import { ISchemaVar } from "../../data/task-flow.api-protocol";
import { GeogebraObject } from "../../../components/geogebra/custom-objects/geogebra-object";
import {
  CustomAxesSettings,
  GeometryShapeJson,
  GeometryShapeUtils
} from "../../../components/geogebra/custom-objects/geometry-shape";
import {
  GeometryShapesProblemInputConf,
  GeometryShapesProblemVariantInputData,
  InputVariableValuesProblemInputConf, InputVariableValuesProblemVariantInputData,
  ProblemConf, ProblemInputVariableConf, ProblemInputVariableValue,
  ProblemVariantConf
} from "../../../steps/exam.task-flow-step";
import { GeogebraComponentSettings } from "../../../components/geogebra/geogebra.component";

export interface TaskVariantData {
  id: number;
  name: string;
  description: string;
  problemConf: ProblemConf
  problemVariantConf: ProblemVariantConf
}

class SchemaVarGroup {
  constructor(public name: string, public schemaVars: ISchemaVar[]) {
  }
}

@Component({
  selector: 'task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
  errorMessage: string;

  @Input() problemConf: ProblemConf;
  @Input() problemVariantConf: ProblemVariantConf;
  @Input() hideControls: boolean = false;

  isCollapsed: boolean;

  schemaVars: ISchemaVar[];

  geogebraObjects: GeogebraObject[];
  geogebraSettings: GeogebraComponentSettings;

  schemaVarGroups: SchemaVarGroup[];

  constructor() {
    this.errorMessage = '';
  }

  ngOnInit() {

    switch(this.problemConf.problemType) {
      case "ring-plate":
        this.schemaVars = TaskDataUtils.mapVariables(
          this.problemConf.inputConf as InputVariableValuesProblemInputConf,
          this.problemVariantConf.inputData as InputVariableValuesProblemVariantInputData
        );
        break;
      case "cross-section":
        this.schemaVars = (this.problemVariantConf.inputData as GeometryShapesProblemVariantInputData)
          .GeometryShapesProblemVariantInputData.shapes.reduce((acc, s) => {
          Object.keys(s.dimensions).map(dimension => {
            acc.push({
              name: dimension,
              value: s.dimensions[dimension] + "",
              units: "см",
              alias: "",
              showInExam: true,
              variableGroup: s.name
            })
          });
          return acc;
        }, [] as ISchemaVar[]);
        break;
      default:
        throw new Error(`Unsupported problem type ${this.problemConf.problemType} in ProblemConf ${JSON.stringify(this.problemConf)}`)
    }
    this.schemaVars = this.schemaVars.filter(sv => sv.showInExam).map(this.convertSymbols);
    this.pupulateSchemaVarGroups();
    this.parseSchema();
  }

  private parseSchema(): void {
    switch(this.problemVariantConf.schemaType) {
      case "img-url":
        break;
      case "geogebra":
        const jsons = JSON.parse(this.problemVariantConf.schemaUrl) as GeometryShapeJson[];
        const objects = jsons.map(j => GeometryShapeUtils.parseGeometryShape(j));
        this.geogebraObjects = objects;
        let cas: CustomAxesSettings;
        if (this.problemConf.problemType === "cross-section") {
          cas = (this.problemConf.inputConf as GeometryShapesProblemInputConf).GeometryShapesProblemInputConf.customAxesSettings;
        }
        this.geogebraSettings = GeogebraComponentSettings.GRID_ONLY_NO_CONTROLS_WITH_LABEL_DRAG(cas);
        break;
      default:
        throw new Error(`Unsupported schema type ${this.problemVariantConf.schemaType}`)
    }
  }

  private pupulateSchemaVarGroups() {
    const groups = new Map<string, ISchemaVar[]>();
    this.schemaVars.forEach(v => {
      let existing = groups.get(v.variableGroup);
      if (!existing) {
        existing = [v];
      } else {
        existing.push(v)
      }
      groups.set(v.variableGroup, existing)
    });
    this.schemaVarGroups = [];
    groups.forEach((value, key) => {
      this.schemaVarGroups.push(new SchemaVarGroup(key, value))
    })
  }

  private convertSymbols(schemaVar: ISchemaVar): ISchemaVar {
    schemaVar.name = MathSymbolConverter.convertString(schemaVar.name);
    return schemaVar;
  }

  toggle() {
    this.isCollapsed = !this.isCollapsed;
  }

}

export namespace TaskDataUtils {
  export function mapVariables(
    inputConf: InputVariableValuesProblemInputConf,
    inputData: InputVariableValuesProblemVariantInputData
  ): ISchemaVar[] {
    return inputData.InputVariableValuesProblemVariantInputData.inputVariableValues.map(ivv =>
      mapVariable(ivv, inputConf.InputVariableValuesProblemInputConf.inputVariableConfs)
    )
  }

  function mapVariable(ivv: ProblemInputVariableValue, inputVariableConfs: ProblemInputVariableConf[]): ISchemaVar {
    let conf = inputVariableConfs.find(v => v.id === ivv.variableConfId);
    const shouldUseStrValueAsName = typeof ivv.value !== "undefined" && ivv.strValue;
    return {
      name: shouldUseStrValueAsName ? ivv.strValue : conf.name,
      value: ivv.value + "",
      units: ivv.unitsOverride || conf.units,
      alias: conf.alias,
      showInExam: conf.showInExam,
      variableGroup: ivv.variableGroup
    }
  }
}
