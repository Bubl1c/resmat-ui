import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

export class DropdownOption {
  constructor(public id: any, public text: string) {}
}

@Component({
  selector: 'dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css']
})
export class DropdownComponent implements OnInit {

  @Input() selectedOption?: DropdownOption;
  @Input() selectedOptionPlaceholder?: string;
  @Input() options: DropdownOption[] = [];

  @Input() maxWidthPx: number = 500;

  @Output() onSelected = new EventEmitter<DropdownOption>();

  constructor() { }

  ngOnInit() {
    if(!this.options || this.options.length === 0) {
      console.error("Empty options array passed to dropdown.")
    }
    if(this.selectedOption) {
      if(this.options.indexOf(this.selectedOption) === -1) {
        console.error(`Selected option passed to dropdown must be 1 of passed options.` +
          ` Passed selected: ${JSON.stringify(this.selectedOption)}, passed options: ${JSON.stringify(this.options)}`)
      }
    } else {
      this.selectedOption = this.options.length > 0 ? this.options[0] : null;
    }
  }

  select(option: DropdownOption) {
    this.onSelected.emit(option);
  }

}
