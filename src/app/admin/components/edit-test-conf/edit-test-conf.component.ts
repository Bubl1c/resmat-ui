import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  ITestEditDto, ITestOptionWithCorrectDto, TestOptionValueType, TestType
} from "../../../exam/data/test-set.api-protocol";
import {DropdownOption} from "../../../components/dropdown/dropdown.component";

export class TestEdit implements ITestEditDto {
  id: number = -1;
  groupId: number = -1;
  question: string = "";
  imageUrl: string = "";
  options: ITestOptionWithCorrectDto[] = [];
  help: string = "";
  testType: TestType = TestType.Radio;

  constructor(other?: TestEdit) {
    if(other && Object.keys(other).length > 0) {
      this.id = other.id;
      this.groupId = other.groupId;
      this.question = other.question;
      this.imageUrl = other.imageUrl;
      this.options = other.options;
      this.help = other.help;
      this.testType = other.testType;
    }
  }
}

@Component({
  selector: 'edit-test-conf',
  templateUrl: './edit-test-conf.component.html',
  styleUrls: ['./edit-test-conf.component.css']
})
export class EditTestConfComponent implements OnInit {

  @Input() isSaving: boolean = false;
  @Input() testToUpdate: ITestEditDto;
  @Output() onSave = new EventEmitter<ITestEditDto>();

  updated: ITestEditDto;

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

  uploadTempImgPath: string = "/upload-temp-file";

  constructor() { }

  ngOnInit() {
    if(!this.testToUpdate || !this.testToUpdate.groupId || this.testToUpdate.groupId < 1) {
      const errMsg = "Не можливо завантажити редактор тесту оскільки об'єкт не визначений " +
        "або не вказано id групи: " + JSON.stringify(this.testToUpdate);
      alert(errMsg);
      throw new Error(errMsg)
    }
    this.updated = new TestEdit(this.testToUpdate);
    if(this.updated.options.length === 0) {
      this.addBlankOption(true);
    }
    this.testTypeSelectedDropdownOption = this.dropdownTestTypes.find(o => o.id === this.updated.testType)
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

  onOptionCheckChanged(option: ITestOptionWithCorrectDto) {
    if(this.updated.testType === TestType.Checkbox) {
      option.correct = !option.correct;
    } else {
      this.updated.options.forEach(opt => opt.correct = false);
      option.correct = true;
    }
  }

  optionTypeSelected(option: ITestOptionWithCorrectDto, testTypeDropdownOption: DropdownOption) {
    option.valueType = testTypeDropdownOption.id;
    option.value = "";
  }

  optionImageUploaded(option: ITestOptionWithCorrectDto, urlOrFailureReason: string, success: boolean) {
    if(success) {
      option.value = urlOrFailureReason;
    } else {
      alert(urlOrFailureReason)
    }
  }

  deleteOption(option: ITestOptionWithCorrectDto) {
    if(this.updated.options.length < 3) {
      alert("Тест повинен мати не менше 2 варіантів відповіді.");
      return;
    }
    const idx = this.updated.options.indexOf(option);
    this.updated.options.splice(idx, 1);
    this.reassignOptionIds();
  }

  addBlankOption(correct: boolean = false) {
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
      correct: correct,
      valueType: valueType
    })
  }

  helpImageUploaded(urlOrFailureReason: string, success: boolean) {
    if(success) {
      this.updated.help = urlOrFailureReason
    } else {
      alert("Failed to upload help image. Reason: " + urlOrFailureReason)
    }
  }

  save() {
    if(this.validate()) {
      this.onSave.emit(this.updated)
    }
  }

  private validate(): boolean {
    const obj: ITestEditDto = this.updated;
    const errors: string[] = [];
    if(!obj.question && !obj.imageUrl) {
      errors.push("В тесті має бути хоча б запитання або зображення або і те і інше.")
    }
    errors.push(...this.validateOptions());

    if(errors.length > 0) {
      alert("Виправте наступні помилки: \n" + errors.join("\n"));
      return false;
    }
    return true;
  }

  private validateOptions(): string[] {
    const errors: string[] = [];
    const correctOptIds: number[] = this.updated.options.filter(o => o.correct).map(o => o.id);
    const opts: ITestOptionWithCorrectDto[] = this.updated.options;
    if(correctOptIds.length === 0) {
      errors.push("Тест повинен мати не менше 1 правильної відповіді")
    }
    if(this.updated.testType === TestType.Radio && correctOptIds.length !== 1) {
      errors.push("Тест повинен мати лише 1 правильну відповідь")
    }
    const emptyValues = opts.filter(opt => !opt.value);
    if(emptyValues.length > 0) {
      errors.push(`Варіанти відповіді ${emptyValues.map(opt => opt.id).join(", ")} пусті. Заповніть або видаліть їх.`)
    }
    return errors;
  }

  private reassignOptionIds() {
    for(let i = 0; i < this.updated.options.length; i++) {
      this.updated.options[i].id = i + 1;
    }
  }

}
