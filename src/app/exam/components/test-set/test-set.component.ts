import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { TestAnswer, Test, TestStatus } from "../test/test.component";

@Component({
  selector: 'test-set',
  templateUrl: './test-set.component.html',
  styleUrls: ['./test-set.component.css']
})
export class TestSetComponent implements OnInit {
  @Input() tests: Test[];

  @Output() onTestSubmitted: EventEmitter<any>;
  @Output() onSubmitted: EventEmitter<any>;

  isSubmitted: boolean;
  isAllCorrect: boolean;

  constructor() {
    this.onTestSubmitted = new EventEmitter<any>();
    this.onSubmitted = new EventEmitter<any>();
  }

  ngOnInit() {
  }

  delegateTestSubmit(submitted: any) {
    console.log("Delegate submitted test: ", submitted);
    this.isSubmitted = false;
    this.onTestSubmitted.emit(submitted)
  }

  submitAll(event: any) {
    this.isSubmitted = true;
    this.isAllCorrect = this.tests.filter(t => t.status != TestStatus.Correct).length === 0;
    if(this.isAllCorrect) {
      this.onSubmitted.emit(event);
    }
  }

}
