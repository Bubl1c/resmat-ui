import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MathSymbolConverter } from "../../../utils/MathSymbolConverter";

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
    // this.typedValue = parseFloat(this.expectedValue);
    this.description = description;
    this.units = units;
  }

  static roundToFixed(value: number): string {
    return value.toFixed(5);
  }
}

export class VariableGroup {
  constructor(public name: string, public variables: ResultVariable[]) {}
}

@Component({
  selector: 'input-set',
  templateUrl: './input-set.component.html',
  styleUrls: ['./input-set.component.css']
})
export class InputSetComponent implements OnInit {

  @Input()
  sequence: number;
  @Input()
  variables: ResultVariable[];
  groups: VariableGroup[];

  isSubmitted: boolean;
  isCorrectAnswer: boolean;

  @Output() passed: EventEmitter<number>;

  constructor() {
    this.passed = new EventEmitter<number>();
  }

  ngOnInit() {
    this.groups = [
      new VariableGroup("Awesome group with awesome name", this.variables.slice(2)),
      new VariableGroup("Much better group", this.variables.slice(2)),
      new VariableGroup("Completely awfull group for shit makers", this.variables)
    ];
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