import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptionsArgs, Response, RequestOptions } from "@angular/http";
import { HttpUtils } from "./utils/HttpUtils";
import { Observable } from "rxjs";
import { CurrentSession } from "./current-session";
import { Router } from "@angular/router";

@Injectable()
export class ApiService {

  constructor(private http: Http, private router: Router) {}

  that = this;

  get(path: string, options?: RequestOptionsArgs): Observable<any> {
    return this.http.get(HttpUtils.withBase(path), this.withDefaultHeaders(options))
      .map(HttpUtils.extractData)
      .catch(e => this.handleErrorWithUnauthorized(e, this.router))
  }

  post(path: string, body: any, options?: RequestOptionsArgs): Observable<any> {
    return this.http.post(HttpUtils.withBase(path), body, this.withDefaultHeaders(options))
      .map(HttpUtils.extractData)
      .catch(e => this.handleErrorWithUnauthorized(e, this.router))
  }

  put(path: string, body: any, options?: RequestOptionsArgs): Observable<any> {
    return this.http.put(HttpUtils.withBase(path), body, this.withDefaultHeaders(options))
      .map(HttpUtils.extractData)
      .catch(e => this.handleErrorWithUnauthorized(e, this.router))
  }

  delete(path: string, options?: RequestOptionsArgs): Observable<any> {
    return this.http.delete(HttpUtils.withBase(path), this.withDefaultHeaders(options))
      .map(HttpUtils.extractData)
      .catch(e => this.handleErrorWithUnauthorized(e, this.router))
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

  private handleErrorWithUnauthorized(error: Response | any, router: Router) {
    if(error.status === 401) {
      console.log("Access forbidden. Redirecting to login!");
      router.navigate(['/login'])
    }
    return HttpUtils.handleError(error)
  }
}
