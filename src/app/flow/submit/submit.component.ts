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

  @Output()
  onSubmit: EventEmitter<any>;

  @Output()
  onNext: EventEmitter<any>;

  constructor() {
    this.onSubmit = new EventEmitter();
    this.onNext = new EventEmitter();
  }

  ngOnInit() {
  }

  submit() {
    this.onSubmit.emit();
  }

  next() {
    this.onNext.emit();
  }

}
