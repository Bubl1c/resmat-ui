import { Injectable } from '@angular/core';
import { Http, Response } from "@angular/http";

import { Observable, ReplaySubject } from "rxjs/Rx";
import {
  ITestData, IExamData, ITestAnswerData, IUserData, IExamStepWithData
} from "./exam.api-protocol";
import { IExamTaskFlowStepData, TaskFlowStepTypes } from "./task-flow.api-protocol";
import { IExamTaskFlowTaskData } from "./i-exam-task-flow-task-data";
import { InputSetAnswer, VarirableAnswer } from "../components/input-set/input-set.component";
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

  getExamForUser(): Observable<IExamData> {
    return this.api.get("/user-exams/current")
      .map((responseData: any) => {
        if(responseData) {
          let userExam = responseData.userExam;
          let currentStepPreview = responseData.currentStepPreview;
          let examConf = responseData.examConf;
          return {
            id: userExam.id,
            name: examConf.name,
            description: examConf.description,
            currentStep: {
              sequence: currentStepPreview.sequence,
              type: currentStepPreview.stepType,
              description: currentStepPreview.description
            }
          }
        } else {
          return null;
        }
      });
  }

  getCurrentExamStep(userExamId: number): Observable<IExamStepWithData> {
    return this.api.get("/user-exams/" + userExamId + "/steps/current")
      // .map(responseData => responseData as IExamStepWithData)
  }

  getTests(): Observable<ITestData[]> {
    return this.http.get(this.withBase('/tests'))
      .map(HttpUtils.extractData)
      .catch(HttpUtils.handleError);
  }

  verifyTestAnswer(examId: number, stepSequence: number, attemptId: number, testAnswer: TestAnswer): Observable<VerifiedTestAnswer> {
    return this.api.post(
      '/user-exams/' + examId +
      '/steps/' + stepSequence +
      '/attempts/' + attemptId +
      '/tests/'+ testAnswer.testId + '/verify', testAnswer.submittedOptions)
        .map(r => new VerifiedTestAnswer(r.testId, r.isCorrectAnswer, r.mistakesAmount, r.answer))
  }

  getExamTask(examId: number): Observable<IExamTaskFlowTaskData> {
    return this.http.get(this.withBase('/exams/' + examId + '/task'))
      .map(HttpUtils.extractData)
      .catch(HttpUtils.handleError)
  }

  getResults(examId: number): Observable<ExamResult> {
    return this.http.get(this.withBase('/exam_results/' + examId))
      .map(HttpUtils.extractData)
      .catch(HttpUtils.handleError)
  }

  getExamTaskFlowStep(examId: number, taskId: number, stepSequence: number): Observable<IExamTaskFlowStepData> {
    return this.http.get(this.withBase('/task_steps/' + stepSequence))
      .map(HttpUtils.extractData)
      .catch(HttpUtils.handleError)
  }

  verifyTaskFlowStep(examId: number,
                     taskId: number,
                     stepSequence: number,
                     stepAnswer: any): Observable<any> {
    let resultSubject = new ReplaySubject<VerifiedTestAnswer>();

    this.http.get(this.withBase('/flow_step_answers/' + stepSequence))
      .map(HttpUtils.extractData)
      .catch(HttpUtils.handleError)
      .subscribe(
        {
          next: (fetchedAnswer: any) => {
            let stepType = fetchedAnswer.stepType;
            let verified = null;
            switch(stepType) {
              case TaskFlowStepTypes.Test:
                verified = this.verifyTestAnswerImpl(stepAnswer, fetchedAnswer.answer);
                break;
              case TaskFlowStepTypes.InputSet:
                verified = this.verifyInputSetAnswer(stepAnswer, fetchedAnswer);
                break;
              default: throw "Task flow step answer with invalid type received: '" + stepType + "'";
            }

            resultSubject.next(verified)
          },
          error: (error) => resultSubject.error(`Error while fetching flow test answer with id [${stepAnswer.testId}]. Cause: ${error}`)
        }
      );
    return resultSubject
  }

  private verifyInputSetAnswer(answer: InputSetAnswer, correctAnswer: any): InputSetAnswer {
    console.log("Verifying is answer: ", correctAnswer);
    let correctVariableAnswers: VarirableAnswer[] = correctAnswer.answer;
    let isAllCorrect = true;
    answer.variableAnswers.forEach(va => {
      let correctValue = correctVariableAnswers.find(cva => cva.variableId == va.variableId);
      va.correct =
        typeof correctValue === 'undefined'
          ? false
          : this.isEqual(correctValue.value, va.value, 5);
      if(!va.correct) isAllCorrect = false
    });
    answer.allCorrect = isAllCorrect;
    return answer;
  }

  private isEqual(v1: number | null, v2: number | null, acuracy: number): boolean {
    if(v1 == null && v2 == null) return true;

    let roundOrNull = (v: number | null): string | null => {
      if(v == null) return null;
      return VarirableAnswer.roundToFixed(v, acuracy)
    };

    return roundOrNull(v1) === roundOrNull(v2);
  }

  private verifyTestAnswerImpl(testAnswer: TestAnswer, fetchedAnswer: ITestAnswerData): VerifiedTestAnswer {
    let verifiedOptions = {};
    //Make sure that amount of submitted answers equals to amount of correct ones
    let isAllCorrect = fetchedAnswer.answer.length === testAnswer.submittedOptions.length;
    if(isAllCorrect) {
      //Verify that every submitted answer is correct
      fetchedAnswer.answer.forEach(currentOption => {
        if(testAnswer.submittedOptions.indexOf(currentOption) === -1) isAllCorrect = false;
      });
    }
    //Mark submitted answers as correct or not
    testAnswer.submittedOptions.forEach(currentOption => {
      verifiedOptions[currentOption] = fetchedAnswer.answer.indexOf(currentOption) !== -1
    });

    return new VerifiedTestAnswer(testAnswer.testId, isAllCorrect, -1/*Stub*/, verifiedOptions);
  }
}
