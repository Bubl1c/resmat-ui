import { Component, OnInit } from '@angular/core';
import { ExamService } from "./data/exam-service.service";
import { IExamData, ExamStepTypes, IExamStepData } from "./data/exam.api-protocol";
import { TestSetExamStep } from "../steps/exam.test-set-step";
import { ActivatedRoute } from "@angular/router";
import { TaskFlowExamStep } from "../steps/exam.task-flow-step";
import { ExamStep } from "../steps/exam.step";

class InitialExamStep extends ExamStep {
  loadInitialData(): void {
  }
  constructor() {
    super(-1, "non-existing-type", "This kind of step used for initial exam condition. " +
      "To hide all other steps and show loading bar.");
  }
}

@Component({
  selector: 'app-exam',
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.css'],
  providers: [ExamService]
})
export class ExamComponent implements OnInit {
  exam: IExamData;
  step: ExamStep;

  isLoading: boolean = true;

  constructor(private examService: ExamService, private route: ActivatedRoute) {
    this.step = new InitialExamStep();
  }

  ngOnInit() {
    let userIdParam = this.route.snapshot.params["id"];
    this.examService.getExamForUser(userIdParam).subscribe((exam: IExamData) => {
      console.log("Exam loaded: ", exam);
      this.exam = exam;
      this.isLoading = false;
      this.loadStep(exam.id, exam.currentStep);
    });
  }

  private loadStep(examId: number, step: IExamStepData) {
    switch(step.type) {
      case ExamStepTypes.Test:
        this.step = new TestSetExamStep(this.examService, examId, step.description);
        break;
      case ExamStepTypes.TaskFlow:
        this.step = new TaskFlowExamStep(this.examService, examId, step.description);
        break;
      default: throw "Invalid exam step: " + step;
    }
    this.step.loadInitialData();
  }

  // this.route.params
  // // (+) converts string 'id' to a number
  //   .switchMap((params: Params) => this.service.getHero(+params['id']))
  //   .subscribe((hero: Hero) => this.hero = hero);

  nextAssignment(event: any) {
    console.log('Going to next assignment: ', event);
  }

  continue() {
    console.log("Go gogo")
  }

}
