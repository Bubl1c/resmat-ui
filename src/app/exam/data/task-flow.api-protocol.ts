import { ITestEditDto } from "./test-set.api-protocol";

export interface ISchemaVar {
  name: string;
  value: string;
  units: string;
  alias: string;
  showInExam: boolean;
  variableGroup: string;
}

export class TaskFlowStepTypes {
  static Test = 'test';
  static InputSet = 'input-set';
  static GroupedInputSet = 'grouped-input-set';
  static VariableValueSet = 'var-value-set';
  static EquationSet = 'equation-set';
  static Charts = 'charts';
  static DynamicTable = 'dynamic-table';
  static Drawing = 'drawing';
  static EquationSetHelp = 'equation-set-help';
  static Finished = 'finished';
  static Loading = 'loading';
}

//-------------------Task Flow Conf

export interface ITaskFlowConf {
  id: number
  problemConfId: number
  name: string
}

export interface ITaskFlowConfDto {
  taskFlowConf: ITaskFlowConf
  taskFlowSteps: ITaskFlowStepConf[]
}

//-------------------Step Conf

export interface ITaskFlowStepConf {
  id: number;
  taskFlowConfId: number;
  name: string;
  sequence: number;
  isHelpStep: boolean;
  stepType: string;
  stepData: string //TaskFlowStepData
}

export type TaskFlowStepData = ITaskFlowTestConf

export interface ITaskFlowTestConf {
  testConf: ITestEditDto,
  correctOptionIdsMapping?: string
}

export interface ITaskFlowHelpStepDto {
  name: string;
  id: number
  stepType: string
  data: any
}

//-------------------Exam step

export interface ITaskFlowStepDto {
  taskFlowStepConf: ITaskFlowStepConf;
  stepAttemptTaskFlowStep: IUserExamStepAttemptTaskFlowStep;
  taskFlowStepData: any
  helpSteps: ITaskFlowHelpStepDto[]
}

export interface IExamTaskFlowStepData {
  id: number;
  type: string;
  sequence: number;
  name: string;
  isHelpStep: boolean;
  data: any;
  helpSteps: ITaskFlowHelpStepDto[]
}

export interface IUserExamStepAttemptTaskFlowStep {
  id: number;
  stepAttemptTaskFlowId: number;
  taskFlowStepConfId: number;
  done: boolean;
  mistakes: number;
}

export interface IVerifiedTaskFlowStepAnswer {
  isCorrectAnswer: boolean;
  mistakesAmount: number;
  answer: string
}
