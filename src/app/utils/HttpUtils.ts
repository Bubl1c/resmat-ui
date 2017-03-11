import { Response } from "@angular/http";
import { Observable } from "rxjs";
import { Router } from "@angular/router";

export class ErrorResponse {
  constructor(public status: number,
              public statusText: string,
              public body: string,
              public errorCode: number,
              public url: string) {}
  public toString = (): string => {
    return `${this.status} - ${this.statusText || ''} :: ${this.errorCode} :: ${this.body || ''} :: ${this.url || ''}`
  }
}

export class HttpUtils {
  static baseUrl = "http://localhost:9000/v1";

  static withBase(path: string): string { return this.baseUrl + path }

  static extractData(res: Response) {
    let body = res.json();
    return body ? body.data || body : {};
  }
  static handleError (error: Response | any) {
    console.log("Handling error: ", error);
    let errorResponse: ErrorResponse;
    if (error instanceof Response) {
      const body = error.json() || '';
      const errMessage = body.message || JSON.stringify(body);
      const errCode = typeof  body.errorCode === 'number' ? body.errorCode : null;
      errorResponse = new ErrorResponse(error.status, error.statusText, errMessage, errCode, error.url);
    } else {
      errorResponse = new ErrorResponse(null, null, error.message ? error.message : error.toString(), null, null);
    }
    console.error(errorResponse);
    return Observable.throw(errorResponse);
  }
}
