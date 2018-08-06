import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { IExamConfDto } from "../../../exam/data/exam.api-protocol";
import { defaultExamStepConfInstance, resultsExamStepConfInstance } from "./examConfConstants";

@Component({
  selector: 'edit-exam-conf',
  templateUrl: './edit-exam-conf.component.html',
  styleUrls: ['./edit-exam-conf.component.css']
})
export class EditExamConfComponent implements OnInit {
  @Input() data: IExamConfDto;
  @Input() isSaving: boolean = false;

  @Output() onSave = new EventEmitter<IExamConfDto>();

  isCreateMode: boolean

  constructor() { }

  ngOnInit() {
    if (!this.data.examConf.id) {
      this.isCreateMode = true;
      this.data.stepConfs = [
        defaultExamStepConfInstance(1),
        resultsExamStepConfInstance(2)
      ]
    }
  }

  save() {
    this.onSave.emit(this.data)
  }

}
