import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

export interface ITest {
  id: number;
  question: string;
  options: IOption[];
  correctOption: number;
}

export interface IOption {
  id: number;
  value: string;
  type: string;
  checked: boolean;
}

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  @Input()
  test: ITest;
  @Input()
  sequence: number;

  @Output() passed: EventEmitter<number>;

  isCorrectAnswer: boolean;
  isSubmitted: boolean;

  constructor() {
    this.passed = new EventEmitter<number>();
  }

  ngOnInit() {
  }

  onOptionChecked(option: IOption) {
    this.reset();
    for (let opt of this.test.options) {
      opt.checked = opt.id === option.id;
    }
  }

  submit() {
    this.isSubmitted = true;
    for (let opt of this.test.options) {
      if(opt.checked) {
        this.isCorrectAnswer = opt.id === this.test.correctOption;
        break;
      }
    }
  }

  nextTest() {
    this.reset();
    this.passed.emit(1); //TODO: think what to pass to parent
  }

  private reset() {
    this.isCorrectAnswer = false;
    this.isSubmitted = false;
  }

}
