import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { MathSymbolConverter } from "../../exam/exam.component";

export interface ICondition {
  name: string;
  expectedValue: number;
  typedValue: string;
  units: string;
}

@Component({
  selector: 'app-bc',
  templateUrl: './bc.component.html',
  styleUrls: ['./bc.component.css']
})
export class BcComponent implements OnInit {
  inside: ICondition[];
  outside: ICondition[];
  isSubmitted: boolean;

  @Output() passed: EventEmitter<number>;

  constructor() {
    this.inside = insideConditions.map(c => c);
    this.outside = outsideConditions.map(c => c);
    this.passed = new EventEmitter<number>();
  }

  ngOnInit() {
  }

  isValid(condition: ICondition): boolean {
    return +condition.typedValue.replace('?', '-1') === condition.expectedValue;
  }

  submit() {
    this.passed.emit(1); //TODO: think what to pass to parent
  }

}

function c(name: string, expected: number, units: string): ICondition {
  return { name: MathSymbolConverter.convertString(name), expectedValue: expected, typedValue: '', units: units }
}

const insideConditions = [
  c('w(a)', -1, 'м'),
  c('{phi}{(a)}', -1, 'рад'),
  c('Mr(a)', 0, 'кНм/м'),
  c('Qr(a)', 0, 'кН/м')
];

const outsideConditions = [
  c('w(b)', 0, 'м'),
  c('{phi}{(a)}', -1, 'рад'),
  c('Mr(a)', 0, 'кНм/м'),
  c('Qr(a)', -1, 'кН/м')
];
