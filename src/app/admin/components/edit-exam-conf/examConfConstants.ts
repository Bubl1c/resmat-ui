import { ExamStepTypes, IExamConf, IExamStepConf } from "../../../exam/data/exam.api-protocol";
import { ITestSetConf, ITestSetConfDto, ITestSetConfTestGroup } from "../../../exam/data/test-set.api-protocol";

export const newExamConf = (): IExamConf => ({
  id: undefined,
  name: "",
  description: "",
  maxScore: 100
});

export const defaultExamStepConfInstance = (sequence: number = 1): IExamStepConf => ({
  id: undefined,
  examConfId: undefined,
  sequence: sequence,
  name: "Новий крок",
  stepType: ExamStepTypes.TestSet,
  mistakesPerAttemptLimit: 5,
  mistakeValuePercents: 1,
  attemptsLimit: 3,
  attemptValuePercents: 5,
  maxScore: 25,
  dataSet: {
    ExamStepTestSetDataSet: {
      testSetConfId: undefined
    }
  },
  hasToBeSubmitted: true
});

export const resultsExamStepConfInstance = (sequence: number = 2): IExamStepConf => ({
  id: 3,
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
