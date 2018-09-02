import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DropdownOption } from "../../../../components/dropdown/dropdown.component";
import { ITestSetConfDto } from "../../../../exam/data/test-set.api-protocol";
import { IStepConfWorkspace } from "../edit-exam-conf.component";
import { IExamStepConf } from "../../../../exam/data/exam.api-protocol";

@Component({
  selector: 'edit-exam-step-conf',
  templateUrl: './edit-exam-step-conf.component.html',
  styleUrls: ['./edit-exam-step-conf.component.css']
})
export class EditExamStepConfComponent implements OnInit {

  @Input() workspace: IStepConfWorkspace;
  @Input() sequenceDropdownOptions: DropdownOption[];
  @Input() isReadonly: Boolean = false;

  @Output() onSequenceChanged = new EventEmitter<number>();
  @Output() onDeleted = new EventEmitter<void>();

  stepConf: IExamStepConf;

  constructor() {
  }

  ngOnInit() {
    this.stepConf = this.workspace.stepConf;
    this.loadData()
  }

  loadData() {
    this.workspace.loadData();
  }

  saveTestSetConf(testSetConf: ITestSetConfDto) {
    console.log("Saving test set conf", testSetConf)
  }

  sequenceChanged(newValue: DropdownOption) {
    this.onSequenceChanged.emit(newValue.id);
  }

  toggleHasToBeSubmitted() {
    this.workspace.stepConf.hasToBeSubmitted = !this.workspace.stepConf.hasToBeSubmitted;
  }

  delete() {
    this.onDeleted.emit()
  }

}
