import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { MathSymbolConverter } from "app/utils/MathSymbolConverter";

export interface ICondition {
  name: string;
  expectedValue: string;
  typedValue: string;
  valid: boolean;
  units: string;
}

@Component({
  selector: 'app-bc',
  templateUrl: './bc.component.html',
  styleUrls: ['./bc.component.css']
})
export class BcComponent implements OnInit {
  @Input()
  sequence: number;
  inside: ICondition[];
  outside: ICondition[];
  isSubmitted: boolean;
  isCorrectAnswer: boolean;

  @Output() passed: EventEmitter<number>;

  constructor() {
    this.inside = insideConditions.map(c => c);
    this.outside = outsideConditions.map(c => c);
    this.passed = new EventEmitter<number>();
  }

  ngOnInit() {
  }

  submit() {
    this.isSubmitted = true;
    for(let c of this.inside) {
      c.valid = this.isValid(c);
    }
    for(let c of this.outside) {
      c.valid = this.isValid(c);
    }
    this.isCorrectAnswer =
      this.inside.filter(c => !c.valid).length === 0 &&
      this.outside.filter(c => !c.valid).length === 0;
  }

  nextAssignment() {
    this.passed.emit(1); //TODO: think what to pass to parent
  }

  private isValid(condition: ICondition): boolean {
    return condition.typedValue.trim() === condition.expectedValue;
  }

}

const insideConditions = [
  c('w(a)', '?', 'м'),
  c('{phi}{(a)}', '?', 'рад'),
  c('Mr(a)', '0', 'кНм/м'),
  c('Qr(a)', '0', 'кН/м')
];

const outsideConditions = [
  c('w(b)', '0', 'м'),
  c('{phi}{(b)}', '?', 'рад'),
  c('Mr(b)', '0', 'кНм/м'),
  c('Qr(b)', '?', 'кН/м')
];

function c(name: string, expected: string, units: string): ICondition {
  return {
    name: MathSymbolConverter.convertString(name),
    expectedValue: expected,
    typedValue: expected,
    units: units,
    valid: false
  }
}
