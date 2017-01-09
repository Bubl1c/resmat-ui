import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ITestOption, ITest } from "../../exam.model";

export class Test implements ITest {
  id: number;
  question: string;
  options: ITestOption[];
  helpImg: string;

  sequence: number;
  status: number = TestStatus.Initial;

  constructor(iTest: ITest, sequence: number) {
    this.id = iTest.id;
    this.question = iTest.question;
    this.options = iTest.options;
    this.helpImg = iTest.helpImg;
    this.sequence = sequence
  }
}

export const enum TestStatus {
  Initial = 0,  //Not submitted yet
  Verifying = 2, //Submitted, waiting for result
  Wrong = -1,
  Correct = 1
}

export class TestSubmit {
  constructor(public id: number, public checked: ITestOption) {}
}

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  @Input()
  test: Test;

  @Output() onSubmitted: EventEmitter<TestSubmit>;
  @Output() onContinue: EventEmitter<any>;

  constructor() {
    this.onSubmitted = new EventEmitter<TestSubmit>();
    this.onContinue = new EventEmitter<number>();
  }

  ngOnInit() {
  }

  isVerified(): boolean {
    return this.test.status === -1 || this.test.status === 1
  }

  onOptionChecked(option: ITestOption) {
    this.reset();
    for (let opt of this.test.options) {
      opt.checked = opt.id === option.id;
    }
  }

  submit() {
    this.test.status = TestStatus.Verifying;
    this.onSubmitted.emit(
      new TestSubmit(this.test.id, this.test.options.filter(o => o.checked)[0]) //TODO: First element for now. Consider few.
    )
  }

  nextAssignment() {
    this.reset();
    this.onContinue.emit();
  }

  private reset() {
    this.test.status = TestStatus.Initial;
  }

}
