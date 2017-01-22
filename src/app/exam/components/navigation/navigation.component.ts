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


  @Output() onSubmit = new EventEmitter<any>();

  @Output() onBack = new EventEmitter<any>();

  @Output() onContinue = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit() {
  }

  submit() {
    this.disableSubmit = true;
    this.onSubmit.emit();
  }

  back() {
    this.onBack.emit();
  }

  continue() {
    this.onContinue.emit();
  }

}
