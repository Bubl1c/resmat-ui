import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

export class SelectableItem {
  constructor(public id: number, public label: string, public isSelected: boolean) {}
  copy() {
    return new SelectableItem(this.id, this.label, this.isSelected)
  }
}

export interface ItemSelectorConfig {
  noItemsMessage?: string
  mutateInput?: boolean
}

@Component({
  selector: 'item-selector',
  templateUrl: './item-selector.component.html',
  styleUrls: ['./item-selector.component.css']
})
export class ItemSelectorComponent implements OnInit {

  @Input() items: SelectableItem[];
  @Input() config?: ItemSelectorConfig;
  @Output() onSelected = new EventEmitter<SelectableItem>();
  @Output() onUnselected = new EventEmitter<SelectableItem>();

  updatedItems: SelectableItem[] = [];

  constructor() { }

  ngOnInit() {
    console.log('init items selector: ', this.config, this.items);
    if(this.items instanceof Array) {
      if(this.config && this.config.mutateInput) {
        this.updatedItems = this.items;
      } else {
        this.items.forEach(i => this.updatedItems.push(i.copy()));
      }
    } else {
      console.error("Invalid 'items' object passed, expected array, but got: " + JSON.stringify(this.items))
    }
  }

  selectItem(item: SelectableItem) {
    item.isSelected = !item.isSelected;
    if(item.isSelected) {
      this.onSelected.emit(item)
    } else {
      this.onUnselected.emit(item)
    }
  }

}
