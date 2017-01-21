import { Component, OnInit, Input } from '@angular/core';

export class ExamResult {
  constructor(public id: number,
              public examName: string,
              public taskName: string,
              public studentName: string,
              public studentGroupName: string,
              public mistakesAmountInTests: number,
              public mistakesAmountInTask: number,
              public attemptsAmount: number,
              public durationMillis: number,
              public score: number,
              public maxScore: number) {}
}

@Component({
  selector: 'exam-results',
  templateUrl: './exam-results.component.html',
  styleUrls: ['./exam-results.component.css']
})
export class ExamResultsComponent implements OnInit {
  @Input() data: ExamResult;
  durationHrs: string;

  constructor() { }

  ngOnInit() {
    this.durationHrs = (this.data.durationMillis / 1000 / 60 / 60).toPrecision(1)
  }

}
