import { ExamService } from "../exam/data/exam-service.service";
import { ExamStepTypes, IExamStepWithData } from "../exam/data/exam.api-protocol";
import { ExamStep } from "./exam.step";
import { IExamTaskFlowTaskData } from "../exam/data/i-exam-task-flow-task-data";
import { ISchemaVar } from "../exam/data/task-flow.api-protocol";

export namespace TaskDataUtils {
  export function mapVariables(inputVariableConfs: ProblemInputVariableConf[], inputVariableValues: ProblemInputVariableValue[]): ISchemaVar[] {
    return inputVariableValues.map(ivv => mapVariable(ivv, inputVariableConfs))
  }

  function mapVariable(ivv: ProblemInputVariableValue, inputVariableConfs: ProblemInputVariableConf[]): ISchemaVar {
    let conf = inputVariableConfs.find(v => v.id === ivv.variableConfId);
    const shouldUseStrValueAsName = typeof ivv.value !== "undefined" && ivv.strValue;
    return {
      name: shouldUseStrValueAsName ? ivv.strValue : conf.name,
      value: ivv.value + "",
      units: ivv.unitsOverride || conf.units,
      alias: conf.alias,
      showInExam: conf.showInExam,
      variableGroup: ivv.variableGroup
    }
  }
}

export class TaskFlowExamStep extends ExamStep {
  taskData: IExamTaskFlowTaskData;

  constructor(private examService: ExamService,
              stepWithData: IExamStepWithData) {
    super(stepWithData.stepConf.sequence, stepWithData.attempt.userExamId, ExamStepTypes.TaskFlow, stepWithData.stepConf.name);

    let data = stepWithData.stepData as TaskFlowDto;
    let problemConf = data.problemConf;
    let problemVariantConf = data.problemVariantConf;
    let taskFlow = data.taskFlow;
    this.taskData = {
      problemConfId: problemConf.id,
      examId: stepWithData.attempt.userExamId,
      examStepSequence: stepWithData.stepConf.sequence,
      examStepAttemptId: stepWithData.attempt.id,
      problemVariantConfId: problemVariantConf.id,
      taskFlowId: taskFlow.id,
      currentTaskFlowStepSequence: taskFlow.currentStepSequence,
      problemName: problemConf.name,
      schemaType: problemVariantConf.schemaType,
      schemaUrl: problemVariantConf.schemaUrl,
      schemaVars: TaskDataUtils.mapVariables(problemConf.inputVariableConfs, problemVariantConf.inputVariableValues),
      description: "description"
    };
  }
}

export interface ProblemInputVariableConf {
  id: number;
  name: string;
  units: string;
  alias: string;
  showInExam: boolean;
}

export interface ProblemConf {
  id: number;
  name: string;
  inputVariableConfs: ProblemInputVariableConf[];
}

export interface ProblemInputVariableValue {
  variableConfId: number;
  value: number;
  strValue?: string;
  variableKey?: string
  variableGroup?: string
  unitsOverride?: string
}

export type ProblemVariantSchemaType = "img-url" | "geogebra"

export interface ProblemVariantConf {
  id: number;
  problemConfId: number;
  schemaType: ProblemVariantSchemaType;
  schemaUrl: string;
  inputVariableValues: ProblemInputVariableValue[]
}

export interface UserExamStepAttemptTaskFlow {
  id: number;
  stepAttemptId: number;
  userExamId: number;
  examStepConfId: number;
  taskFlowConfId: number;
  problemVariantConfId: number;
  currentStepSequence: number
}

export interface TaskFlowDto {
  problemConf: ProblemConf;
  problemVariantConf: ProblemVariantConf;
  taskFlow: UserExamStepAttemptTaskFlow
}
