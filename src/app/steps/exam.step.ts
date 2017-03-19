export abstract class ExamStep {
  constructor(public sequence: number, public examId: number, public type: string, public description: string) {}
}
