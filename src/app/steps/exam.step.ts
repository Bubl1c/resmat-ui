export abstract class ExamStep {
  isLoading = true;
  abstract loadInitialData(): void;
  constructor(public sequence: number, public examId: number, public type: string, public description: string) {}
}
