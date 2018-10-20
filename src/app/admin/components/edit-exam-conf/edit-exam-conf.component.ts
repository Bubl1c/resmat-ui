import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import {
  ExamStepDataConf, ExamStepDataConfResultsConf, ExamStepDataConfTaskFlowConfDto, ExamStepDataConfTestSetConfDto,
  ExamStepType,
  ExamStepTypes, IExamConfCreateDto,
  IExamConfDto, IExamConfUpdateDto,
  IExamStepConf, IExamStepConfDataSet, IExamStepResultsDataSet, IExamStepTaskFlowDataSet,
  IExamStepTestSetDataSet, IResultsStepDataConf
} from "../../../exam/data/exam.api-protocol";
import {
  newDefaultExamStepConfInstance, newTaskFlowConfDto, newTestSetConfDto,
  newResultsExamStepConfInstance
} from "./examConfConstants";
import { DropdownOption } from "../../../components/dropdown/dropdown.component";
import { ApiService } from "../../../api.service";
import { ITestSetConfDto, TestType } from "../../../exam/data/test-set.api-protocol";
import { Observable } from "rxjs/Observable";
import { TestConfService } from "../../data/test-conf.service";
import { ITestGroupConf } from "../test-group-list/test-group-list.component";
import { IProblemConf } from "../problem-conf/problem-conf.component";
import { ITaskFlowConfDto } from "../../../exam/data/task-flow.api-protocol";
import { GoogleAnalyticsUtils } from "../../../utils/GoogleAnalyticsUtils";
import { RMU } from "../../../utils/utils";

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
    if (!this.isValid()) {
      return;
    }
    this.isSaving = true;
    this.stepConfWorkspaces.forEach(w => w.normaliseData());
    if (this.data.examConf.id > 0) {
      let toSave: IExamConfUpdateDto = {
        examConf: this.data.examConf,
        stepConfs: this.stepConfWorkspaces.map(w => ({
          examStepConf: w.stepConf,
          stepDataConf: w.stepData || undefined
        }))
      };
      this.api.put(`/exam-confs/${this.data.examConf.id}`, toSave).subscribe({
        next: updated => {
          this.requestComplete();
          RMU.safe(() => {
            GoogleAnalyticsUtils.event("Admin", `Edited exam ${updated.id}`, "EditExamConf", updated.id);
          });
          alert("Успішно збережено");
          this.onSave.emit(updated);
        },
        error: e => {
          this.requestComplete();
          alert("Не вдалося зберегти: " + JSON.stringify(e))
        }
      })
    } else {
      let toSave: IExamConfCreateDto = {
        examConf: this.data.examConf,
        stepConfs: this.stepConfWorkspaces.map(w => ({
          examStepConf: w.stepConf,
          stepDataConf: w.stepData
        }))
      };
      this.api.post(`/exam-confs`, toSave).subscribe({
        next: created => {
          this.requestComplete();
          RMU.safe(() => {
            GoogleAnalyticsUtils.event("Admin", `Created exam ${created.examConf.id} "${created.examConf.name}"`, "CreateExamConf", created.examConf.id);
          });
          alert("Успішно збережено");
          this.onSave.emit(created);
        },
        error: e => {
          this.requestComplete();
          alert("Не вдалося зберегти: " + JSON.stringify(e))
        }
      })
    }
  }

  private isValid(): boolean {
    let errors: string[] = []
    if (this.data.examConf.maxScore <= 0) {
      errors.push("Максимальна оцінка має бути більше нуля")
    }
    if (!this.data.examConf.name) {
      errors.push("Ім'я іспиту не може бути пустим")
    }
    this.stepConfWorkspaces.forEach(w => {
      if (w.stepConf.stepType === ExamStepTypes.Results) {
        return;
      }
      let e = (msg: string) => {
        errors.push(`Крок ${w.stepConf.sequence}: ${msg}`)
      };
      if (!w.stepConf.name) {
        e("Ім'я кроку не може бути пустим")
      }
      if (w.stepConf.maxScore <= 0) {
        e("Максимальна оцінка кроку має бути більше нуля")
      }
      if (w.stepConf.attemptValuePercents < 0) {
        e("Вплив нової спроби на помилку має бути >= нуля")
      }
      if (w.stepConf.mistakeValuePercents < 0) {
        e("Вплив помилки на результат має бути >= нуля")
      }
      if (w.stepData) {
        switch (w.stepConf.stepType) {
          case ExamStepTypes.TestSet:
            let stepData: ExamStepDataConfTestSetConfDto = w.stepData as ExamStepDataConfTestSetConfDto;
            if (stepData.TestSetConfDto.testSetConf.maxTestsAmount <= 0) {
              e("Максимальна кількість тестів в наборі має бути більше нуля")
            }
            if (stepData.TestSetConfDto.testGroups.length < 1) {
              e("Набір тестів має формуватись хоча б з однієї групи")
            }
            stepData.TestSetConfDto.testGroups.forEach((g, index) => {
              if (g.proportionPercents <= 0) {
                e(`Група ${index}: Відсоток тестів у наборі має бути більше нуля`)
              }
            })
        }
      }
    });
    if (errors.length === 0) {
      return true
    } else {
      alert("Виправте наступні помилки:\n" + errors.join("\n"))
    }
  }

  private requestComplete() {
    this.isSaving = false
  }

  //has to be a lambda to pass it as a parameter
  createNewDefaultStepConfWorkspace = (sequence: number) => {
    return this.createStepConfWorkspace(newDefaultExamStepConfInstance(sequence))
  };

  private initialiseStepConfWorkspaces() {
    this.stepConfWorkspaces = this.data.stepConfs.map(sc => this.createStepConfWorkspace(sc))
  }

  private createStepConfWorkspace(stepConf: IExamStepConf): IStepConfWorkspace {
    let workspace: IStepConfWorkspace;
    switch (stepConf.stepType) {
      case ExamStepTypes.TestSet:
        workspace = new TestSetConfStepWorkspace(this.api, this.tcService, stepConf);
        break;
      case ExamStepTypes.TaskFlow:
        workspace = new TaskFlowConfStepWorkspace(this.api, stepConf);
        break;
      case ExamStepTypes.Results:
        workspace = new ResultsConfStepWorkspace(this.api, stepConf);
        break;
      default:
        alert("Невідомий крок: " + JSON.stringify(stepConf));
        throw new Error("Невідомий крок: " + JSON.stringify(stepConf));
    }
    if (!stepConf.id || stepConf.id < 0) {
      workspace.loadData(); // initialise stepData for the newly created workspace
    }
    return workspace
  }

  private init() {
    if (!this.data.examConf.id || this.data.examConf.id < 0) {
      this.isCreateMode = true;
    } else {
      this.isCreateMode = false;
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

  loadData: () => void;

  normaliseData: () => void = () => {}

}

export class TestSetConfStepWorkspace extends IStepConfWorkspace {
  dataSet: IExamStepTestSetDataSet;

  testGroupConfDropdownOptions: DropdownOption[];
  stepData: ExamStepDataConfTestSetConfDto;

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
        this.stepData = {
          TestSetConfDto: results[0] as ITestSetConfDto
        };

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
        this.stepData = {
          TestSetConfDto: newTestSetConfDto()
        }
      })
    }
  };

  normaliseData = () => {
    if (this.stepData) {
      this.stepData.TestSetConfDto.testGroups.forEach(tg => {
        tg.mistakeValue = tg.mistakeValue || undefined
      })
    }
  }

}

