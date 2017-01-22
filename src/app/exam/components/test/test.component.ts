import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ITestOptionData, ITestData, TestTypes } from "../../data/exam.api-protocol";
import { ArrayUtils } from "../../../utils/ArrayUtils";

export class TestOption implements ITestOptionData {
  constructor(public id: number,
              public type: string,
              public value: string,
              public checked: boolean = false,
              public correct: boolean = false) {}

  public static create(other: ITestOptionData) {
    return new TestOption(other.id, other.type, other.value, other.checked)
  }
}

export class Test implements ITestData {
  id: number;
  question: string;
  options: TestOption[];
  helpImg: string;
  type: string;

  sequence: number;
  status: number = TestStatus.Initial;

  constructor(iTest: ITestData, sequence: number) {
    this.id = iTest.id;
    this.question = iTest.question;
    this.options = iTest.options.map(io => TestOption.create(io));
    this.helpImg = iTest.helpImg;
    this.type = iTest.type;
    this.sequence = sequence
  }
}

export const enum TestStatus {
  Initial = 0,  //Not submitted yet
  Verifying = 2, //Submitted, waiting for result
  Incorrect = -1,
  Correct = 1
}

export class TestAnswer {
  constructor(public testId: number, public submittedOptions: number[]) {}
}

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  @Input() test: Test;
  @Input() showContinue: boolean;


  @Output() onSubmitted: EventEmitter<TestAnswer>;
  @Output() onContinue: EventEmitter<any>;

  testTypes = TestTypes;

  constructor() {
    this.onSubmitted = new EventEmitter<TestAnswer>();
    this.onContinue = new EventEmitter<number>();
  }

  ngOnInit() {
    ArrayUtils.shuffle(this.test.options);
    this.checkDefaultOption();
  }

  isVerified(): boolean {
    return this.test.status === TestStatus.Incorrect || this.test.status === TestStatus.Correct
  }

  onOptionChecked(option: TestOption) {
    this.reset();
    this.refillOptions(option)
  }

  submit() {
    this.test.status = TestStatus.Verifying;
    this.onSubmitted.emit(
      new TestAnswer(this.test.id, this.test.options.filter(o => o.checked).map(o => o.id))
    )
  }

  doContinue() {
    this.reset();
    this.onContinue.emit();
  }

  private checkDefaultOption() {
    // let anyChecked = this.test.options.find(opt => opt.checked);
    // if(!anyChecked && this.test.type == TestTypes.Radio) {
    //   this.test.options[0].checked = true;
    // }
    this.test.options.forEach(o => o.checked = false);
    if(this.test.type == TestTypes.Radio) {
      this.test.options[0].checked = true;
    }
  }

  private refillOptions(checkedOption: TestOption) {
    switch(this.test.type) {
      case TestTypes.Checkbox: {
        checkedOption.checked = !checkedOption.checked;
        break;
      }
      case TestTypes.Radio: {
        for (let opt of this.test.options) {
          opt.checked = opt.id === checkedOption.id;
        }
        break;
      }
      default: {
        console.error("Unknown test type: " + this.test.type);
      }
    }
  }

  private reset() {
    this.test.status = TestStatus.Initial;
  }

}
