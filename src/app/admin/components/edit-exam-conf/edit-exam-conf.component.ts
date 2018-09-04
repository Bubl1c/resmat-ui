import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import {
  ExamStepDataConf,
  ExamStepTypes,
  IExamConfDto,
  IExamStepConf, IExamStepConfDataSet, IExamStepResultsDataSet, IExamStepTaskFlowDataSet,
  IExamStepTestSetDataSet, IResultsStepDataConf
} from "../../../exam/data/exam.api-protocol";
import { defaultExamStepConfInstance, newTestSetConfDto, resultsExamStepConfInstance } from "./examConfConstants";
import { DropdownOption } from "../../../components/dropdown/dropdown.component";
import { ApiService } from "../../../api.service";
import { ITestSetConfDto } from "../../../exam/data/test-set.api-protocol";
import { Observable } from "rxjs/Observable";
import { TestConfService } from "../../data/test-conf.service";
import { ITestGroupConf } from "../test-group-list/test-group-list.component";
import { IProblemConf } from "../problem-conf/problem-conf.component";
import { ITaskFlowConfDto, ITaskFlowStepConf } from "../../../exam/data/task-flow.api-protocol";

@Component({
  selector: 'edit-exam-conf',
  templateUrl: './edit-exam-conf.component.html',
  styleUrls: ['./edit-exam-conf.component.css']
})
export class EditExamConfComponent implements OnInit, OnChanges {

  @Input() data: IExamConfDto;
  @Input() isSaving: boolean = false;

  @Output() onSave = new EventEmitter<IExamConfDto>();

  stepConfWorkspaces: IStepConfWorkspace[];

  isCreateMode: boolean;

  constructor(private api: ApiService, private tcService: TestConfService) {
  }

  ngOnInit() {
    this.init()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["data"]) {
      this.init()
    }
  }

  save() {
    this.onSave.emit(this.data)
  }

  //has to be a lambda to pass it as a parameter
  createNewDefaultStepConfWorkspace = (sequence: number) => {
    this.createStepConfWorkspace(defaultExamStepConfInstance(sequence))
  };

  private initialiseStepConfWorkspaces() {
    this.stepConfWorkspaces = this.data.stepConfs.map(sc => this.createStepConfWorkspace(sc))
  }

  private createStepConfWorkspace(stepConf: IExamStepConf): IStepConfWorkspace {
    switch (stepConf.stepType) {
      case ExamStepTypes.TestSet:
        return new TestSetConfStepWorkspace(this.api, this.tcService, stepConf);
      case ExamStepTypes.TaskFlow:
        return new TaskFlowConfStepWorkspace(this.api, stepConf);
      case ExamStepTypes.Results:
        return new ResultsConfStepWorkspace(this.api, stepConf);
      default:
        alert("Невідомий крок: " + JSON.stringify(stepConf));
        throw new Error("Невідомий крок: " + JSON.stringify(stepConf));
    }
  }

  private init() {
    if (!this.data.examConf.id) {
      this.isCreateMode = true;
      this.data.stepConfs = [
        defaultExamStepConfInstance(1),
        resultsExamStepConfInstance(2)
      ]
    }
    this.initialiseStepConfWorkspaces();
  }

}

export abstract class IStepConfWorkspace {

  dataSet: IExamStepConfDataSet;
  stepData: ExamStepDataConf;
  isLoading: boolean = false;

  constructor(public stepConf: IExamStepConf) {
  }

  loadData: () => void

}

export class TestSetConfStepWorkspace extends IStepConfWorkspace {
  dataSet: IExamStepTestSetDataSet;

  testGroupConfDropdownOptions: DropdownOption[];
  stepData: ITestSetConfDto;

  constructor(private api: ApiService, private tcService: TestConfService, public stepConf: IExamStepConf) {
    super(stepConf);
    this.dataSet = stepConf.dataSet as IExamStepTestSetDataSet;
  }

  loadData = (): void => {
    if (this.stepConf.id > 0) { // if it is not new step
      this.isLoading = true;
      Observable.forkJoin(
        this.api.get(
          `/test-set-confs/${this.dataSet.ExamStepTestSetDataSet.testSetConfId}`
        ),
        this.tcService.getTestGroupConfs()
      ).subscribe(results => {
        this.stepData = results[0] as ITestSetConfDto;

        let testGroupConfs: ITestGroupConf[] = results[1];
        this.testGroupConfDropdownOptions = testGroupConfs.map(tgc => new DropdownOption(tgc.id, tgc.name));

        this.isLoading = false;
      }, error => {
        alert("Не вдалося завантажити дані для набору тестів: " + JSON.stringify(error));
        this.isLoading = false;
      });
    } else {
      this.tcService.getTestGroupConfs().subscribe(testGroupConfs => {
        this.testGroupConfDropdownOptions = testGroupConfs.map(tgc => new DropdownOption(tgc.id, tgc.name));
        this.stepData = newTestSetConfDto()
      })
    }
  }

}

export class TaskFlowConfStepWorkspace extends IStepConfWorkspace {
  dataSet: IExamStepTaskFlowDataSet;

  stepData: ITaskFlowConfDto;
  problemConf: IProblemConf;

  constructor(private api: ApiService, public stepConf: IExamStepConf) {
    super(stepConf);
    this.dataSet = stepConf.dataSet as IExamStepTaskFlowDataSet;
  }

  loadData = (): void => {
    Observable.forkJoin(
      this.api.get(
        `/task-flow-confs/${this.dataSet.ExamStepTaskFlowDataSet.taskFlowConfId}`
      ),
      this.api.get(
        `/problem-confs/${this.dataSet.ExamStepTaskFlowDataSet.problemConfId}`
      )
    ).subscribe(results => {
      this.stepData = results[0];
      this.problemConf = results[1];
      this.isLoading = false;
    }, error => {
      alert("Не вдалося завантажити дані для задачі: " + JSON.stringify(error));
      this.isLoading = false;
    })
  }

}

export class ResultsConfStepWorkspace extends IStepConfWorkspace {
  dataSet: IExamStepResultsDataSet;

  stepData: IResultsStepDataConf;

  constructor(private api: ApiService, public stepConf: IExamStepConf) {
    super(stepConf);
    this.dataSet = stepConf.dataSet as IExamStepResultsDataSet;
  }

  loadData = (): void => {
    this.stepData = {}
  }

}
