import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'status-with-navigation',
  templateUrl: './status-with-navigation.component.html',
  styleUrls: ['./status-with-navigation.component.css']
})
export class StatusWithNavigationComponent implements OnInit {

  @Input() showStatus: boolean;

  @Input() statusSuccess: boolean;

  @Input() statusSuccessMessage: string;

  @Input() statusFailureMessage: string;

  @Input() showBack: boolean;

  @Input() showSubmit: boolean;

  @Input() showContinue: boolean;

  @Output() onSubmit: EventEmitter<any>;

  @Output() onBack: EventEmitter<any>;

  @Output() onContinue: EventEmitter<any>;

  constructor() {
    this.onSubmit = new EventEmitter<any>();
    this.onBack = new EventEmitter<any>();
    this.onContinue = new EventEmitter<any>();
  }

  ngOnInit() {
  }

  delegateSubmit(event: any) {
    this.onSubmit.emit(event);
  }

  delegateContinue(event: any) {
    this.onContinue.emit(event);
  }

  delegateBack(event: any) {
    this.onBack.emit(event);
  }

}
