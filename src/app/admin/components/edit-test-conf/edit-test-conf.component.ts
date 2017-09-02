import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  ITestOptionDto, ITestWithCorrectDto, TestOptionValueType,
  TestType
} from "../../../exam/data/test-set.api-protocol";
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

  testType = TestType;
  dropdownTestTypes: DropdownOption[] = [
    new DropdownOption(TestType.Radio, "Можна вибрати лише 1 варіант відповіді"),
    new DropdownOption(TestType.Checkbox, "Можна вибрати 1 і більше варіантів відповіді"),
  ];
  testTypeSelectedDropdownOption: DropdownOption;

  optionValueType = TestOptionValueType;
  dropdownOptionValueTypes: DropdownOption[] = [
    new DropdownOption("words", "Текст", "<i class=\"material-icons\">text_fields</i>"),
    new DropdownOption("img", "Зображення", "<i class=\"material-icons\">photo</i>")
  ];

  uploadTempImgPath: string = "";

  isSaving = false;

  constructor() { }

  ngOnInit() {
    this.updated = Object.assign({}, this.testToUpdate) as ITestWithCorrectDto;
    this.testTypeSelectedDropdownOption = this.dropdownTestTypes.find(o => o.id === this.updated.testType)
  }

  save() {
    this.onSave.emit(this.updated)
  }

  testTypeSelected(testTypeDropdownOption: DropdownOption) {
    this.testTypeSelectedDropdownOption = testTypeDropdownOption;
    this.updated.testType = testTypeDropdownOption.id;
  }

  testImageUploaded(urlOrFailureReason: string, success: boolean) {
    if(success) {
      this.updated.imageUrl = urlOrFailureReason;
    } else {
      alert(urlOrFailureReason)
    }
  }

  isCorrectOption(option: ITestOptionDto) {
    return this.updated.correctOptionIds.indexOf(option.id) > -1
  }

  onOptionCheckChanged(option: ITestOptionDto) {
    if(this.updated.testType === TestType.Checkbox) {
      const existingCorrectOptionIndex = this.updated.correctOptionIds.indexOf(option.id);
      if(existingCorrectOptionIndex > -1) {
        this.updated.correctOptionIds.splice(existingCorrectOptionIndex, 1)
      } else {
        this.updated.correctOptionIds.push(option.id)
      }
    } else {
      this.updated.correctOptionIds = [option.id];
    }
  }

  optionTypeSelected(option: ITestOptionDto, testTypeDropdownOption: DropdownOption) {
    option.valueType = testTypeDropdownOption.id;
    option.value = "";
  }

  optionImageUploaded(option: ITestOptionDto, urlOrFailureReason: string, success: boolean) {
    if(success) {
      option.value = urlOrFailureReason;
    } else {
      alert(urlOrFailureReason)
    }
  }

  deleteOption(option: ITestOptionDto) {
    if(this.updated.options.length < 3) {
      alert("Тест повинен мати не менше 2 варіантів відповіді.");
      return;
    }
    const idx = this.updated.options.indexOf(option);
    this.updated.options.splice(idx, 1);
    this.reassignOptionIds();
  }

  addBlankOption() {
    let id = 1;
    let valueType = TestOptionValueType.Words;
    if(this.updated.options.length > 0) {
      const lastOption = this.updated.options[this.updated.options.length - 1];
      id = lastOption.id + 1;
      valueType = lastOption.valueType;
    }
    this.updated.options.push({
      id: id,
      value: '',
      valueType: valueType
    })
  }

  private reassignOptionIds() {
    for(let i = 0; i < this.updated.options.length; i++) {
      this.updated.options[i].id = i + 1;
    }
  }


}
