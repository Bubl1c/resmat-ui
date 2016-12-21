import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { MathSymbolConverter } from "../../exam/exam.component";

export class ResultVariable {
  name: string;
  description: string;
  units: string;
  typedValue: number;
  expectedValue: string;
  valid: boolean;

  constructor(name: string, expectedValue: number, description: string = '', units: string = '') {
    this.name = MathSymbolConverter.convertString(name);
    this.expectedValue = ResultVariable.roundToFixed(expectedValue);
    this.typedValue = parseFloat(this.expectedValue);
    this.description = description;
    this.units = units;
  }

  static roundToFixed(value: number): string {
    return value.toFixed(5);
  }
}

@Component({
  selector: 'x-results',
  templateUrl: './x-results.component.html',
  styleUrls: ['./x-results.component.css']
})
export class XResultsComponent implements OnInit {
  @Input()
  sequence: number;
  @Input()
  variables: ResultVariable[];

  isSubmitted: boolean;
  isCorrectAnswer: boolean;

  @Output() passed: EventEmitter<number>;

  constructor() {
    this.passed = new EventEmitter<number>();
  }

  ngOnInit() {
  }

  submit() {
    this.isSubmitted = true;
    for(let v of this.variables) {
      v.valid = this.isValid(v);
    }
    this.isCorrectAnswer = this.variables.filter(v => !v.valid).length === 0;
  }

  nextAssignment() {
    this.passed.emit(1); //TODO: think what to pass to parent
  }

  private isValid(v: ResultVariable): boolean {
    let typedNumber = parseFloat(v.typedValue + '');
    return !isNaN(typedNumber) && ResultVariable.roundToFixed(typedNumber) === v.expectedValue;
  }

}
