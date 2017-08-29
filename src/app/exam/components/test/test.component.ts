import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { ArrayUtils } from "../../../utils/ArrayUtils";
import {ITestOptionDto, ITestDto, TestTypes, TestOptionValueType} from "../../data/test-set.api-protocol";
import { MathSymbolConverter } from "../../../utils/MathSymbolConverter";

export class TestOption {
  constructor(public id: number,
              public valueType: TestOptionValueType,
              public value: string,
              public checked: boolean = false,
              public correct: boolean = false) {}

  public static create(other: ITestOptionDto) {
    return new TestOption(other.id, other.valueType, other.value, false)
  }
}

export class Test {
  id: number;
  question: string;
  imageUrl: string;
  options: TestOption[];
  helpImg: string;
  type: string;

  sequence: number;
  status: number = TestStatus.Initial;

  constructor(iTest: ITestDto, sequence: number) {
    this.id = iTest.id;
    this.question = iTest.question;
    this.imageUrl = iTest.imageUrl;
    this.options = iTest.options.map(io => TestOption.create(io));
    this.helpImg = iTest.help;
    this.type = iTest.testType;
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
    // this.replaceMathSymbolPlaceholders();
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

  private replaceMathSymbolPlaceholders() {
    this.test.question = MathSymbolConverter.convertString(this.test.question)
    this.test.options.forEach(opt => {
      opt.value = MathSymbolConverter.convertString(opt.value);
    })
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
