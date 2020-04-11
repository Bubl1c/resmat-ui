import { StudentGroup, UserData } from "../../user/user.models";
import { RMU } from "../../utils/utils";
import { GoogleAnalyticsUtils } from "../../utils/GoogleAnalyticsUtils";
import { WorkspaceData, WorkspaceDataTypes } from "./workspace-data";

export class StudentExamsWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.studentExams;
  constructor(public data: UserData, public sourceGroup: StudentGroup) {
    super();
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`/admin/students/${this.data.id}/exams`, `Адмінка :: Роботи студента ${this.data.id}`)
    });
  }
}
