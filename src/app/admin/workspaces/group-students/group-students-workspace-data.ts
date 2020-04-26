import { SelectableItem } from "../../../components/item-selector/item-selector.component";
import { StudentGroup, UserData, UserType } from "../../../user/user.models";
import { ApiService } from "../../../api.service";
import { ExamService } from "../../../exam/data/exam-service.service";
import { RMU } from "../../../utils/utils";
import { GoogleAnalyticsUtils } from "../../../utils/GoogleAnalyticsUtils";
import { Observable } from "rxjs/Observable";
import { ArticleDto } from "../../components/article-editor/article-editor.component";
import { IExamConf } from "../../../exam/data/exam.api-protocol";
import { WorkspaceData, WorkspaceDataTypes } from "../workspace-data";
import {
  StudentExamListComponentConf,
  StudentUserExam
} from "../../components/student-exams/student-exam-list/student-exam-list.component";
import { CurrentSession } from "../../../current-session";
import { AdminComponent } from "../../admin.component";

export class GroupStudentsWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.groupStudents;
  selectableArticles: SelectableItem[] = [];
  itemSelectorConfig = {
    mutateInput: true
  };

  currentUser: UserData;

  students: UserData[];

  studentExams: StudentUserExam[];
  studentExamsConf: StudentExamListComponentConf;

  constructor(public data: StudentGroup,
              public examConfs: IExamConf[],
              private api: ApiService,
              public examService: ExamService,
              private adminComponent: AdminComponent,
              public selectedExamConf?: IExamConf) {
    super();
    this.currentUser = CurrentSession.user;
    this.studentExamsConf = {
      deletable: this.currentUser.userType.rate >= UserType.instructor.rate,
      showStudentInfoInsteadOfExam: true
    };
    this.loadStudentsByGroup();
    this.loadSelectableArticles();
    if (this.selectedExamConf) {
      this.loadUserExamsByExamConf(this.selectedExamConf)
    }
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`/admin/student-groups/${this.data.id}`, `Адмінка :: Група студентів "${this.data.name}"`)
    });
  }

  saveSelectedArticles() {
    let selectedIds = this.selectableArticles.filter(a => a.isSelected).map(a => a.id);
    this.api.put(
      `/student-groups/${this.data.id}/articles`,
      selectedIds
    ).subscribe({
      next: () => {
        RMU.safe(() => {
          GoogleAnalyticsUtils.event("Admin", `Added articles ${selectedIds.join(',')} to student group ${this.data.id}`, "AddArticlesToStudentGroup");
        });
        alert("Успішно збережено")
      },
      error: e => alert("Не вдалося зберегти вибрані матеріали")
    })
  }

  saveGroupName(editedGroupName: string) {
    const previousName = this.data.name;
    this.data.name = editedGroupName;
    this.api.put(`/student-groups/${this.data.id}`, this.data).subscribe({
      next: () => {
        RMU.safe(() => {
          GoogleAnalyticsUtils.event("Admin", `Edited name for student group ${this.data.id}`, "EditStudentGroup", this.data.id);
        });
        alert("Успішно збережено")
      },
      error: e => {
        this.data.name = previousName;
        alert("Не вдалося оновити ім'я групи: " + JSON.stringify(e))
      }
    })
  }

  archiveGroup() {
    if (window.confirm(`Ви дійсно хочете ЗААРХІВУВАТИ групу '${this.data.name}'? її можна буде розархувавти пізніше.`)) {
      const prevIsArchived = this.data.isArchived;
      this.data.isArchived = true;
      this.api.put(`/student-groups/${this.data.id}`, this.data).subscribe({
        next: () => {
          RMU.safe(() => {
            GoogleAnalyticsUtils.event("Admin", `Archived student group ${this.data.id}`, "ArchiveStudentGroup", this.data.id);
          });
          alert("Заархівовано успішно");
          this.adminComponent.studentGroups = this.adminComponent.studentGroups.filter(sg => !sg.isArchived);
          this.adminComponent.emptyWorkspace();
        },
        error: e => {
          this.data.isArchived = prevIsArchived;
          alert("Не вдалося заархівувати групу: " + JSON.stringify(e))
        }
      })
    }
  }

  addExamForAllStudents(ec: IExamConf) {
    if (window.confirm(`Ви дійсно хочете ДОДАТИ роботу '${ec.name}' для всіх студентів в групі '${this.data.name}'?`)) {
      alert("Не закривайте сторінку поки не отримаєте повідомлення про закінчення операції!");
      Observable.forkJoin(this.students.map(student => {
        return this.examService.createExamForStudent(ec.id, student.id)
          .map(res => {
            RMU.safe(() => {
              GoogleAnalyticsUtils.event("Admin", `Added exam ${ec.id} for student ${student.id}`, "AddExamForStudent", ec.id);
            });
            return res;
          })
          .catch(error => {
            alert(`Не вийшло додати роботу '${ec.name}' для студента '${student.firstName} ${student.lastName}', причина: ${JSON.stringify(error)}`)
            return Observable.empty<any>();
          })
      })).subscribe(results => {
        alert("Успішно додано");
      });
    }
  }

  deleteExamForAllStudents(ec: IExamConf) {
    if (window.confirm(`Ви дійсно хочете ВИДАЛИТИ роботу '${ec.name}' для всіх студентів в групі '${this.data.name}'?`)) {
      this.examService.deleteExamForAllStudentsInGroup(ec.id, this.data.id).subscribe(created => {
        RMU.safe(() => {
          GoogleAnalyticsUtils.event("Admin", `Deleted exam ${ec.id} for all students in group ${this.data.id}`, "DeleteExamForAllStudentsInGroup", this.data.id);
        });
        alert("Успішно видалено");
      }, error => alert(`Не вийшло видалити роботу '${ec.name}' для всіх студентів групи, причина: ${JSON.stringify(error)}`));
    }
  }

  deleteStudent(student: UserData) {
    if (window.confirm("Ви дійсно хочете видалити студента " + student.firstName + " " + student.lastName + "?")) {
      this.api.delete("/student-groups/" + student.studentGroupId + "/students/" + student.id).subscribe(() => {
        this.loadStudentsByGroup()
      }, err => alert(err.toString()))
    }
  }

  loadUserExamsByExamConf(exmConf: IExamConf) {
    this.selectedExamConf = exmConf;
    this.examService.findByExamConfAndStudentGroup(exmConf.id, this.data.id).subscribe(response => {
      this.studentExams = response.map(ue => {
        let student: UserData;
        if (this.students) {
          student = this.students.find(s => s.id === ue.userId);
        } else {
          student = UserData.empty();
          student.id = ue.userId;
          student.firstName = "Невідомий";
          student.lastName = "Студент"
        }
        return {
          exam: ue,
          student: student
        }
      });
    }, error => alert(error))
  }

  private loadSelectableArticles() {
    Observable.forkJoin([
      this.api.get('/articles'),
      this.api.get(`/articles?studentGroupId=${this.data.id}`)
    ]).subscribe(([all, group]: ArticleDto[][]) => {
      all.forEach(a => {
        this.selectableArticles.push(
          new SelectableItem(a.id, `${a.header}${!a.visible ? ' (Приховано)' : ''}`, !!group.find(ga => ga.id === a.id))
        )
      })
    });
  }

  loadStudentsByGroup() {
    this.api.get("/student-groups/" + this.data.id + "/students").subscribe({
      next: (students: any[]) => {
        let mappedStudents = students.map(UserData.fromApi);
        this.students = mappedStudents;
      },
      error: err => {
        this.errorMessage = err.toString()
      }
    })
  }
}
