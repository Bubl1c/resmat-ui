import { Component, OnInit, Input } from "@angular/core";
import { MathSymbolConverter } from "../../../utils/MathSymbolConverter";
import { ISchemaVar } from "../../data/task-flow.api-protocol";
import { GeogebraObject } from "../../../components/geogebra/custom-objects/geogebra-object";
import { GeometryShapeJson, GeometryShapeUtils } from "../../../components/geogebra/custom-objects/geometry-shape";
import { ProblemConf, ProblemVariantSchemaType } from "../../../steps/exam.task-flow-step";
import { GeogebraComponentSettings } from "../../../components/geogebra/geogebra.component";

export interface TaskVariantData {
  id: number;
  name: string;
  schemaType: ProblemVariantSchemaType;
  schemaUrl: string;
  schemaVars: ISchemaVar[];
  description: string;
  problemConf: ProblemConf
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

  @Input() task: TaskVariantData;
  @Input() hideControls: boolean = false;

  isCollapsed: boolean;

  geogebraObjects: GeogebraObject[];
  geogebraSettings: GeogebraComponentSettings;

  schemaVarGroups: SchemaVarGroup[];

  constructor() {
    this.errorMessage = '';
  }

  ngOnInit() {
    this.geogebraSettings = GeogebraComponentSettings.GRID_ONLY_NO_CONTROLS_WITH_LABEL_DRAG(this.task.problemConf.props.customAxesSettings);

    this.task.schemaVars.map(this.convertSymbols);
    this.task.schemaVars = this.task.schemaVars.filter(sv => sv.showInExam);

    this.pupulateSchemaVarGroups();

    switch(this.task.schemaType) {
      case "img-url":
        break;
      case "geogebra":
        const jsons = JSON.parse(this.task.schemaUrl) as GeometryShapeJson[];
        const objects = jsons.map(j => GeometryShapeUtils.parseGeometryShape(j));
        this.geogebraObjects = objects;
        break;
      default:
        throw new Error(`Unsupported schema type ${this.task.schemaType}`)
    }
  }

  private pupulateSchemaVarGroups() {
    const groups = new Map<string, ISchemaVar[]>();
    this.task.schemaVars.forEach(v => {
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
