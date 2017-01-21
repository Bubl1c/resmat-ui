import { ExamService } from "../exam/data/exam-service.service";
import { ExamStepTypes } from "../exam/data/exam.api-protocol";
import { ExamStep } from "./exam.step";
import { ExamResult } from "../exam/components/exam-results/exam-results.component";

export class ResultsExamStep extends ExamStep {
  data: ExamResult;

  constructor(public examService: ExamService, examId: number, sequence: number, description: string) {
    super(sequence, examId, ExamStepTypes.Results, description);
  }

  loadInitialData() {
    this.examService.getResults(this.examId).subscribe((results: ExamResult) => {
      this.data = results;
      this.isLoading = false;
    })
  }
}
