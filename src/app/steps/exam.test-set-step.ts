import { Test, TestAnswer, TestStatus } from "../exam/components/test/test.component";
import { ExamService, VerifiedTestAnswer } from "../exam/data/exam-service.service";
import { ITestData, ExamStepTypes } from "../exam/data/exam.api-protocol";
import { ExamStep } from "./exam.step";

export class TestSetExamStep extends ExamStep {
  data: Test[] = [];
  mistakes: number = 0;
  mistakesLimit: number = 5;
  maxAttempts: number = 3;

  constructor(private examService: ExamService, examId: number, sequence: number, description: string) {
    super(sequence, examId, ExamStepTypes.Test, description);
  }

  loadInitialData() {
    this.examService.getTests().subscribe(response => {
      this.data = this.mapITests(response);
      this.isLoading = false;
    })
  }

  verify(answer: TestAnswer) {
    let test = this.data.find(t => t.id == answer.testId);
    if(!test) {
      console.error("Submitted test is not found: " + answer);
      return;
    }
    this.examService.verifyTestAnswer(answer).subscribe({
      next: (verifiedAnswer: VerifiedTestAnswer) => {
        test.status = verifiedAnswer.isAllCorrect ? TestStatus.Correct : TestStatus.Incorrect;
        test.options.forEach(testOption => {
          //If an option was submitted and exists in the verified answer
          verifiedAnswer.callIfExists(testOption.id, isCorrect => {
            //Set the correctness of the option
            testOption.correct = isCorrect;
            //Increment the amount of mistakes if the option is not a correct answer
            if(!isCorrect) {
              this.mistakes++;
            }
          })
        });
      },
      error: error => console.log(error)
    });
  }

  private mapITests(iTests: ITestData[]): Test[] {
    return iTests.map((t, i) => new Test(t, i + 1))
  }
}
