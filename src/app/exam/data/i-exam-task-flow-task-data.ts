import { ISchemaVar } from "./task-flow.api-protocol";
export interface IExamTaskFlowTaskData {
  problemConfId: number;
  examId: number;
  examStepSequence: number;
  examStepAttemptId: number;
  problemVariantConfId: number;
  taskFlowId: number;
  currentTaskFlowStepSequence: number;
  problemName: string;
  schemaUrl: string;
  schemaVars: ISchemaVar[];
  description: string;
}
