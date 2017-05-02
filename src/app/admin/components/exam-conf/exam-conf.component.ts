import { Component, OnInit, Input } from '@angular/core';

export interface IExamConf {
  id: number;
  name: string;
  description: string;
  maxScore: number;
}

export interface IExamConfWithSteps extends IExamConf {
  steps: IExamStepConf[]
}

export interface IExamStepConf {
  id: number;
  examConfId: number;
  sequence: number;
  name: string;
  stepType: string;
  mistakesPerAttemptLimit: number;
  mistakeValuePercents: number; //influence to result
  attemptsLimit: number;
  attemptValuePercents: number; //influence to result
  maxScore: number; //should be within ExamConf.maxScore
  dataSet: any;
  hasToBeSubmitted: boolean
}

@Component({
  selector: 'exam-conf',
  templateUrl: './exam-conf.component.html',
  styleUrls: ['./exam-conf.component.css']
})
export class ExamConfComponent implements OnInit {
  @Input()
  data: IExamConfWithSteps;

  constructor() { }

  ngOnInit() {
  }

}
