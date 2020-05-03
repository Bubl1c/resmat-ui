import { ApiService } from "../../../api.service";
import { RMU } from "../../../utils/utils";
import { GoogleAnalyticsUtils } from "../../../utils/GoogleAnalyticsUtils";
import { AdminComponent } from "../../admin.component";
import { WorkspaceData, WorkspaceDataTypes } from "../workspace-data";
import { UserData } from "../../../user/user.models";
import { ProblemConf } from "../../../steps/exam.task-flow-step";
import { UserWorkspaceData } from "../user-create-edit-workspace/user-workspace-data";
import { ProblemWorkspaceData } from "../problem-workspace-data";
import { ProblemConfWithVariants } from "../../components/problem-conf/problem-conf.component";

export class AdminWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.admin;

  users: UserData[] = [];
  problemConfs: ProblemConf[] = [];

  editUserWorkspaceData: UserWorkspaceData;
  problemConfWorkspaceData: ProblemWorkspaceData;

  constructor(public data: any, private api: ApiService, private adminComponent: AdminComponent) {
    super();
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`/admin/admin`, `Адмінка :: Адміністрування`)
    });
    this.loadUsers();
    this.loadProblemConfs()
  }

  loadUsers() {
    this.api.get("/api-users").subscribe({
      next: (users: any[]) => {
        this.users = users.map(UserData.fromApi)
      },
      error: err => {
        this.errorMessage = err.toString()
      }
    })
  }

  loadProblemConfs() {
    this.api.get("/problem-confs").subscribe({
      next: (problemConfs: ProblemConf[]) => {
        this.problemConfs = problemConfs
      },
      error: err => {
        this.errorMessage = err.toString();
        alert(err)
      }
    })
  }

  loadCreateUser() {
    this.editUserWorkspaceData = new UserWorkspaceData(UserData.empty(), this.api, this.adminComponent, {
      onUserSaved: () => {
        this.loadUsers();
        this.editUserWorkspaceData = undefined;
      },
      onCancel: () => {
        this.editUserWorkspaceData = undefined;
      }
    });
  }

  loadEditUser(user: UserData) {
    this.editUserWorkspaceData = new UserWorkspaceData(user, this.api, this.adminComponent, {
      onUserSaved: () => {
        this.loadUsers();
        this.editUserWorkspaceData = undefined;
      },
      onCancel: () => {
        this.editUserWorkspaceData = undefined;
      }
    });
  }

  loadProblemConf(problemConf: ProblemConf) {
    this.api.get("/problem-confs/" + problemConf.id + "/with-variants").subscribe({
      next: (problemConfWithVariants: ProblemConfWithVariants) => {
        this.problemConfWorkspaceData = new ProblemWorkspaceData(problemConfWithVariants)
      },
      error: err => {
        this.errorMessage = err.toString();
        alert(err)
      }
    })
  }

}
