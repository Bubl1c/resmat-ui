import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

export type ContentAlignmentOptions = 'left' | 'center' | 'right';

@Component({
  selector: 'navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  @Input() showBack: boolean;

  @Input() showSubmit: boolean;

  @Input() showContinue: boolean;

  @Input() disableSubmit: boolean;

  @Input() alignContent: ContentAlignmentOptions = 'left';


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

  submit() {
    this.onSubmit.emit();
  }

  back() {
    this.onBack.emit();
  }

  continue() {
    this.onContinue.emit();
  }

}
