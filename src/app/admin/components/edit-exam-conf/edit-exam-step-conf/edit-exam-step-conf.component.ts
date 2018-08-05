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

  @Output() onSequenceChanged = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {
  }

  sequenceChanged(newValue: DropdownOption) {
    this.onSequenceChanged.emit(newValue.id);
  }

}
