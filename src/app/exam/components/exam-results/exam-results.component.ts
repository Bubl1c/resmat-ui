import { Component, Input, OnInit } from "@angular/core";
import { ExamStepResultGenericInfo, IUserExamResult, IUserExamStepResult } from "../../../steps/exam.results-step";
import { TaskFlowDto } from "../../../steps/exam.task-flow-step";
import { TaskVariantData } from "../task/task.component";
import { TaskFlowStepTypes } from "../../data/task-flow.api-protocol";
import { TaskFlowStepUtils } from "../task/task-flow-step.utils";
import { ITestEditDto } from "../../data/test-set.api-protocol";

export const InfoTypes = {
  taskFlow: 'TaskFlowStepResultStepInfo',
  testSet: 'TestSetStepResultStepInfo'
};

export interface TaskFlowStepExamResultDto {
  id: number,
  name: string
  stepType: string //enum TaskFlowStepTypes
  data: any //json DrawingStepAnswer | DynamicTable
}

export interface TaskFlowExamStepResultInfoDto {
  data: TaskFlowStepExamResultDto[]
  variant: TaskFlowDto
}
export interface TaskFlowExamStepResultInfoData {
  data: TaskFlowStepExamResultDto[]
  variant: TaskVariantData
}

export interface UserExamStepAttemptTestSetTest {
  id: number
  stepAttemptTestSetId: number
  testConfId: number
  testConfSnapshot: ITestEditDto
  mistakeValue?: number
  done: boolean
  mistakes: number
}
export interface TestSetExamStepResultInfoDto {
  testSetTests: UserExamStepAttemptTestSetTest[]
}

export type ExamStepResultInfoDto = TaskFlowExamStepResultInfoDto | TestSetExamStepResultInfoDto

export type ExamStepResultInfoData = TaskFlowExamStepResultInfoData | TestSetExamStepResultInfoDto

export interface ExamStepResultInfo {
  type: string
  sequence: number
  name: string
  data: ExamStepResultInfoData
}

export class ExamStepResult {
  constructor(public sequence: number,
              public name: string,
              public attemptsAmount: number,
              public mistakesAmount: number,
              public durationMillis: number,
              public info?: ExamStepResultInfo) {
  }
}

export class ExamResult {
  constructor(public examId: number,
              public examName: string,
              public studentName: string,
              public studentGroupName: string,
              public durationMillis: number,
              public score: number,
              public maxScore: number,
              public stepResults: ExamStepResult[]) {
  }

  static create(dto: IUserExamResult): ExamResult {
    const getInfo = (data: ExamStepResultGenericInfo, sr: IUserExamStepResult): ExamStepResultInfo => {
      if (!data) {
        return null;
      }
      const objectType = Object.keys(data)[0];
      if (typeof objectType !== 'string') throw new Error(`Failed to parse exam result step generic info ${data}`);
      const infoDto = data[objectType];
      switch (objectType) {
        case InfoTypes.taskFlow:
          const stepData = infoDto as TaskFlowExamStepResultInfoDto;
          return {
            type: objectType,
            sequence: sr.sequence,
            name: sr.name,
            data: {
              data: stepData.data,
              variant: ExamResult.toTaskDataDto(stepData.variant)
            }
          };
        case InfoTypes.testSet:
          return {
            type: objectType,
            sequence: sr.sequence,
            name: sr.name,
            data: infoDto as TestSetExamStepResultInfoDto
          };
        default:
          return null;
      }
    };
    return new ExamResult(
      dto.userExamId,
      dto.examName,
      dto.studentName,
      dto.studentGroupName,
      dto.durationMillis,
      dto.score,
      dto.maxScore,
      dto.stepResults.map(r =>
        new ExamStepResult(r.sequence, r.name, r.attemptsAmount, r.mistakesAmount, r.durationMillis, getInfo(r.info, r))
      )
    )
  }

  static toTaskDataDto(taskFlowDto: TaskFlowDto): TaskVariantData {
    return {
      id: taskFlowDto.problemVariantConf.id,
      name: taskFlowDto.problemConf.name,
      description: "description",
      problemConf: taskFlowDto.problemConf,
      problemVariantConf: taskFlowDto.problemVariantConf
    }
  }

}

