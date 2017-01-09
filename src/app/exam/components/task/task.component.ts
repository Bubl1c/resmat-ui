import { Component, OnInit, Input } from '@angular/core';

export interface ISchemaVar {
  name: string;
  value: string;
  units: string;
}

export interface ITask {
  code: string;
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
  @Input()
  task: ITask;

  isCollapsed: boolean;

  constructor() {
    this.errorMessage = '';
  }

  ngOnInit() {
  }

  toggle() {
    this.isCollapsed = !this.isCollapsed;
  }

}
