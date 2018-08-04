import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IExamStepConf } from "../../../../exam/data/exam.api-protocol";

@Component({
  selector: 'edit-exam-step-conf',
  templateUrl: './edit-exam-step-conf.component.html',
  styleUrls: ['./edit-exam-step-conf.component.css']
})
export class EditExamStepConfComponent implements OnInit {

  @Input() data: IExamStepConf;

  constructor() { }

  ngOnInit() {
  }

}
