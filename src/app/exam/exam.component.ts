import { Component, OnInit } from '@angular/core';
import { ExamService } from "./data/exam-service.service";
import { IExamData, ExamStepTypes } from "./data/exam.api-protocol";
import { TestSetExamStep } from "../steps/exam.test-set-step";
import { ActivatedRoute } from "@angular/router";
import { TaskFlowExamStep } from "../steps/exam.task-flow-step";
import { ExamStep } from "../steps/exam.step";
import { ResultsExamStep } from "../steps/exam.results-step";

class InitialExamStep extends ExamStep {
  loadInitialData(): void {}
  constructor() {
    super(0, -1, "non-existing-type", "This kind of step used for initial exam condition. " +
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
      this.loadStep(exam.id, exam.currentStep.type, exam.currentStep.sequence, exam.currentStep.description);
    });
  }

  onTestSetStepFinished() {
    this.loadNextStep(ExamStepTypes.TaskFlow, "Розв'язання задачі");
  }

  onTaskFlowStepFinished() {
    this.loadNextStep(ExamStepTypes.Results, "Результати");
  }

  private loadNextStep(type: string, description: string) {
    this.exam.currentStep.sequence = this.step.sequence + 1;
    this.exam.currentStep.type = type;
    this.exam.currentStep.description = description;
    this.loadStep(this.exam.id, this.exam.currentStep.type, this.exam.currentStep.sequence, this.exam.currentStep.description)
  }

  private loadStep(examId: number, type: string,  sequence: number, description: string) {
    switch(type) {
      case ExamStepTypes.Test:
        this.step = new TestSetExamStep(this.examService, examId, sequence, description);
        break;
      case ExamStepTypes.TaskFlow:
        this.step = new TaskFlowExamStep(this.examService, examId, sequence, description);
        break;
      case ExamStepTypes.Results:
        this.step = new ResultsExamStep(this.examService, examId, sequence, description);
        break;
      default: throw "Invalid exam step: " + type;
    }
    this.step.loadInitialData();
  }

}
