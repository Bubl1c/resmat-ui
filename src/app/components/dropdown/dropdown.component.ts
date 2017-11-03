import {
  Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges,
  ViewEncapsulation
} from '@angular/core';

export class DropdownOption {
  constructor(public id: any, public text: string, public selectedText: string = null) {
    if(this.selectedText === null) {
      this.selectedText = text
    }
  }
}

@Component({
  selector: 'dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css']
})
export class DropdownComponent implements OnInit, OnChanges {

  @Input() selectedOptionId?: any;
  @Input() selectedOptionPlaceholder?: string;
  @Input() options: DropdownOption[] = [];

  @Input() maxWidthPx?: number = 500;
  @Input() widthPx?: number;
  stylesObj: any = {};

  @Output() onSelected = new EventEmitter<DropdownOption>();

  selectedOption: DropdownOption;

  muiCaret = '<span class="mui-caret"></span>';

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(!this.options || this.options.length === 0) {
      console.error("Empty options array passed to dropdown.")
    }
    const selectDefault = () => this.selectedOption = this.options.length > 0 ? this.options[0] : null;
    if(typeof this.selectedOptionId !== "undefined") {
      const selected = this.options.find(o => o.id === this.selectedOptionId);
      if(!selected) {
        console.error(`Selected option passed to dropdown must be 1 of passed options.` +
          ` Passed selected: ${JSON.stringify(this.selectedOption)}, passed options: ${JSON.stringify(this.options)}`)
        selectDefault()
      } else {
        this.selectedOption = selected
      }
    } else {
      selectDefault()
    }
    this.selectedOptionPlaceholder = this.selectedOptionPlaceholder ? this.selectedOptionPlaceholder : 'Вибрати';
    this.setupStyles()
  }

  select(option: DropdownOption) {
    this.onSelected.emit(option);
    this.selectedOption = option;
  }

  private setupStyles() {
    if(typeof this.widthPx !== "undefined") {
      this.stylesObj['width.px'] = this.widthPx;
    }
    if(typeof this.maxWidthPx !== "undefined") {
      this.stylesObj['max-width.px'] = this.maxWidthPx;
    }
  }

}
