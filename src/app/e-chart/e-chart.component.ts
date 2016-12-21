import { Component, OnInit, Input } from '@angular/core';
import { MathSymbolConverter } from "../exam/exam.component";

export interface IChart {
  title: string;
  x: number[];
  y: number[];
  bottom: boolean;
  positive: boolean;
}

@Component({
  selector: 'e-chart',
  templateUrl: './e-chart.component.html',
  styleUrls: ['./e-chart.component.css']
})
export class EChartComponent implements OnInit {
  @Input()
  chart: IChart;

  lineChartData: Array<any>;
  lineChartLabels: Array<any>;
  lineChartOptions: any;
  lineChartColors: Array<any>;
  lineChartLegend: boolean = false;
  lineChartType: string = 'line';

  constructor() { }

  ngOnInit() {
    this.chart.title = MathSymbolConverter.convertString(this.chart.title);
    this.lineChartData = this.defaultDataset(this.chart.y);
    this.lineChartLabels = this.chart.x;
    this.lineChartOptions = this.defaultOptions(this.chart);
    this.lineChartColors = this.defaultColors;
  }

  private defaultDataset(data: Array<number>) {
    return [{
      label: '',
      data: data
      // cubicInterpolationMode: 'monotone'
    }];
  }

  private defaultOptions(chart: IChart) {
    return {
      animation: false,
      responsive: true,
      tooltips: {
        callbacks: {
          title: function(tooltipItem, data) { return '' },
          label: function(tooltipItem, data) {
            return /*chart.bottom ? -(tooltipItem.yLabel) : */tooltipItem.yLabel;
          }
        }
      },
      scales: {
        xAxes: [{
          display: true,
          ticks: {
            beginAtZero: true
          }
        }],
        yAxes: [{
          display: true,
          ticks: {
            reverse: chart.bottom,
            beginAtZero: true
          }
        }]
      }
    }
  }

  public defaultColors:Array<any> = [{ // grey
    backgroundColor: 'rgba(148,159,177,0.2)',
    borderColor: 'rgba(148,159,177,1)',
    pointBackgroundColor: '#fff',
    pointBorderColor: 'rgba(148,159,177,1)',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  }];

}
