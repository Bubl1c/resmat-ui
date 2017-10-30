import { Component, OnInit, Input } from "@angular/core";
import { MathSymbolConverter } from "../../../utils/MathSymbolConverter";
import { ISchemaVar } from "../../data/task-flow.api-protocol";

export interface TaskVariantData {
  name: string;
  schemaUrl: string;
  schemaVars: ISchemaVar[];
  description: string;
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

  constructor() {
    this.errorMessage = '';
  }

  ngOnInit() {
    this.task.schemaVars.map(this.convertSymbols);
    this.task.schemaVars = this.task.schemaVars.filter(sv => sv.showInExam)
  }

  private convertSymbols(schemaVar: ISchemaVar): ISchemaVar {
    schemaVar.name = MathSymbolConverter.convertString(schemaVar.name);
    return schemaVar;
  }

  toggle() {
    this.isCollapsed = !this.isCollapsed;
  }

}
