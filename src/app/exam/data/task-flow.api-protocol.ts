export interface ISchemaVar {
  name: string;
  value: string;
  units: string;
}

export class TaskFlowStepTypes {
  static Test = 'test';
  static Variables = 'vars';
  static Charts = 'charts';
}

export interface IExamTaskFlowStepData {
  id: number; //sequence number
  type: string;
  data: any;
}
