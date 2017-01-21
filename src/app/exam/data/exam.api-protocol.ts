import { sequence } from "@angular/core";
export interface ITestAnswerData {
  id: number;
  answer: number[];
}

export class TestTypes {
  static Checkbox = 'checkbox';
  static Radio = 'radio';
  static all = [TestTypes.Checkbox, TestTypes.Radio]
}

export interface ITestData {
  id: number;
  question: string;
  options: ITestOptionData[];
  helpImg: string;
  type: string;
}

export interface ITestOptionData {
  id: number;
  value: string;
  type: string;
  checked: boolean;
}

export class ExamStepTypes {
  static Test = 'test';
  static TaskFlow = 'task-flow';
  static Results = 'results';
  static sequence = [ExamStepTypes.Test, ExamStepTypes.TaskFlow, ExamStepTypes.Results];
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
  currentStep: IExamStepData;
}

export interface IExamStepData {
  sequence: number;
  type: string;
  description: string
}
