import { StudentGroup } from "../../user/user.models";
import { RMU } from "../../utils/utils";
import { GoogleAnalyticsUtils } from "../../utils/GoogleAnalyticsUtils";
import { WorkspaceData, WorkspaceDataTypes } from "./workspace-data";

export class AddStudentWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.addStudent;
  constructor(public data: StudentGroup) {
    super();
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`/admin/student-groups/${this.data.id}/add-student`, `Адмінка :: Створення групи студентів`)
    });
  }
}
