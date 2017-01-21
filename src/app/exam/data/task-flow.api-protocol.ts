export interface ISchemaVar {
  name: string;
  value: string;
  units: string;
}

export class TaskFlowStepTypes {
  static Test = 'test';
  static InputSet = 'input-set';
  static Charts = 'charts';
  static Finished = 'finished';
}

export interface IExamTaskFlowStepData {
  id: number;
  type: string;
  sequence: number;
  name: string;
  data: any;
}
