import { ISchemaVar } from "./task-flow.api-protocol";
import { ProblemConf, ProblemVariantConf, ProblemVariantSchemaType } from "../../steps/exam.task-flow-step";

export interface IExamTaskFlowTaskData {
  examId: number
  examStepSequence: number
  examStepAttemptId: number
  taskFlowId: number
  currentTaskFlowStepSequence: number
  problemVariantConf: ProblemVariantConf
  problemConf: ProblemConf
}
