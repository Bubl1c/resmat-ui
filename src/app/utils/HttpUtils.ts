import { Response } from "@angular/http";
import { Observable } from "rxjs";

export class HttpUtils {
  static baseUrl = "http://localhost:9000/v1";

  static withBase(path: string): string { return this.baseUrl + path }

  static extractData(res: Response) {
    let body = res.json();
    return body ? body.data || body : {};
  }
  static handleError (error: Response | any) {
    console.log("Handling error: ", error);
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
