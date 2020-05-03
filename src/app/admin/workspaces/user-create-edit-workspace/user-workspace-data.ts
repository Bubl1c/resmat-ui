import { UserComponentConfig } from "../../components/user/user.component";
import { StudentGroup, UserData, UserType } from "../../../user/user.models";
import { ApiService } from "../../../api.service";
import { RMU } from "../../../utils/utils";
import { GoogleAnalyticsUtils } from "../../../utils/GoogleAnalyticsUtils";
import { AdminComponent } from "../../admin.component";
import { WorkspaceData, WorkspaceDataTypes } from "../workspace-data";

export interface UserAccessToExamConfs {
  userId: number
  examConfIds: number[]
}

export interface UserAccessToStudentGroups {
  userId: number
  studentGroupIds: number[]
}

export interface UserAccessToTestGroups {
  userId: number
  testGroupIds: number[]
}

export interface UserWorkspaceCallbacks {
  onUserSaved?: () => void
  onCancel?: () => void
}

export class UserWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.user;
  config: UserComponentConfig;

  isNewUser: Boolean = false;
  adminUserType = UserType.admin;

  accessibleExamConfs: Set<number>;
  allExamConfsAccessible: boolean;

  accessibleStudentGroups: Set<number>;
  allStudentGroupsAccessible: boolean;

  accessibleTestGroups: Set<number>;
  allTestGroupsAccessible: boolean;

  constructor(public data: UserData, private api: ApiService, public adminComponent: AdminComponent, private callbacks: UserWorkspaceCallbacks, public isEditStudent: boolean = false) {
    super();
    if (!this.data.id || this.data.id < 1) {
      this.isNewUser = true;
    }
    this.loadAccessToExamConfs();
    this.loadAccessToStudentGroups();
    this.loadAccessToTestGroups();
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
          this.callbacks.onUserSaved && this.callbacks.onUserSaved();
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
          this.callbacks.onUserSaved && this.callbacks.onUserSaved();
        },
        error: err => {
          this.config.isSaving = false;
          alert(JSON.stringify(err));
          this.errorMessage = err.toString();
        }
      })
    }
  }

  cancel() {
    this.callbacks.onCancel && this.callbacks.onCancel();
  }

  loadAccessToExamConfs() {
    if (!this.isNewUser) {
      this.api.get(`/exam-confs/access?userId=${this.data.id}`).subscribe((access: UserAccessToExamConfs) => {
        this.accessibleExamConfs = new Set();
        access.examConfIds.forEach(ecId => {
          this.accessibleExamConfs.add(ecId)
        })
      }, error => {
        alert(`Не вдалося завантажити інформацію про доступ користувача до іспитів. причина: ${JSON.stringify(error)}`)
        this.accessibleExamConfs = new Set();
      })
    }
  }

  saveAccessToExamConfs() {
    if (!this.isNewUser) {
      const data: UserAccessToExamConfs = {
        userId: this.data.id,
        examConfIds: []
      };
      this.accessibleExamConfs.forEach(ecId => {
        data.examConfIds.push(ecId)
      });
      this.api.put(`/exam-confs/access`, data).subscribe(
        () => {
          alert("Успішно збережено!")
        },
        error => alert(`Не вдалося зберегти інформацію про доступ користувача до іспитів. причина: ${JSON.stringify(error)}`)
      )
    } else {
      alert("Збережіть спочатку користувача")
    }
  }

  onExamConfAccessChanged(examConfId: number) {
    if (this.accessibleExamConfs.has(examConfId)) {
      this.accessibleExamConfs.delete(examConfId)
    } else {
      this.accessibleExamConfs.add(examConfId)
    }
  }
  onAllExamConfsAccessibleChanged() {
    this.allExamConfsAccessible = !this.allExamConfsAccessible;
    if (this.allExamConfsAccessible) {
      this.adminComponent.examConfs.forEach(sg => {
        this.accessibleExamConfs.add(sg.id)
      })
    } else {
      this.accessibleExamConfs.clear()
    }
  }

  loadAccessToStudentGroups() {
    if (!this.isNewUser) {
      this.api.get(`/student-groups/access?userId=${this.data.id}`).subscribe((access: UserAccessToStudentGroups) => {
        this.accessibleStudentGroups = new Set();
        access.studentGroupIds.forEach(ecId => {
          this.accessibleStudentGroups.add(ecId)
        })
      }, error => {
        alert(`Не вдалося завантажити інформацію про доступ користувача до груп студентів. причина: ${JSON.stringify(error)}`)
        this.accessibleStudentGroups = new Set();
      })
    }
  }

  saveAccessToStudentGroups() {
    if (!this.isNewUser) {
      const data: UserAccessToStudentGroups = {
        userId: this.data.id,
        studentGroupIds: []
      };
      this.accessibleStudentGroups.forEach(sgId => {
        data.studentGroupIds.push(sgId)
      });
      this.api.put(`/student-groups/access`, data).subscribe(
        () => {
          alert("Успішно збережено!")
        },
        error => alert(`Не вдалося зберегти інформацію про доступ користувача до груп студентів. причина: ${JSON.stringify(error)}`)
      )
    } else {
      alert("Збережіть спочатку користувача")
    }
  }

  onStudentGroupAccessChanged(studentGroupId: number) {
    if (this.accessibleStudentGroups.has(studentGroupId)) {
      this.accessibleStudentGroups.delete(studentGroupId)
    } else {
      this.accessibleStudentGroups.add(studentGroupId)
    }
  }
  onAllStudentGroupsAccessibleChanged() {
    this.allStudentGroupsAccessible = !this.allStudentGroupsAccessible;
    if (this.allStudentGroupsAccessible) {
      this.adminComponent.studentGroups.forEach(sg => {
        this.accessibleStudentGroups.add(sg.id)
      })
    } else {
      this.accessibleStudentGroups.clear()
    }
  }

  loadAccessToTestGroups() {
    if (!this.isNewUser) {
      this.api.get(`/test-groups/access?userId=${this.data.id}`).subscribe((access: UserAccessToTestGroups) => {
        this.accessibleTestGroups = new Set();
        access.testGroupIds.forEach(ecId => {
          this.accessibleTestGroups.add(ecId)
        })
      }, error => {
        alert(`Не вдалося завантажити інформацію про доступ користувача до груп студентів. причина: ${JSON.stringify(error)}`)
        this.accessibleTestGroups = new Set();
      })
    }
  }

  saveAccessToTestGroups() {
    if (!this.isNewUser) {
      const data: UserAccessToTestGroups = {
        userId: this.data.id,
        testGroupIds: []
      };
      this.accessibleTestGroups.forEach(sgId => {
        data.testGroupIds.push(sgId)
      });
      this.api.put(`/test-groups/access`, data).subscribe(
        () => {
          alert("Успішно збережено!")
        },
        error => alert(`Не вдалося зберегти інформацію про доступ користувача до груп тестів. причина: ${JSON.stringify(error)}`)
      )
    } else {
      alert("Збережіть спочатку користувача")
    }
  }

  onTestGroupAccessChanged(testGroupId: number) {
    if (this.accessibleTestGroups.has(testGroupId)) {
      this.accessibleTestGroups.delete(testGroupId)
    } else {
      this.accessibleTestGroups.add(testGroupId)
    }
  }
  onAllTestGroupsAccessibleChanged() {
    this.allTestGroupsAccessible = !this.allTestGroupsAccessible;
    if (this.allTestGroupsAccessible) {
      this.adminComponent.testsGroupConfsFlat.forEach(sg => {
        this.accessibleTestGroups.add(sg.id)
      })
    } else {
      this.accessibleTestGroups.clear()
    }
  }
}