export class TaskFlowConfStepWorkspace extends IStepConfWorkspace {
  dataSet: IExamStepTaskFlowDataSet;

  stepData: ExamStepDataConfTaskFlowConfDto;
  problemConf: IProblemConf;

  constructor(private api: ApiService, public stepConf: IExamStepConf) {
    super(stepConf);
    this.dataSet = stepConf.dataSet as IExamStepTaskFlowDataSet;
  }

  loadData = (): void => {
    if (this.stepConf.id > 0) { // if it is not new step
      Observable.forkJoin(
        this.api.get(
          `/task-flow-confs/${this.dataSet.ExamStepTaskFlowDataSet.taskFlowConfId}`
        ),
        this.api.get(
          `/problem-confs/${this.dataSet.ExamStepTaskFlowDataSet.problemConfId}`
        )
      ).subscribe(results => {
        this.stepData = {
          TaskFlowConfDto: results[0] as ITaskFlowConfDto
        };
        this.problemConf = results[1];
        this.isLoading = false;
      }, error => {
        alert("Не вдалося завантажити дані для задачі: " + JSON.stringify(error));
        this.isLoading = false;
      })
    } else {
      this.stepData = {
        TaskFlowConfDto: newTaskFlowConfDto()
      }
    }
  }

}

export class ResultsConfStepWorkspace extends IStepConfWorkspace {
  dataSet: IExamStepResultsDataSet;

  stepData: ExamStepDataConfResultsConf;

  constructor(private api: ApiService, public stepConf: IExamStepConf) {
    super(stepConf);
    this.dataSet = stepConf.dataSet as IExamStepResultsDataSet;
  }

  loadData = (): void => {
    this.stepData = {
      ResultsConf: {}
    }
  }

}
