import { ExamService } from "../exam/data/exam-service.service";
import { ExamStepTypes, IExamStepWithData } from "../exam/data/exam.api-protocol";
import { ExamStep } from "./exam.step";
import { IExamTaskFlowTaskData } from "../exam/data/i-exam-task-flow-task-data";
import { ISchemaVar } from "../exam/data/task-flow.api-protocol";

export namespace TaskDataUtils {
  export function mapVariables(inputVariableConfs: ProblemInputVariableConf[], inputVariableValues: ProblemInputVariableValue[]): ISchemaVar[] {
    return inputVariableConfs.map(ivc => mapVariable(ivc, inputVariableValues))
  }

  function mapVariable(inputVariableConf: ProblemInputVariableConf, inputVariableValues: ProblemInputVariableValue[]): ISchemaVar {
    let valueObj = inputVariableValues.find(v => v.variableConfId === inputVariableConf.id);
    return {
      name: inputVariableConf.name,
      value: valueObj && (valueObj.value + "") || "",
      units: inputVariableConf.units,
      alias: inputVariableConf.alias,
      showInExam: inputVariableConf.showInExam
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
}

export interface ProblemVariantConf {
  id: number;
  problemConfId: number;
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
