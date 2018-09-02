import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { Observable } from "rxjs/Rx";
import { IExamDto, IExamStepWithData } from "./exam.api-protocol";
import { IExamTaskFlowStepData, ITaskFlowStepDto, IVerifiedTaskFlowStepAnswer } from "./task-flow.api-protocol";
import { TestAnswer } from "../components/test/test.component";
import { ExamResult } from "../components/exam-results/exam-results.component";
import { HttpUtils } from "../../utils/HttpUtils";
import { ApiService } from "../../api.service";

export class VerifiedTestAnswer {
  constructor(public testId: number,
              public isCorrectAnswer: boolean,
              public mistakesAmount: number,
              public answer: { [key:number]:boolean }) {}
  callIfExists(id: number, func: (isCorrect: boolean) => void) {
    let result = this.answer[id];
    if(typeof result === 'boolean') {
      func(result)
    }
  }
}

@Injectable()
export class ExamService {

  private apiBaseUrl: string = 'v1';

  private withBase(path: string): string { return this.apiBaseUrl + path }

  constructor(private http: Http, private api: ApiService) { }

  getAvailableExamsForUser(userId: number = null): Observable<IExamDto[]> {
    let userIdParam = userId !== null ? "?userId="+userId : "";
    return this.api.get("/user-exams" + userIdParam)
      .map((responseData: any[]) => {
        return responseData.map(this.mapUserExamDto)
    });
  }

  startAndGetExam(examId: number): Observable<IExamDto> {
    return this.api.get("/user-exams/" + examId + "/start")
      .map(this.mapUserExamDto);
  }

  getExam(examId: number): Observable<IExamDto> {
    return this.api.get("/user-exams/" + examId)
      .map(this.mapUserExamDto);
  }

  createExamForStudent(examConfId: number, userId: number): Observable<IExamDto> {
    return this.api.post("/user-exams/?examConfId=" + examConfId + "&userId=" + userId, {})
      .map(this.mapUserExamDto);
  }

  deleteExam(examId: number): Observable<IExamDto> {
    return this.api.delete("/user-exams/" + examId);
  }

  lockExam(examId: number, hoursAmount: number): Observable<IExamDto> {
    return this.api.put("/user-exams/" + examId + "/lock?hoursAmount=" + hoursAmount, {}).map(this.mapUserExamDto);
  }

  unlockExam(examId: number): Observable<IExamDto> {
    return this.api.put("/user-exams/" + examId + "/unlock", {}).map(this.mapUserExamDto);
  }

  lockAll(groupId: number, hoursAmount: number): Observable<IExamDto> {
    return this.api.put("/user-exams/lockAll?groupId=" + groupId + "&hoursAmount=" + hoursAmount, {});
  }

  unlockAll(groupId: number): Observable<IExamDto> {
    return this.api.put("/user-exams/unlockAll?groupId=" + groupId, {});
  }

  getExamForUser(): Observable<IExamDto> {
    return this.api.get("/user-exams/current")
      .map(this.mapUserExamDto);
  }

  getCurrentExamStep(examId: number): Observable<IExamStepWithData> {
    return this.api.get("/user-exams/" + examId + "/steps/current")
      // .map(responseData => responseData as IExamStepWithData)
  }

  submitExamStep(examId: number, stepSequence: number): Observable<any> {
    return this.api.get("/user-exams/" + examId + "/steps/" + stepSequence + "/submit")
  }

  verifyTestAnswer(examId: number,
                   stepSequence: number,
                   attemptId: number,
                   testAnswer: TestAnswer): Observable<VerifiedTestAnswer> {
    return this.api.post(
      '/user-exams/' + examId +
      '/steps/' + stepSequence +
      '/attempts/' + attemptId +
      '/tests/'+ testAnswer.testId + '/verify', testAnswer.submittedOptions)
        .map(r => new VerifiedTestAnswer(r.testId, r.isCorrectAnswer, r.mistakesAmount, r.answer))
  }

  getCurrentTaskFlowStep(examId: number,
                         examStepSequence: number,
                         attemptId: number,
                         taskFlowId: number): Observable<IExamTaskFlowStepData> {
    return this.api.get(
      '/user-exams/' + examId +
      '/steps/' + examStepSequence +
      '/attempts/' + attemptId +
      '/task-flows/'+ taskFlowId + '/steps/current')
      .map((r: ITaskFlowStepDto) => {
        let stepConf = r.taskFlowStepConf;
        let step = r.stepAttemptTaskFlowStep;
        return {
          id: step.id,
          type: stepConf.stepType,
          sequence: stepConf.sequence,
          name: stepConf.name,
          isHelpStep: stepConf.isHelpStep,
          data: JSON.parse(r.taskFlowStepData),
          helpSteps: r.helpSteps.map(s => { s.data = JSON.parse(s.data); return s; })
        }
      }
    )
  }

  verifyTaskFlowStepAnswer(examId: number,
                           examStepSequence: number,
                           examStepAttemptId: number,
                           taskFlowId: number,
                           taskFlowStepId: number,
                           answer: any): Observable<IVerifiedTaskFlowStepAnswer> {
    return this.api.post(
      '/user-exams/' + examId +
      '/steps/' + examStepSequence +
      '/attempts/' + examStepAttemptId +
      '/task-flows/'+ taskFlowId +
      '/steps/' + taskFlowStepId + '/verify', JSON.stringify(answer))
  }

  getResults(examId: number): Observable<ExamResult> {
    return this.http.get(this.withBase('/exam_results/' + examId))
      .map(HttpUtils.extractData)
      .catch(HttpUtils.handleError)
  }

  private mapUserExamDto(responseData: any): IExamDto {
    let userExam = responseData.userExam;
    let currentStepPreview = responseData.currentStepPreview;
    let examConf = responseData.examConf;
    return {
      id: userExam.id,
      name: examConf.name,
      description: examConf.description,
      status: userExam.status,
      lockedUntil: userExam.lockedUntil ? new Date(userExam.lockedUntil) : null,
      currentStep: {
        sequence: currentStepPreview.sequence,
        type: currentStepPreview.stepType,
        description: currentStepPreview.description
      }
    }
  }
}
