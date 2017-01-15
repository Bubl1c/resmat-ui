import { Injectable } from '@angular/core';
import { Http, Response } from "@angular/http";

import { Observable, ReplaySubject } from "rxjs/Rx";
import {
  ITestData, IExamData, ITestAnswerData, IUserData
} from "./exam.api-protocol";
import { IExamTaskFlowStepData } from "./task-flow.api-protocol";
import { IExamTaskFlowTaskData } from "./i-exam-task-flow-task-data";

export class VerifiedTestAnswer {
  constructor(public testId: number,
              public isAllCorrect: boolean,
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

  private apiBaseUrl: string = 'api';

  private withBase(path: string): string { return this.apiBaseUrl + path }

  constructor(private http: Http) { }

  getExamForUser(userId: string): Observable<IExamData> {
    return this.http.get(this.withBase('/users/' + userId + '/exam'))
      .map(this.extractData)
      .map((userData: IUserData) => userData.exam)
      .catch(this.handleError);
  }

  getTests(): Observable<ITestData[]> {
    return this.http.get(this.withBase('/tests'))
      .map(this.extractData)
      .catch(this.handleError);
  }

  verifyTestAnswer(testAnswer: ITestAnswerData): Observable<VerifiedTestAnswer> {
    let resultSubject = new ReplaySubject<VerifiedTestAnswer>();

    this.http.get(this.withBase('/test_answers/'+ testAnswer.id))
      .map(this.extractData)
      .catch(this.handleError)
      .subscribe(
        {
          next: (fetchedAnswers: ITestAnswerData[]) => {
            if(fetchedAnswers.length === 0) {
              resultSubject.error(`Test with id [${testAnswer.id}] was not found`)
              return resultSubject;
            }
            let fetchedAnswer = fetchedAnswers[0];
            let verifiedOptions = {};
            //Make sure that amount of submitted answers equals to amount of correct ones
            let isAllCorrect = fetchedAnswer.answer.length === testAnswer.answer.length;
            if(isAllCorrect) {
              //Verify that every submitted answer is correct
              fetchedAnswer.answer.forEach(currentOption => {
                if(testAnswer.answer.indexOf(currentOption) === -1) isAllCorrect = false;
              });
            }
            //Mark submitted answers as correct or not
            testAnswer.answer.forEach(currentOption => {
              verifiedOptions[currentOption] = fetchedAnswer.answer.indexOf(currentOption) !== -1
            });
            resultSubject.next(new VerifiedTestAnswer(testAnswer.id, isAllCorrect, verifiedOptions))
          },
          error: (error) => resultSubject.error(`Error while fetching test with id [${testAnswer.id}]. Cause: ${error}`)
        }
      );

    return resultSubject
  }

  getExamTask(examId: number): Observable<IExamTaskFlowTaskData> {
    return this.http.get(this.withBase('/exams/' + examId + '/task'))
      .map(this.extractData)
      .catch(this.handleError)
  }

  getExamTaskFlowStep(examId: number, taskId: number, stepSequence: number): Observable<IExamTaskFlowStepData> {
    return this.http.get(this.withBase('/task_steps/' + stepSequence))
      .map(this.extractData)
      .catch(this.handleError)
  }

  private extractData(res: Response) {
    let body = res.json();
    return body.data || { };
  }
  private handleError (error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
