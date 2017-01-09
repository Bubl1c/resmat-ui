import { Component, OnInit, Input } from '@angular/core';

export type PositionHOptions = 'left' | 'right';
export type PositionVOptions = 'bottom' | 'top';

@Component({
  selector: 'help-materials',
  templateUrl: './help-materials.component.html',
  styleUrls: ['./help-materials.component.css']
})
export class HelpMaterialsComponent implements OnInit {

  @Input() title: string;
  @Input() positionH: PositionHOptions;
  @Input() positionV: PositionVOptions;
  @Input() altText: string;
  @Input() imgUrl: string;

  constructor() { }

  ngOnInit() {
    if(!this.positionH) this.positionH = 'right';
    if(!this.positionV) this.positionV = 'top';
  }

}
