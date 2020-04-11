import { UserComponentConfig } from "../components/user/user.component";
import { StudentGroup, UserData } from "../../user/user.models";
import { ApiService } from "../../api.service";
import { RMU } from "../../utils/utils";
import { GoogleAnalyticsUtils } from "../../utils/GoogleAnalyticsUtils";
import { AdminComponent } from "../admin.component";
import { WorkspaceData, WorkspaceDataTypes } from "./workspace-data";

export class UserWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.user;
  config: UserComponentConfig;
  constructor(public data: UserData, private api: ApiService, private adminComponent: AdminComponent, public isEditStudent: boolean = false, public sourceStudentGroup?: StudentGroup) {
    super();
    this.config = new UserComponentConfig();
    RMU.safe(() => {
      if (data.id > 0) {
        GoogleAnalyticsUtils.pageView(`/admin/user/${data.id}`, `Адмінка :: Редагування користувача ${data.id}`)
      } else {
        GoogleAnalyticsUtils.pageView(`/admin/user/create`, `Адмінка :: Cтворення користувача`)
      }
    });
  }

  save(user: UserData) {
    if(user.id > 0) {
      user.password = user.password ? user.password : null;
      const url = this.isEditStudent ? `/student-groups/${user.studentGroupId}/students/${user.id}` : `/api-users/${user.id}`;
      this.api.put(url, user).subscribe({
        next: savedUser => {
          this.config.isSaving = false;
          alert('Збережено успішно');
          if (this.sourceStudentGroup) {
            this.adminComponent.loadGroupStudentsWorkspace(this.sourceStudentGroup)
          }
        },
        error: err => {
          this.config.isSaving = false;
          alert(JSON.stringify(err));
          this.errorMessage = err.toString();
        }
      })
    } else {
      const copy = JSON.parse(JSON.stringify(user));
      copy.userType = user.userType.id;
      this.api.post("/api-users", copy).subscribe({
        next: savedUser => {
          this.config.isSaving = false;
          alert('Збережено успішно');
          this.adminComponent.loadUsers();
        },
        error: err => {
          this.config.isSaving = false;
          alert(JSON.stringify(err));
          this.errorMessage = err.toString();
        }
      })
    }
  }
}
