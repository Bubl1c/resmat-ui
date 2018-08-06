import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IExamStepConf } from "../../../../exam/data/exam.api-protocol";
import { DropdownOption } from "../../../../components/dropdown/dropdown.component";

@Component({
  selector: 'edit-exam-step-conf',
  templateUrl: './edit-exam-step-conf.component.html',
  styleUrls: ['./edit-exam-step-conf.component.css']
})
export class EditExamStepConfComponent implements OnInit {

  @Input() data: IExamStepConf;
  @Input() sequenceDropdownOptions: DropdownOption[];
  @Input() isReadonly: Boolean = false;

  @Output() onSequenceChanged = new EventEmitter<number>();
  @Output() onDeleted = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
  }

  sequenceChanged(newValue: DropdownOption) {
    this.onSequenceChanged.emit(newValue.id);
  }

  toggleHasToBeSubmitted() {
    this.data.hasToBeSubmitted = !this.data.hasToBeSubmitted;
  }

  delete() {
    this.onDeleted.emit()
  }

}
