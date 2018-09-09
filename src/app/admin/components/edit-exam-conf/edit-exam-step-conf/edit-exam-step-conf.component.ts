import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DropdownOption } from "../../../../components/dropdown/dropdown.component";
import { ITestSetConfDto } from "../../../../exam/data/test-set.api-protocol";
import { IStepConfWorkspace } from "../edit-exam-conf.component";
import { ExamStepType, IExamStepConf } from "../../../../exam/data/exam.api-protocol";

@Component({
  selector: 'edit-exam-step-conf',
  templateUrl: './edit-exam-step-conf.component.html',
  styleUrls: ['./edit-exam-step-conf.component.css']
})
export class EditExamStepConfComponent implements OnInit, OnChanges {

  @Input() workspace: IStepConfWorkspace;
  @Input() sequenceDropdownOptions: DropdownOption[];
  @Input() isReadonly: Boolean = false;

  @Output() onSequenceChanged = new EventEmitter<number>();
  @Output() onDeleted = new EventEmitter<void>();

  stepConf: IExamStepConf;
  isTaskFlowStep: boolean;

  constructor() {
  }

  ngOnInit() {
    this.stepConf = this.workspace.stepConf;
    this.isTaskFlowStep = this.workspace.stepConf.stepType === ('task-flow' as ExamStepType)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workspace']) {
      this.ngOnInit()
    }
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
