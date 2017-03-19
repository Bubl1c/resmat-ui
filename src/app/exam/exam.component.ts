import { Component, OnInit } from "@angular/core";
import { ExamService } from "./data/exam-service.service";
import { IExamDto, ExamStepTypes, IExamStepWithData } from "./data/exam.api-protocol";
import { TestSetExamStep } from "../steps/exam.test-set-step";
import { TaskFlowExamStep } from "../steps/exam.task-flow-step";
import { ExamStep } from "../steps/exam.step";
import { ResultsExamStep } from "../steps/exam.results-step";
import { ErrorResponse } from "../utils/HttpUtils";

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
  exam: IExamDto;
  step: ExamStep;

  isLoading: boolean = true;

  constructor(private examService: ExamService) {
    this.step = new InitialExamStep();
  }

  ngOnInit() {
    this.examService.getExamForUser().subscribe((exam: IExamDto) => {
      if(exam) {
        console.log("Exam loaded: ", exam);
        this.exam = exam;
        this.isLoading = false;
        this.loadNextStep();
      } else {
        console.log("NO Exam loaded: ", exam);
        this.isLoading = false;
        //todo show error that no exam available
      }
    });
  }

  submitCurrentStep() {
    this.examService.submitExamStep(this.exam.id, this.exam.currentStep.sequence).subscribe(response => {
      this.loadNextStep()
    }, (error: ErrorResponse) => {
      alert("Не вдалося продовжити! " + error)
    })
  }

  private loadNextStep() {
    this.examService.getCurrentExamStep(this.exam.id).subscribe((stepWithData: IExamStepWithData) => {
      console.log("Current step loaded: ", stepWithData);

      this.exam.currentStep.sequence = stepWithData.stepConf.sequence;
      this.exam.currentStep.type = stepWithData.stepConf.stepType;
      this.exam.currentStep.description = stepWithData.stepConf.name;

      switch(stepWithData.stepConf.stepType) {
        case ExamStepTypes.TestSet:
          this.step = new TestSetExamStep(this.examService, stepWithData);
          break;
        case ExamStepTypes.TaskFlow:
          this.step = new TaskFlowExamStep(this.examService, stepWithData);
          break;
        case ExamStepTypes.Results:
          this.step = new ResultsExamStep(this.examService, stepWithData);
          break;
        default: throw "Invalid exam step: " + stepWithData.stepConf.stepType;
      }
    }, (error: ErrorResponse) => {
      alert("Failed to load current step: " + error);
    });
  }

}
