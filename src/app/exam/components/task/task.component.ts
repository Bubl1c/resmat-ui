import { Component, OnInit, Input } from "@angular/core";
import { MathSymbolConverter } from "../../../utils/MathSymbolConverter";
import { ISchemaVar } from "../../data/task-flow.api-protocol";
import { IExamTaskFlowTaskData } from "../../data/i-exam-task-flow-task-data";

@Component({
  selector: 'task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
  errorMessage: string;
  @Input()
  task: IExamTaskFlowTaskData;

  isCollapsed: boolean;

  constructor() {
    this.errorMessage = '';
  }

  ngOnInit() {
    this.task.schemaVars.map(this.convertSymbols)
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
