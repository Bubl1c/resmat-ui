import { Test, TestAnswer, TestStatus } from "../exam/components/test/test.component";
import { ExamService, VerifiedTestAnswer } from "../exam/data/exam-service.service";
import { ExamStepTypes, IExamStepWithData } from "../exam/data/exam.api-protocol";
import { ExamStep } from "./exam.step";
import { ITestDto, ITestSetDto } from "../exam/data/test-set.api-protocol";
import { GoogleAnalyticsUtils } from "../utils/GoogleAnalyticsUtils";
import { RMU } from "../utils/utils";

export class TestSetExamStep extends ExamStep {
  data: Test[] = [];
  mistakes: number = 0;
  mistakesLimit: number = 5;
  attempt: number = 0;
  maxAttempts: number = 3;

  constructor(private examService: ExamService, private stepWithData: IExamStepWithData) {
    super(stepWithData.stepConf.sequence, stepWithData.attempt.userExamId, ExamStepTypes.TestSet, stepWithData.stepConf.name);
    let stepConf = stepWithData.stepConf;
    let attempt = stepWithData.attempt;
    let stepData = stepWithData.stepData as ITestSetDto;

    this.mistakes = attempt.mistakesAmount;
    this.mistakesLimit = stepConf.mistakesPerAttemptLimit;
    this.attempt = attempt.attemptNumber;
    this.maxAttempts = stepConf.attemptsLimit;

    this.data = this.mapITestsDto(stepData.tests);
  }

  verify(answer: TestAnswer) {
    RMU.safe(() => {
      GoogleAnalyticsUtils.event(`Exam:${this.examId}:step:${this.stepWithData.stepConf.sequence}-test-set`, `TestSetTest ${answer.testId} submitted`, "SubmitTestSetTest", answer.testId);
    });
    let test = this.data.find(t => t.id == answer.testId);
    if(!test) {
      console.error("Submitted test is not found: " + answer);
      return;
    }
    this.examService.verifyTestAnswer(this.examId, this.stepWithData.stepConf.sequence, this.stepWithData.attempt.id, answer).subscribe({
      next: (verifiedAnswer: VerifiedTestAnswer) => {
        RMU.safe(() => {
          if (verifiedAnswer.isCorrectAnswer) {
            GoogleAnalyticsUtils.event(`Exam:${this.examId}:step:${this.stepWithData.stepConf.sequence}-test-set`, `TestSetTest ${answer.testId} verified correct`, "TestSetTestVerifiedCorrect", answer.testId);
          } else {
            GoogleAnalyticsUtils.event(`Exam:${this.examId}:step:${this.stepWithData.stepConf.sequence}-test-set`, `TestSetTest ${answer.testId} verified wrong`, "TestSetTestVerifiedWrong", answer.testId);
          }
        });
        test.status = verifiedAnswer.isCorrectAnswer ? TestStatus.Correct : TestStatus.Incorrect;
        this.mistakes = this.mistakes + verifiedAnswer.mistakesAmount;
        test.options.forEach(testOption => {
          //If an option was submitted and exists in the verified answer
          verifiedAnswer.callIfExists(testOption.id, isCorrect => {
            //Set the correctness of the option
            testOption.correct = isCorrect;
          });
        });
      },
      error: error => console.error(error) //todo handle error
    });
  }

  private mapITestsDto(iTests: ITestDto[]): Test[] {
    return iTests.map((t, i) => new Test(t, i + 1))
  }
}
