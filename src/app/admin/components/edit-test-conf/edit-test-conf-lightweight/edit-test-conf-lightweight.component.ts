import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  ITestEditDto, ITestOptionWithCorrectDto, TestOptionValueType, TestType
} from "../../../../exam/data/test-set.api-protocol";
import {DropdownOption} from "../../../../components/dropdown/dropdown.component";
import {Test} from "../../../../exam/components/test/test.component";
import { UserDefaults } from "../../../userDefaults";

@Component({
  selector: 'edit-test-conf-lightweight',
  templateUrl: './edit-test-conf-lightweight.component.html',
  styleUrls: ['./edit-test-conf-lightweight.component.css']
})
export class EditTestConfLightweightComponent implements OnInit {

  @Input() index: number;
  @Input() testToUpdate: ITestEditDto;
  @Output() onSave = new EventEmitter<ITestEditDto>();
  @Output() onDelete = new EventEmitter<void>();

  updated: ITestEditDto;
  preview: Test;

  constructor() { }

  ngOnInit() {
    this.updated = this.testToUpdate;
    if(this.updated.options.length === 0) {
      this.addBlankOption(true);
    }
  }

  onOptionCheckChanged(option: ITestOptionWithCorrectDto) {
    this.updated.options.forEach(opt => opt.correct = false);
    option.correct = true;
  }

  deleteOption(option: ITestOptionWithCorrectDto) {
    if(this.updated.options.length < 3) {
      alert("Тест повинен мати не менше 2 варіантів відповіді.");
      return;
    }
    const idx = this.updated.options.indexOf(option);
    this.updated.options.splice(idx, 1);
    this.reassignOptionIds();
    if (option.correct && this.updated.options.length > 0) {
      this.updated.options[0].correct = true;
    }
  }

  addBlankOption(correct: boolean = false) {
    let id = 1;
    let valueType = UserDefaults.EditTestConf.testOptionType;
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

  save() {
    if(this.validate()) {
      this.updated.options.map(opt => { // Value should always be a string
        if (opt.valueType === TestOptionValueType.Number) {
          opt.value = opt.value.toString()
        }
        return opt
      });
      this.onSave.emit(this.updated)
    }
  }

  private validate(): boolean {
    const obj: ITestEditDto = this.updated;
    const errors: string[] = [];
    if(!obj.question && !obj.imageUrl) {
      errors.push("В тесті має бути запитання")
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
    const opts: ITestOptionWithCorrectDto[] = this.updated.options;
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
