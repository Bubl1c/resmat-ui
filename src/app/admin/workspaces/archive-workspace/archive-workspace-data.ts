import { ApiService } from "../../../api.service";
import { RMU } from "../../../utils/utils";
import { GoogleAnalyticsUtils } from "../../../utils/GoogleAnalyticsUtils";
import { AdminComponent } from "../../admin.component";
import { WorkspaceData, WorkspaceDataTypes } from "../workspace-data";
import { StudentGroup } from "../../../user/user.models";
import { ITestGroupConf, ITestGroupConfWithChildren } from "../../components/test-group-list/test-group-list.component";
import { TestConfService } from "../../data/test-conf.service";

export class ArchiveWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.archive;

  studentGroups: StudentGroup[] = [];
  testGroups: ITestGroupConf[] = [];

  constructor(public data: any, private api: ApiService, private tcService: TestConfService, private adminComponent: AdminComponent) {
    super();
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`/admin/archive`, `Адмінка :: Статті`)
    });
    this.loadStudentGroups();
    this.loadTestGroups();
  }

  loadStudentGroups() {
    this.api.get("/student-groups?isArchived=true").subscribe({
      next: (groups: StudentGroup[]) => {
        this.studentGroups = groups
      },
      error: err => alert("Не вдалося завантажити заархівовані групи студентів, причина: " + JSON.stringify(err))
    })
  }

  unarchiveStudentGroup(group: StudentGroup, index: number) {
    if (window.confirm(`Ви дійсно хочете РОЗархівувати групу '${group.name}'?`)) {
      group.isArchived = false;
      this.api.put(`/student-groups/${group.id}`, group).subscribe({
        next: () => {
          RMU.safe(() => {
            GoogleAnalyticsUtils.event("Admin", `UnArchived student group ${group.id}`, "UnArchiveStudentGroup", group.id);
          });
          alert("РОЗархівовано успішно");
          this.studentGroups.splice(index, 1);
          this.adminComponent.loadGroups();
        },
        error: e => {
          alert("Не вдалося РОЗархівувати: " + JSON.stringify(e))
        }
      })
    }
  }

  loadTestGroups() {
    this.tcService.getTestGroupConfs(true, true).subscribe({
      next: (testGroupConfs: ITestGroupConf[]) => {
        this.testGroups = testGroupConfs
      },
      error: err => {
        this.errorMessage = err.toString();
        alert(err)
      }
    })
  }

  unarchiveTestGroup(group: ITestGroupConf, index) {
    group.isArchived = false;
    this.tcService.updateTestGroupConf(group.id, group).subscribe({
      next: (updated: ITestGroupConf) => {
        RMU.safe(() => {
          GoogleAnalyticsUtils.event("Admin", `UnArchived test group ${group.id}`, "UnArchiveTestGroup", group.id);
        });
        alert("РОЗархівовано успішно");
        this.testGroups.splice(index, 1);
        this.adminComponent.loadTestGroupConfs();
      },
      error: err => {
        this.errorMessage = err.toString();
        alert("Не вдалося РОЗархівувати: " + JSON.stringify(err))
      }
    })
  }

}
