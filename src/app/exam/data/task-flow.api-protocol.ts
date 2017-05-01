export interface ISchemaVar {
  name: string;
  value: string;
  units: string;
  alias: string;
  showInExam: boolean;
}

export class TaskFlowStepTypes {
  static Test = 'test';
  static InputSet = 'input-set';
  static Charts = 'charts';
  static Finished = 'finished';
  static Loading = 'loading';
}

export interface IExamTaskFlowStepData {
  id: number;
  type: string;
  sequence: number;
  name: string;
  isHelpStep: boolean;
  data: any;
}

export interface IUserExamStepAttemptTaskFlowStep {
  id: number;
  stepAttemptTaskFlowId: number;
  taskFlowStepConfId: number;
  done: boolean;
  mistakes: number;
}

export interface ITaskFlowStepConf {
  id: number;
  taskFlowConfId: number;
  name: string;
  sequence: number;
  isHelpStep: boolean;
  stepType: string;
  stepData: string
}

export interface ItaskFlowStepDto {
  taskFlowStepConf: ITaskFlowStepConf;
  stepAttemptTaskFlowStep: IUserExamStepAttemptTaskFlowStep;
  taskFlowStepData: any
}

export interface IVerifiedTaskFlowStepAnswer {
  isCorrectAnswer: boolean;
  mistakesAmount: number;
  answer: string
}
