import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { MathSymbolConverter } from "../../exam/exam.component";
import { IChart } from "../../e-chart/e-chart.component";

@Component({
  selector: 'chart-set',
  templateUrl: './chart-set.component.html',
  styleUrls: ['./chart-set.component.css']
})
export class ChartSetComponent implements OnInit {
  @Input()
  title: string;
  @Input()
  data: IChart[];

  @Output() passed: EventEmitter<number>;

  constructor() {
    this.passed = new EventEmitter<number>();
  }

  ngOnInit() {
    this.title = MathSymbolConverter.convertString(this.title);
    for(let chart of this.data) {
      if(true/*chart.bottom*/) {
        chart.y = chart.y.map(n => -n);
      }
    }
  }

  next() {
    this.passed.emit(1); //TODO: think what to pass to parent
  }

}