@Component({
  selector: 'exam-results',
  templateUrl: './exam-results.component.html',
  styleUrls: ['./exam-results.component.css']
})
export class ExamResultsComponent implements OnInit {
  @Input() data: ExamResult;
  @Input() showName: boolean = true;
  @Input() showTestDetailsInput: boolean = false;

  InfoTypes = InfoTypes;

  TaskFlowStepTypes = TaskFlowStepTypes;

  stepInfos: ExamStepResultInfo[] = [];

  duration: string;

  isOneStep: boolean;
  noSteps: boolean;

  showTaskDetails: boolean;
  showTestDetails: boolean;

  constructor() {
  }

  ngOnInit() {
    this.duration = this.durationToString(this.data.durationMillis);
    this.data.durationMillis = this.data.durationMillis * 5;
    this.data.durationMillis = this.data.durationMillis * 5;
    this.data.durationMillis = this.data.durationMillis * 5;
    this.isOneStep = this.data.stepResults.length === 1;
    this.noSteps = this.data.stepResults.length === 0;

    this.showTaskDetails = !!this.data.stepResults.find(sr => sr.info.type == InfoTypes.taskFlow);
    this.showTestDetails = this.showTestDetailsInput
      && !this.showTaskDetails
      && !!this.data.stepResults.find(sr => sr.info.type == InfoTypes.testSet);

    this.prepareStepInfos();
  }

  durationToString(millis: number): string {
    let x = millis / 1000;
    let seconds = x % 60;
    x /= 60;
    let minutes = x % 60;
    x /= 60;
    let hours = x % 24;
    x /= 24;
    let days = x;
    return this.str(days, "день", "днів")
      + this.str(hours, "година", "годин")
      + this.str(minutes, "хвилина", "хвилин")
      + this.str(seconds, "секунда", "секунд");
  }

  str(value: number, suffixOne: string, suffixMoreThanOne: string): string {
    let rounded = Math.floor(value);
    let roundedStr = (rounded > 0 ? rounded : "");
    let suffixStr = rounded === 1 ? suffixOne : suffixMoreThanOne;
    return roundedStr ? (roundedStr + " " + suffixStr + " ") : "";
  }

  prepareStepInfos() {
    this.stepInfos = this.data.stepResults.filter(sr => !!sr.info).map(sr => {
      let info = sr.info.data;
      switch (sr.info.type) {
        case InfoTypes.taskFlow:
          info = info as TaskFlowExamStepResultInfoData;
          info.variant.name = `Варіант ${String(info.variant.id)}`;
          info.data = info.data.map(stepData => {
            switch (stepData.stepType) {
              case TaskFlowStepTypes.DynamicTable:
                stepData.data = TaskFlowStepUtils.prepareDynamicTable(JSON.parse(stepData.data));
                break;
              case TaskFlowStepTypes.Drawing:
                stepData.data = TaskFlowStepUtils.prepareDrawingHelpStepData(JSON.parse(stepData.data));
                break;
              default:
                throw new Error(`Unsupported exam result task flow step type ${stepData.stepType}`)
            }
            return stepData;
          });
          break;
        case InfoTypes.testSet:
          info = info as TestSetExamStepResultInfoDto;
          let lastAttemptSequence = 1;
          let lastStepAttemptTestSetId = -1;
          info.testSetTests = info.testSetTests.reduce((acc, tst) => {
            if (!tst.testConfSnapshot) { // Legacy, we did not store testConfSnapshot previously
              this.showTestDetails = false;
            }
            if (lastStepAttemptTestSetId !== tst.stepAttemptTestSetId) {
              acc.push({
                id: lastAttemptSequence,
                stepAttemptTestSetId: -1,
                done: true,
                mistakes: -1,
                testConfId: -1,
                testConfSnapshot: undefined,
                isFakeToDisplayAttempt: true
              } as any);
              lastAttemptSequence++;
            }
            acc.push(tst);
            lastStepAttemptTestSetId = tst.stepAttemptTestSetId;
            return acc;
          }, [] as UserExamStepAttemptTestSetTest[]);
          break;
        default:
          throw new Error(`Unknown exam result step info type ${sr.info}`);
      }
      return sr.info
    })

  }

}
