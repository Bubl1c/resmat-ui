export abstract class ExamStep {
  examId: number;
  type: string;
  description: string;
  abstract loadInitialData(): void;
  constructor(examId: number, type: string, description: string) {
    this.examId = examId;
    this.type = type;
    this.description = description;
  }
}
