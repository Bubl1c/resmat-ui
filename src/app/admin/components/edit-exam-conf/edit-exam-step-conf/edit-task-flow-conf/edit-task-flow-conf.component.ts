import { Component, Input, OnInit } from '@angular/core';
import { ITaskFlowConfDto } from "../../../../../exam/data/task-flow.api-protocol";
import { TaskFlowConfStepWorkspace } from "../../edit-exam-conf.component";

@Component({
  selector: 'edit-task-flow-conf',
  templateUrl: './edit-task-flow-conf.component.html',
  styleUrls: ['./edit-task-flow-conf.component.css']
})
export class EditTaskFlowConfComponent implements OnInit {

  @Input() workspace: TaskFlowConfStepWorkspace;

  constructor() { }

  ngOnInit() {
  }

}
