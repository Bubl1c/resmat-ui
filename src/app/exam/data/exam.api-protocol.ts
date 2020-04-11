import { ITestSetConfDto } from "./test-set.api-protocol";
import { ITaskFlowConfDto } from "./task-flow.api-protocol";
import { ExamResult } from "../components/exam-results/exam-results.component";
import { IUserExamResult } from "../../steps/exam.results-step";

export type ExamStepType = 'test-set' | 'task-flow' | 'results'

export class ExamStepTypes {
  static TestSet: ExamStepType = 'test-set';
  static TaskFlow: ExamStepType = 'task-flow';
  static Results: ExamStepType = 'results';
  static sequence: ExamStepType[] = [ExamStepTypes.TestSet, ExamStepTypes.TaskFlow, ExamStepTypes.Results];
  static getNext(examStepType: ExamStepType): string {
    let index = this.sequence.indexOf(examStepType);
    let isLast = this.isLast(examStepType);
    if(index >= 0 && !isLast) {
      return this.sequence[index + 1];
    } else if(isLast){
      return null;
    } else {
      throw "Invalid ExamStepType passed: '" + examStepType + "'";
    }
  }
  static isLast(examStepType: ExamStepType): boolean {
    let index = this.sequence.indexOf(examStepType);
    return index === this.sequence.length - 1
  }
}

export interface IUserDto {
  id: number;
  name: string;
  exam: IExamDto;
}

export interface IExamDto {
  id: number;
  name: string;
  userId: number;
  description: string;
  status: string;
  lockedUntil: Date;
  currentStep: IExamStepPreview;
  result?: IUserExamResult
}

export interface IExamStepPreview {
  sequence: number;
  type: string;
  description: string
}

export interface IExamConf {
  id: number;
  name: string;
  description: string;
  maxScore: number;
}

export interface IExamConfDto {
  examConf: IExamConf
  stepConfs: IExamStepConf[]
}

export interface IExamConfCreateDto {
  examConf: IExamConf
  stepConfs: IExamStepConfCreateDto[]
}

export interface IExamConfUpdateDto {
  examConf: IExamConf
  stepConfs: IExamStepConfUpdateDto[]
}

export type IExamStepConfDataSet = IExamStepTestSetDataSet | IExamStepResultsDataSet | IExamStepTaskFlowDataSet

export interface IExamStepTestSetDataSet {
  ExamStepTestSetDataSet: {
    testSetConfId: number
  }
}

export interface IExamStepResultsDataSet {
  ExamStepResultsDataSet: {}
}

export interface IExamStepTaskFlowDataSet {
  ExamStepTaskFlowDataSet: {
    taskFlowConfId: number
    problemConfId: number
  }
}

export interface IExamStepConf {
  id: number;
  examConfId: number;
  sequence: number;
  name: string;
  stepType: ExamStepType;
  mistakesPerAttemptLimit: number;
  mistakeValuePercents: number; //influence to result
  attemptsLimit: number;
  attemptValuePercents: number; //influence to result
  maxScore: number; //should be within ExamConf.maxScore
  dataSet: IExamStepConfDataSet;
  hasToBeSubmitted: boolean
}

export type ExamStepDataConf =
  ExamStepDataConfTestSetConfDto |
  ExamStepDataConfTaskFlowConfDto |
  ExamStepDataConfResultsConf

export interface ExamStepDataConfTestSetConfDto {
  TestSetConfDto: ITestSetConfDto
}
export interface ExamStepDataConfTaskFlowConfDto {
  TaskFlowConfDto: ITaskFlowConfDto
}
export interface ExamStepDataConfResultsConf {
  ResultsConf: IResultsStepDataConf
}
export interface IResultsStepDataConf {
}

export interface IExamStepConfCreateDto {
  examStepConf: IExamStepConf
  stepDataConf: ExamStepDataConf
}

export interface IExamStepConfUpdateDto {
  examStepConf: IExamStepConf
  stepDataConf?: ExamStepDataConf
}

export interface IExamStepAttempt {
  id: number;
  userId: number;
  userExamId: number;
  examStepConfId: number;
  mistakesAmount: number;
  attemptNumber: number/*Starts with 1*/;
  status: string;
  stepVariantConfId: number;
  dataSetId: number
}

export interface IExamStepWithData {
  stepConf: IExamStepConf;
  attempt: IExamStepAttempt;
  stepData: any
}
