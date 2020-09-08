import { AfterViewInit, Component, OnInit } from "@angular/core";
import { ExamService } from "./data/exam-service.service";
import { IExamDto, ExamStepTypes, IExamStepWithData } from "./data/exam.api-protocol";
import { TestSetExamStep } from "../steps/exam.test-set-step";
import { TaskFlowExamStep } from "../steps/exam.task-flow-step";
import { ExamStep } from "../steps/exam.step";
import { ResultsExamStep } from "../steps/exam.results-step";
import { ErrorResponse } from "../utils/HttpUtils";
import { ActivatedRoute } from "@angular/router";
import { CurrentSession } from "../current-session";
import { GoogleAnalyticsUtils } from "../utils/GoogleAnalyticsUtils";
import { RMU } from "../utils/utils";

class InitialExamStep extends ExamStep {
  loadInitialData(): void {}
  constructor() {
    super(0, -1, "initial-fake-type", "This kind of step used for initial exam condition. " +
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

  errorMessage: string;

  isLoading: boolean = true;

  constructor(private examService: ExamService, private route: ActivatedRoute) {
    this.step = new InitialExamStep();
  }

  ngOnInit() {
    let examId: number = this.route.snapshot.params['examId'];
    this.examService.startAndGetExam(examId).subscribe((exam: IExamDto) => {
      if(exam) {
        console.log("Exam loaded: ", exam);
        RMU.safe(() => {
          GoogleAnalyticsUtils.pageView(`users/${CurrentSession.user.id}/exams/${exam.id}`, `Іспит ${exam.name}`);
        });
        this.exam = exam;
        this.isLoading = false;
        this.loadNextStep();
      } else {
        console.log("NO Exam loaded: ", exam);
        this.errorMessage = "Не вдалося завантажити";
        this.isLoading = false;
        //todo show error that no exam available
      }
    }, (error: ErrorResponse) => {
      if(error.status === 423) {
        let lockedUntil = JSON.parse(error.body);
        this.errorMessage = "Заблоковано до " + new Date(lockedUntil).toLocaleString();
      }
      if(error.status === 409) {
        this.errorMessage = "Не вдалося завантажити";
      }
      this.isLoading = false;
    });
  }

  submitCurrentStep() {
    RMU.safe(() => {
      GoogleAnalyticsUtils.event(`Exam:${this.exam.id}`, `Submitted step ${this.exam.currentStep.sequence}`, "SubmitExamStep", this.exam.currentStep.sequence);
    });
    this.examService.submitExamStep(this.exam.id, this.exam.currentStep.sequence).subscribe(response => {
      this.loadNextStep()
    }, (error: ErrorResponse) => {
      alert("Не вдалося продовжити! " + error)
    })
  }

  getCurrentUserName() {
    if(CurrentSession.user) {
      return "Ви увійшли як: " + CurrentSession.user.firstName + " " + CurrentSession.user.lastName
    } else {
      return ""
    }
  }

  private loadNextStep() {
    this.examService.getCurrentExamStep(this.exam.id).subscribe((stepWithData: IExamStepWithData) => {
      console.log("Current step loaded: ", stepWithData);
      RMU.safe(() => {
        GoogleAnalyticsUtils.event(`Exam:${this.exam.id}`, `Loaded step ${stepWithData.stepConf.sequence}`, "LoadStep", stepWithData.stepConf.sequence);
      });

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
          RMU.safe(() => {
            GoogleAnalyticsUtils.event(`Exam:${this.exam.id}`, "complete");
          });
          break;
        default: throw "Invalid exam step: " + stepWithData.stepConf.stepType;
      }
    }, (error: ErrorResponse) => {
      alert("Failed to load current step: " + error);
    });
  }

}
