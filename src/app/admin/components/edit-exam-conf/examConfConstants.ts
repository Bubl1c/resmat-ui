import { ExamStepTypes, IExamConf, IExamStepConf } from "../../../exam/data/exam.api-protocol";
import { ITestSetConfDto } from "../../../exam/data/test-set.api-protocol";
import { ITaskFlowConfDto, ITaskFlowTestConf, TaskFlowStepTypes } from "../../../exam/data/task-flow.api-protocol";

export const newExamConf = (): IExamConf => ({
  id: -1,
  name: "",
  description: "",
  maxScore: 100
});

export const newDefaultExamStepConfInstance = (sequence: number): IExamStepConf => ({
  id: -1,
  examConfId: -1,
  sequence: sequence,
  name: "Тестування",
  stepType: ExamStepTypes.TestSet,
  mistakesPerAttemptLimit: 5,
  mistakeValuePercents: 1,
  attemptsLimit: 3,
  attemptValuePercents: 5,
  maxScore: 25,
  dataSet: {
    ExamStepTestSetDataSet: {
      testSetConfId: -1
    }
  },
  hasToBeSubmitted: true
});

export const newResultsExamStepConfInstance = (sequence: number): IExamStepConf => ({
  id: -1,
  examConfId: 1,
  sequence: sequence,
  name: "Результати",
  stepType: ExamStepTypes.Results,
  mistakesPerAttemptLimit: -1,
  mistakeValuePercents: 0,
  attemptsLimit: -1,
  attemptValuePercents: 0,
  maxScore: 0,
  dataSet: {
    ExamStepResultsDataSet: {}
  },
  hasToBeSubmitted: false
});

export const newTestSetConfDto = (): ITestSetConfDto => ({
  testSetConf: {
    id: -1,
    name: "",
    maxTestsAmount: 10
  },
  testGroups: []
});

export const newTaskFlowConfDto = (): ITaskFlowConfDto => ({
  taskFlowConf: {
    id: -1,
    problemConfId: -1,
    name: ""
  },
  taskFlowSteps: [{
    id: -1,
    taskFlowConfId: -1,
    name: "",
    sequence: 1,
    isHelpStep: false,
    stepType: TaskFlowStepTypes.Test,
    stepData: JSON.stringify({
      testConf: {
        id: -1,
        groupId: -1,
        question: "",
        imageUrl: "",
        help: "",
        testType: 'radio',
        options: [{
          id: -1,
          value: "",
          correct: true,
          valueType: 'words'
        }]
      },
      correctOptionIdsMapping: undefined
    } as ITaskFlowTestConf)
  }]
});
