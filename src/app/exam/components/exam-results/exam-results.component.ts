import { Component, OnInit, Input } from "@angular/core";
import { ExamStepResultGenericInfo, IUserExamResult } from "../../../steps/exam.results-step";
import { TaskDataUtils, TaskFlowDto } from "../../../steps/exam.task-flow-step";
import { TaskVariantData } from "../task/task.component";
import { DynamicTable } from "../dynamic-table/dynamic-table.component";
import { SmartValue } from "../smart-value/smart-value.component";

export const InfoTypes = {
  taskFlow: 'TaskFlowStepResultStepInfo'
};

export interface TaskFlowStepExamResultDto {
  id: number,
  name: string
  stepType: string //enum
  data: DynamicTable //json
}

export interface TaskFlowExamStepResultInfoDto {
  data: TaskFlowStepExamResultDto[]
  variant: TaskFlowDto
}

export interface TaskFlowExamStepResultInfoData {
  data: TaskFlowStepExamResultDto[]
  variant: TaskVariantData
}

export type ExamStepResultInfoDto = TaskFlowExamStepResultInfoDto

export type ExamStepResultInfoData = TaskFlowExamStepResultInfoData

export interface ExamStepResultInfo {
  type: string
  data: ExamStepResultInfoData
}

export class ExamStepResult {
  constructor(public sequence: number,
              public name: string,
              public attemptsAmount: number,
              public mistakesAmount: number,
              public durationMillis: number,
              public info?: ExamStepResultInfo) {}
}

export class ExamResult {
  constructor(public examId: number,
              public examName: string,
              public studentName: string,
              public studentGroupName: string,
              public durationMillis: number,
              public score: number,
              public maxScore: number,
              public stepResults: ExamStepResult[]) {}
  static create(dto: IUserExamResult): ExamResult {
    const getInfo = (data: ExamStepResultGenericInfo): ExamStepResultInfo => {
      if(!data) {
        return null;
      }
      const objectType = Object.keys(data)[0];
      if(typeof objectType !== 'string') throw new Error(`Failed to parse exam result step generic info ${data}`);
      const infoDto = data[objectType];
      return {
        type: objectType,
        data: {
          data: infoDto.data,
          variant: ExamResult.toTaskDataDto(infoDto.variant)
        }
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
        new ExamStepResult(r.sequence, r.name, r.attemptsAmount, r.mistakesAmount, r.durationMillis, getInfo(r.info))
      )
    )
  }
  static toTaskDataDto(taskFlowDto: TaskFlowDto): TaskVariantData {
    return {
      id: taskFlowDto.problemVariantConf.id,
      name: taskFlowDto.problemConf.name,
      schemaUrl: taskFlowDto.problemVariantConf.schemaUrl,
      schemaVars: TaskDataUtils.mapVariables(
        taskFlowDto.problemConf.inputVariableConfs,
        taskFlowDto.problemVariantConf.inputVariableValues
      ),
      description: "description"
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

  InfoTypes = InfoTypes;

  stepInfos: ExamStepResultInfo[];

  duration: string;

  isOneStep: boolean;
  noSteps: boolean;

  constructor() { }

  ngOnInit() {
    this.duration = this.durationToString(this.data.durationMillis);
    this.data.durationMillis = this.data.durationMillis * 5;
    this.data.durationMillis = this.data.durationMillis * 5;
    this.data.durationMillis = this.data.durationMillis * 5;
    this.isOneStep = this.data.stepResults.length === 1;
    this.noSteps = this.data.stepResults.length === 0;
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
      switch(sr.info.type) {
        case InfoTypes.taskFlow:
          info = info as TaskFlowExamStepResultInfoData;
          info.variant.name = `Варіант ${String(info.variant.id)}`;
          info.data = info.data.map(stepData => {
            stepData.data = JSON.parse(stepData.data as any);
            stepData.data.rows.forEach(r => {
              r.cells = r.cells.map(c => SmartValue.fromContainer(c as any))
            });
            return stepData;
          });
          break;
        default:
          throw new Error(`Unknown exam result step info type ${sr.info}`);
      }
      return sr.info
    })
  }

}
