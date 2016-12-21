import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-submit',
  templateUrl: './submit.component.html',
  styleUrls: ['./submit.component.css']
})
export class SubmitComponent implements OnInit {

  @Input()
  isSubmitted: boolean;

  @Input()
  isCorrectAnswer: boolean;

  @Input()
  isBack: boolean;

  @Output()
  onSubmit: EventEmitter<number>;

  @Output()
  onNext: EventEmitter<number>;

  constructor() {
    this.onSubmit = new EventEmitter<number>();
    this.onNext = new EventEmitter<number>();
  }

  ngOnInit() {
  }

  submit() {
    this.onSubmit.emit(1);
  }

  next() {
    this.onNext.emit(1);
  }

  back() {
    this.onNext.emit(-1);
  }

}
