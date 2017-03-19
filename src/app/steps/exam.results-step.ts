import { ExamService } from "../exam/data/exam-service.service";
import { ExamStepTypes, IExamStepWithData } from "../exam/data/exam.api-protocol";
import { ExamStep } from "./exam.step";
import { ExamResult, ExamStepResult } from "../exam/components/exam-results/exam-results.component";

export interface IUserExamResult{
  userExamId: number;
  examName: string;
  studentName: string;
  studentGroupName?: string;
  durationMillis: number;
  stepResults: IUserExamStepResult[];
  score: number;
  maxScore: number;
}

export interface IUserExamStepResult {
  userExamId: number;
  stepConfId: number;
  sequence: number;
  name: string;
  attemptsAmount: number;
  mistakesAmount: number;
  durationMillis: number;
}

export class ResultsExamStep extends ExamStep {
  data: ExamResult;

  constructor(public examService: ExamService, stepWithData: IExamStepWithData) {
    super(stepWithData.stepConf.sequence, stepWithData.attempt.userExamId, ExamStepTypes.Results, stepWithData.stepConf.name);
    this.data = ExamResult.create(<IUserExamResult> stepWithData.stepData);
    console.log("Exam result loaded: ", this.data);
  }
}
