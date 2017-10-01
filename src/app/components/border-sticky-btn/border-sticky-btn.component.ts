import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { PositionHOptions, PositionVOptions } from "../position-options";

@Component({
  selector: 'border-sticky-btn',
  templateUrl: './border-sticky-btn.component.html'
})
export class BorderStickyBtnComponent implements OnInit {
  @Input() altText?: string;
  @Input() positionH?: PositionHOptions;
  @Input() positionV?: PositionVOptions;
  @Input() paddingPx?: number;

  @Output() onClick: EventEmitter<any>;

  constructor() {
    this.onClick = new EventEmitter<any>();
  }

  ngOnInit() {
    if(!this.positionH) this.positionH = 'left';
    if(!this.positionV) this.positionV = 'bottom';
    if(!this.altText) this.altText = '';
    if(!this.paddingPx) this.paddingPx = 0
  }

  click() {
    this.onClick.emit();
  }

}
