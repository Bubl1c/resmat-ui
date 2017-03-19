import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { IChart } from "../e-chart/e-chart.component";
import { MathSymbolConverter } from "app/utils/MathSymbolConverter";

export class ChartSet {
  constructor(public title: string, public charts: IChart[]) {}
}

@Component({
  selector: 'chart-set',
  templateUrl: './chart-set.component.html',
  styleUrls: ['./chart-set.component.css']
})
export class ChartSetComponent implements OnInit {
  @Input() data: ChartSet;

  @Output() passed: EventEmitter<number>;

  constructor() {
    this.passed = new EventEmitter<number>();
  }

  ngOnInit() {
    this.data.title = MathSymbolConverter.convertString(this.data.title);
  }

}
