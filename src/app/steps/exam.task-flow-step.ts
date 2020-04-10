import { ExamService } from "../exam/data/exam-service.service";
import { ExamStepTypes, IExamStepWithData } from "../exam/data/exam.api-protocol";
import { ExamStep } from "./exam.step";
import { IExamTaskFlowTaskData } from "../exam/data/i-exam-task-flow-task-data";
import { ISchemaVar } from "../exam/data/task-flow.api-protocol";
import { CustomAxesSettings, GeometryShapeJson } from "../components/geogebra/custom-objects/geometry-shape";

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
      examId: stepWithData.attempt.userExamId,
      examStepSequence: stepWithData.stepConf.sequence,
      examStepAttemptId: stepWithData.attempt.id,
      taskFlowId: taskFlow.id,
      currentTaskFlowStepSequence: taskFlow.currentStepSequence,
      problemVariantConf: problemVariantConf,
      problemConf: problemConf
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

export interface ProblemConfProps {
  helpMaterials: string[]
}

export interface InputVariableValuesProblemInputConf {
  InputVariableValuesProblemInputConf : {
    inputVariableConfs: ProblemInputVariableConf[]
  }
}
export interface GeometryShapesProblemInputConf {
  GeometryShapesProblemInputConf: {
    customAxesSettings?: CustomAxesSettings
  }
}
export type ProblemInputConf = InputVariableValuesProblemInputConf | GeometryShapesProblemInputConf;
export type ProblemType = "ring-plate" | "cross-section"
export interface ProblemConf {
  id: number;
  name: string;
  problemType: ProblemType
  inputConf: ProblemInputConf
  props: ProblemConfProps
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

export interface InputVariableValuesProblemVariantInputData {
  InputVariableValuesProblemVariantInputData: {
    inputVariableValues: ProblemInputVariableValue[]
  }
}
export interface GeometryShapesProblemVariantInputData {
  GeometryShapesProblemVariantInputData: {
    shapes: GeometryShapeJson[]
  }
}
export type ProblemVariantInputData = InputVariableValuesProblemVariantInputData | GeometryShapesProblemVariantInputData
export interface ProblemVariantConf {
  id: number;
  problemConfId: number;
  schemaType: ProblemVariantSchemaType;
  schemaUrl: string;
  inputData: ProblemVariantInputData
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
