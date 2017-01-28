import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptionsArgs, Response, RequestOptions } from '@angular/http';
import { HttpUtils } from "./utils/HttpUtils";
import { Observable } from "rxjs";
import { CurrentSession } from "./current-session";

@Injectable()
export class ApiService {

  constructor(private http: Http) {}

  get(path: string, options?: RequestOptionsArgs): Observable<any> {
    return this.http.get(HttpUtils.withBase(path), this.withDefaultHeaders(options))
      .map(HttpUtils.extractData)
      .catch(HttpUtils.handleError)
  }

  post(path: string, body: any, options?: RequestOptionsArgs): Observable<any> {
    return this.http.post(HttpUtils.withBase(path), body, this.withDefaultHeaders(options))
      .map(HttpUtils.extractData)
      .catch(HttpUtils.handleError)
  }

  put(path: string, body: any, options?: RequestOptionsArgs): Observable<any> {
    return this.http.put(HttpUtils.withBase(path), body, this.withDefaultHeaders(options))
      .map(HttpUtils.extractData)
      .catch(HttpUtils.handleError)
  }

  private withDefaultHeaders(options?: RequestOptionsArgs): RequestOptionsArgs {
    options = options || new RequestOptions();
    options.headers = options.headers || new Headers();
    if(CurrentSession.token) {
      options.headers.append('Token', CurrentSession.token);
    }
    options.headers.append('Content-Type', 'application/json');
    return options;
  }
}
