import { GoogleAnalyticsUtils } from "../utils/GoogleAnalyticsUtils";
import { RMU } from "../utils/utils";

export abstract class ExamStep {
  constructor(public sequence: number, public examId: number, public type: string, public description: string) {
    RMU.safe(() => {
      GoogleAnalyticsUtils.event(`Exam:${examId}`, `Initialised step ${sequence} of type "${type}"`, "InitialiseStep", sequence);
    });
  }
}
