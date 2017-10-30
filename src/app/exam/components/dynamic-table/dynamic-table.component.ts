import { Component, Input, OnInit } from '@angular/core';
import { SmartValue } from "../smart-value/smart-value.component";
import { MathSymbolConverter } from "../../../utils/MathSymbolConverter";

export interface DynamicTableRow {
  name: string
  cells: SmartValue[]
}

export interface DynamicTable {
  title: string
  colNames: string[]
  rows: DynamicTableRow[]
}

@Component({
  selector: 'dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.css']
})
export class DynamicTableComponent implements OnInit {

  @Input() data: DynamicTable;

  constructor() { }

  ngOnInit() {
    this.data.rows.forEach(r => {
      r.name = MathSymbolConverter.convertString(r.name)
    })
  }

}
