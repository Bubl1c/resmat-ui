import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { MathSymbolConverter } from "../../exam/exam.component";

export interface ICondition {
  name: string;
  expectedValue: string;
  typedValue: string;
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

  isValid(condition: ICondition): boolean {
    console.log('Is valid: ', condition);
    return condition.typedValue.trim() === condition.expectedValue;
  }

  submit() {
    this.isSubmitted = true;
    this.isCorrectAnswer =
      this.inside.filter(c => !this.isValid(c)).length === 0 &&
      this.outside.filter(c => !this.isValid(c)).length === 0;
  }

  nextTest() {
    this.passed.emit(1); //TODO: think what to pass to parent
  }

}

function c(name: string, expected: string, units: string): ICondition {
  return { name: MathSymbolConverter.convertString(name), expectedValue: expected, typedValue: '', units: units }
}

const insideConditions = [
  c('w(a)', '?', 'м'),
  c('{phi}{(a)}', '?', 'рад'),
  c('Mr(a)', '0', 'кНм/м'),
  c('Qr(a)', '0', 'кН/м')
];

const outsideConditions = [
  c('w(b)', '0', 'м'),
  c('{phi}{(a)}', '?', 'рад'),
  c('Mr(a)', '0', 'кНм/м'),
  c('Qr(a)', '?', 'кН/м')
];
