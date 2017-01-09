import { Injectable } from '@angular/core';
import { Http, Response } from "@angular/http";

import { Observable } from "rxjs/Rx";
import { ITest, IExam } from "./exam.model";
import { hardcoded_tests } from "./exam.hardcoded.data";

@Injectable()
export class ExamService {

  private apiUrl: string = 'api/exams';

  constructor(private http: Http) { }

  getTests(): Observable<ITest[]> {
    // return Observable
    //   .create(observer => {
    //     console.log("Fetching hardcoded tests");
    //     observer.next(hardcoded_tests)
    //   })
    //   .delay(3000);
    return this.http.get('api/tests')
      .map(this.extractData)
      .catch(this.handleError);
  }

  getExams (): Observable<IExam[]> { //TODO: beware duplicate requests
    return this.http.get(this.apiUrl)
      .map(this.extractData)
      .catch(this.handleError);
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
