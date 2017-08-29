import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {ITestWithCorrectDto, TestTypes} from "../../../exam/data/test-set.api-protocol";
import {DropdownOption} from "../../../components/dropdown/dropdown.component";

@Component({
  selector: 'edit-test-conf',
  templateUrl: './edit-test-conf.component.html',
  styleUrls: ['./edit-test-conf.component.css']
})
export class EditTestConfComponent implements OnInit {

  @Input() testToUpdate: ITestWithCorrectDto;
  @Output() onSave = new EventEmitter<ITestWithCorrectDto>();

  updated: ITestWithCorrectDto;

  testTypes: DropdownOption[] = [
    new DropdownOption(TestTypes.Radio, "Можна вибрати лише 1 варіант відповіді"),
    new DropdownOption(TestTypes.Checkbox, "Можна вибрати 1 і більше варіантів відповіді"),
  ];
  testTypeSelectedDropdownOption: DropdownOption;

  isSaving = false;

  constructor() { }

  ngOnInit() {
    this.updated = Object.assign({}, this.testToUpdate) as ITestWithCorrectDto;
    this.testTypeSelectedDropdownOption = this.testTypes.find(o => o.id === this.updated.testType)
  }

  save() {
    this.onSave.emit(this.updated)
  }

  testTypeSelected(testTypeDropdownOption: DropdownOption) {
    this.testTypeSelectedDropdownOption = testTypeDropdownOption;
    this.updated.testType = testTypeDropdownOption.id;
  }

}
