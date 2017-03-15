import { ISchemaVar } from "./task-flow.api-protocol";
export interface IExamTaskFlowTaskData {
  id: number;
  examId: number;
  examStepSequence: number;
  examStepAttemptId: number;
  version: number;
  currentStep: number;
  name: string;
  schemaUrl: string;
  schemaVars: ISchemaVar[];
  description: string;
}
