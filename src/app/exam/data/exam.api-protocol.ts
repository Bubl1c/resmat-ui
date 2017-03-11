import { sequence } from "@angular/core";

//Remove
export interface ITestAnswerData {
  id: number;
  answer: number[];
}

export class TestTypes {
  static Checkbox = 'checkbox';
  static Radio = 'radio';
  static all = [TestTypes.Checkbox, TestTypes.Radio]
}

export interface ITestOptionDto {
  id: number;
  value: string;
  valueType: string;
}

export interface ITestDto {
  id: number;
  groupId: number;
  question: string;
  options: ITestOptionDto[];
  help: string;
  testType: string;
}

export class ExamStepTypes {
  static TestSet = 'test-set';
  static TaskFlow = 'task-flow';
  static Results = 'results';
  static sequence = [ExamStepTypes.TestSet, ExamStepTypes.TaskFlow, ExamStepTypes.Results];
  static getNext(examStepType: string): string {
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
  static isLast(examStepType: string): boolean {
    let index = this.sequence.indexOf(examStepType);
    return index === this.sequence.length - 1
  }
}

export interface IUserData {
  id: number;
  name: string;
  exam: IExamData;
}

export interface IExamData {
  id: number;
  name: string;
  description: string;
  currentStep: IExamStepPreview;
}

export interface IExamStepPreview {
  sequence: number;
  type: string;
  description: string
}

export interface IExamStepConf {
  id: number;
  examConfId: number;
  sequence: number;
  name: string;
  stepType: string;
  mistakesPerAttemptLimit: number;
  attemptsLimit: number
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
