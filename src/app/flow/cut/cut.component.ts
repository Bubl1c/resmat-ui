import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ResultVariable } from "../x-results/x-results.component";

@Component({
  selector: 'cut',
  templateUrl: './cut.component.html',
  styleUrls: ['./cut.component.css']
})
export class CutComponent implements OnInit {
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

  nextAssignment(event: any) {
    this.passed.emit(event); //TODO: think what to pass to parent
  }

  private isValid(v: ResultVariable): boolean {
    let typedNumber = parseFloat(v.typedValue + '');
    return !isNaN(typedNumber) && ResultVariable.roundToFixed(typedNumber) === v.expectedValue;
  }

}
