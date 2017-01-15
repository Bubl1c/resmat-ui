import { ISchemaVar } from "./task-flow.api-protocol";
export interface IExamTaskFlowTaskData {
  id: number;
  examId: number,
  version: number;
  currentStep: number;
  name: string,
  schemaUrl: string;
  schemaVars: ISchemaVar[];
  description: string;
}
