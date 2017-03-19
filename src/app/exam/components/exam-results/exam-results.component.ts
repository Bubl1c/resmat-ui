import { Component, OnInit, Input } from "@angular/core";
import { IUserExamResult } from "../../../steps/exam.results-step";

export class ExamStepResult {
  constructor(public sequence: number,
              public name: string,
              public attemptsAmount: number,
              public mistakesAmount: number,
              public durationMillis: number) {}
}

export class ExamResult {
  constructor(public examId: number,
              public examName: string,
              public studentName: string,
              public studentGroupName: string,
              public durationMillis: number,
              public score: number,
              public maxScore: number,
              public stepResults: ExamStepResult[]) {}
  static create(dto: IUserExamResult): ExamResult {
    return new ExamResult(
      dto.userExamId,
      dto.examName,
      dto.studentName,
      dto.studentGroupName,
      dto.durationMillis,
      dto.score,
      dto.maxScore,
      dto.stepResults.map(r => new ExamStepResult(r.sequence, r.name, r.attemptsAmount, r.mistakesAmount, r.durationMillis))
    )
  }
}

@Component({
  selector: 'exam-results',
  templateUrl: './exam-results.component.html',
  styleUrls: ['./exam-results.component.css']
})
export class ExamResultsComponent implements OnInit {
  @Input() data: ExamResult;
  @Input() showName: boolean = true;

  duration: string;

  isOneStep: boolean;
  noSteps: boolean;

  constructor() { }

  ngOnInit() {
    this.duration = this.durationToString(this.data.durationMillis);
    console.log(this.data.durationMillis + " = " + this.durationToString(this.data.durationMillis));
    this.data.durationMillis = this.data.durationMillis * 5;
    console.log(this.data.durationMillis + " = " + this.durationToString(this.data.durationMillis));
    this.data.durationMillis = this.data.durationMillis * 5;
    console.log(this.data.durationMillis + " = " + this.durationToString(this.data.durationMillis));
    this.data.durationMillis = this.data.durationMillis * 5;
    console.log(this.data.durationMillis + " = " + this.durationToString(this.data.durationMillis));
    this.isOneStep = this.data.stepResults.length === 1;
    this.noSteps = this.data.stepResults.length === 0;
    console.log("exam results component loaded", this);
  }

  durationToString(millis: number): string {
    let x = millis / 1000;
    let seconds = x % 60;
    x /= 60;
    let minutes = x % 60;
    x /= 60;
    let hours = x % 24;
    x /= 24;
    let days = x;
    return this.str(days, "день", "днів")
      + this.str(hours, "година", "годин")
      + this.str(minutes, "хвилина", "хвилин")
      + this.str(seconds, "секунда", "секунд");
  }

  str(value: number, suffixOne: string, suffixMoreThanOne: string): string {
    let rounded = Math.floor(value);
    let roundedStr = (rounded > 0 ? rounded : "");
    let suffixStr = rounded === 1 ? suffixOne : suffixMoreThanOne;
    return roundedStr ? (roundedStr + " " + suffixStr + " ") : "";
  }

}
