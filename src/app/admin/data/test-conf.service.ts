import { Injectable } from '@angular/core';
import { ApiService } from "../../api.service";
import { ITestGroupConf } from "../components/test-group-list/test-group-list.component";
import { Observable } from "rxjs/Observable";
import { ITestEditDto } from "../../exam/data/test-set.api-protocol";

export class DataCache<T> {
  private data: T;
  private loadingObservable: Observable<T>;

  constructor() {
  }

  private isEmpty(): boolean {
    return !!(this.data || this.loadingObservable)
  }

  private getDataOrLoadingObservable(): Observable<T> {
    return this.loadingObservable || Observable.of(this.data)
  }

  getOrLoad(loadFunc: () => Observable<T>, forceReload: boolean = false): Observable<T> {
    if (forceReload || this.isEmpty()) {
      return loadFunc().map(loadedData => {
        this.data = loadedData;
        return loadedData
      })
    } else {
      this.getDataOrLoadingObservable()
    }
  }
}

@Injectable()
export class TestConfService {

  private cachedTestGroups = new DataCache<ITestGroupConf[]>();

  constructor(private api: ApiService) { }

  createTestGroupConf(data: ITestGroupConf): Observable<ITestGroupConf> {
    return this.api.post("/test-groups", data)
  }

  updateTestGroupConf(id: number, data: ITestGroupConf): Observable<ITestGroupConf> {
    return this.api.put(`/test-groups/${id}`, data)
  }

  getTestGroupConfs(reload: boolean = false, isArchived?: boolean): Observable<ITestGroupConf[]> {
    if (typeof isArchived !== "undefined") {
      return this.cachedTestGroups.getOrLoad(
        () => this.api.get(`/test-groups?isArchived=${isArchived}`),
        reload
      )
    } else {
      return this.cachedTestGroups.getOrLoad(
        () => this.api.get(`/test-groups`),
        reload
      )
    }
  }

  createTestConf(testGroupConfId: number, data: ITestEditDto): Observable<ITestEditDto> {
    return this.api.post(
      "/test-groups/" + testGroupConfId + "/tests", data
    )
  }

  updateTestConf(testGroupConfId: number, testConfId: number, data: ITestEditDto): Observable<ITestEditDto> {
    return this.api.put(
      "/test-groups/" + testGroupConfId + "/tests/" + testConfId, data
    )
  }

  bulkUpdateTestConfs(testGroupConfId: number, data: ITestEditDto[]): Observable<ITestEditDto[]> {
    return this.api.put(
      "/test-groups/" + testGroupConfId + "/tests", data
    )
  }

  deleteTestConf(testGroupConfId: number, testConfId: number): Observable<void> {
    return this.api.delete(`/test-groups/${testGroupConfId}/tests/${testConfId}`)
  }

  getTestConfsByTestGroupConfId(testGroupConfId: number): Observable<ITestEditDto[]> {
    return this.api.get(`/test-groups/${testGroupConfId}/tests`)
  }

}
