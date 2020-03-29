import { ISchemaVar } from "./task-flow.api-protocol";
import { ProblemConf, ProblemVariantSchemaType } from "../../steps/exam.task-flow-step";

export interface IExamTaskFlowTaskData {
  problemConfId: number;
  examId: number;
  examStepSequence: number;
  examStepAttemptId: number;
  problemVariantConfId: number;
  taskFlowId: number;
  currentTaskFlowStepSequence: number;
  problemName: string;
  schemaType: ProblemVariantSchemaType;
  schemaUrl: string;
  schemaVars: ISchemaVar[];
  description: string;
  problemConf: ProblemConf //yes, this duplicates problemConfId and problem name, but i don't care
}
