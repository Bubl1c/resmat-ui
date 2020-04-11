import { WorkspaceData, WorkspaceDataTypes } from "./workspace-data";
import { ApiService } from "../../api.service";
import { RMU } from "../../utils/utils";
import { GoogleAnalyticsUtils } from "../../utils/GoogleAnalyticsUtils";
import { StudentGroup } from "../../user/user.models";
import { AdminComponent } from "../admin.component";

export class AddStudentGroupWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.addStudentGroup;
  constructor(public data: string, private api: ApiService, private adminComponent: AdminComponent) {
    super();
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`/admin/student-groups/create-new`, `Адмінка :: Створення групи студентів`)
    });
  }

  save() {
    if(!this.data) {
      alert("Введіть ім'я групи");
      return;
    }
    this.api.post(
      "/student-groups", {id: -1, name: this.data}
    ).subscribe({
      next: (result: StudentGroup) => {
        this.adminComponent.loadGroups();
        this.data = "";
        RMU.safe(() => {
          GoogleAnalyticsUtils.event("Admin", `Created student group ${result.id} "${result.name}"`, "CreateStudentGroup", result.id);
        });
        alert("Успішно збережено");
      },
      error: err => {
        this.errorMessage = err.toString();
        alert(err)
      }
    })
  }
}
