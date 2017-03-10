import { Test, TestAnswer, TestStatus } from "../exam/components/test/test.component";
import { ExamService, VerifiedTestAnswer } from "../exam/data/exam-service.service";
import { ITestData, ExamStepTypes, IExamStepWithData, ITestDto } from "../exam/data/exam.api-protocol";
import { ExamStep } from "./exam.step";

interface ITestSetConf {
  id: number;
  examConfId: number;
  examStepConfId: number;
}

interface ITestSetDto {
  conf: ITestSetConf;
  tests: ITestDto[];
}

export class TestSetExamStep extends ExamStep {
  data: Test[] = [];
  mistakes: number = 0;
  mistakesLimit: number = 5;
  attempt: number = 0;
  maxAttempts: number = 3;

  constructor(private examService: ExamService, examId: number, private stepWithData: IExamStepWithData) {
    super(stepWithData.stepConf.sequence, examId, ExamStepTypes.TestSet, stepWithData.stepConf.name);
    let stepConf = stepWithData.stepConf;
    let attempt = stepWithData.attempt;
    let stepData = stepWithData.stepData as ITestSetDto;

    this.mistakes = attempt.mistakesAmount;
    this.mistakesLimit = stepConf.mistakesPerAttemptLimit;
    this.attempt = attempt.attemptNumber;
    this.maxAttempts = stepConf.attemptsLimit;

    this.data = this.mapITestsDto(stepData.tests);

    this.isLoading = false;
  }

  loadInitialData() {
    // this.examService.getTests().subscribe(response => {
    //   this.data = this.mapITests(response);
    //   this.isLoading = false;
    // })
  }

  verify(answer: TestAnswer) {
    let test = this.data.find(t => t.id == answer.testId);
    if(!test) {
      console.error("Submitted test is not found: " + answer);
      return;
    }
    this.examService.verifyTestAnswer(this.examId, this.stepWithData.stepConf.sequence, this.stepWithData.attempt.id, answer).subscribe({
      next: (verifiedAnswer: VerifiedTestAnswer) => {
        test.status = verifiedAnswer.isCorrectAnswer ? TestStatus.Correct : TestStatus.Incorrect;
        test.options.forEach(testOption => {
          //If an option was submitted and exists in the verified answer
          verifiedAnswer.callIfExists(testOption.id, isCorrect => {
            //Set the correctness of the option
            testOption.correct = isCorrect;
          });
          this.mistakes = this.mistakes + verifiedAnswer.mistakesAmount;
        });
      },
      error: error => console.error(error) //todo handle error
    });
  }

  // private mapITests(iTests: ITestData[]): Test[] {
  //   return iTests.map((t, i) => new Test(t, i + 1))
  // }

  private mapITestsDto(iTests: ITestDto[]): Test[] {
    return iTests.map((t, i) => new Test(t, i + 1))
  }
}
