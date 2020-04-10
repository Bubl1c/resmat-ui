import {Component, group, OnInit} from "@angular/core";
import {ApiService} from "../api.service";
import {Router} from "@angular/router";
import {StudentGroup, UserData, UserType} from "../user/user.models";
import {CurrentSession} from "../current-session";
import {UserComponentConfig} from "./components/user/user.component";
import {ExamResult} from "../exam/components/exam-results/exam-results.component";
import {
  ProblemConfWithVariants,
} from "./components/problem-conf/problem-conf.component";
import {ITestEditDto} from "../exam/data/test-set.api-protocol";
import {TestEdit} from "./components/edit-test-conf/edit-test-conf.component";
import {ArticleDto} from "./components/article-editor/article-editor.component";
import {SelectableItem} from "../components/item-selector/item-selector.component";
import {Observable} from "rxjs/Observable";
import { DropdownOption } from "../components/dropdown/dropdown.component";
import { ITestGroupConf, ITestGroupConfWithChildren } from "./components/test-group-list/test-group-list.component";
import { IExamConf, IExamConfDto, IExamConfUpdateDto } from "../exam/data/exam.api-protocol";
import {
  newDefaultExamStepConfInstance, newExamConf,
  newResultsExamStepConfInstance
} from "./components/edit-exam-conf/examConfConstants";
import { TestConfService } from "./data/test-conf.service";
import { UserDefaults } from "./userDefaults";
import { AfterViewInit } from "@angular/core/src/metadata/lifecycle_hooks";
import { GoogleAnalyticsUtils } from "../utils/GoogleAnalyticsUtils";
import { RMU } from "../utils/utils";
import { ProblemConf, ProblemVariantConf } from "../steps/exam.task-flow-step";
import { ExamService } from "../exam/data/exam-service.service";

interface ITestGroupConfWithTestConfs extends ITestGroupConfWithChildren {
  testConfs: ITestEditDto[]
}

@Component({
  selector: 'admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  providers: [ExamService]
})
export class AdminComponent implements OnInit, AfterViewInit {

  errorMessage: string = "error happened";
  currentUser: UserData;

  userPermission: number;

  permissions = {
    Admin: UserType.admin.rate,
    Instructor: UserType.instructor.rate,
    Assistant: UserType.assistant.rate
  };

  sideMenuCollapsed: boolean = false;

  studentGroups: StudentGroup[];
  users: UserData[];
  students: UserData[];

  examConfs: IExamConf[];
  problemConfs: ProblemConf[];

  testsGroupConfs: ITestGroupConfWithChildren[];
  testsGroupConfsFlat: ITestGroupConfWithChildren[];

  workspaceData: WorkspaceData;

  constructor(private router: Router, private api: ApiService, private tcService: TestConfService, private examService: ExamService) { }

  ngAfterViewInit(): void {
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView("/admin", "Admin")
    });
  }

  ngOnInit() {
    this.currentUser = CurrentSession.user;
    console.log("Current user", this.currentUser);
    if(!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.userPermission = this.currentUser.userType.rate;
    if(this.userPermission >= UserType.admin.rate) {
      this.loadUsers();
      this.loadProblemConfs();
    }
    if(this.userPermission >= UserType.instructor.rate) {
      this.loadTestGroupConfs();
    }
    this.loadExamConfs();
    this.loadGroups();
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

  loadCreateUser() {
    this.workspaceData = new UserWorkspaceData(UserData.empty(), this.api, this);
  }

  loadEditUser(user: UserData, isEditStudent: boolean = false) {
    this.workspaceData = new UserWorkspaceData(user, this.api, this, isEditStudent);
  }

  loadArticles() {
    this.api.get("/articles").subscribe({
      next: (articles: any[]) => {
        this.workspaceData = new ArticlesWorkspaceData(
          articles,
          this.api,
          this
        )
      },
      error: err => {
        this.errorMessage = err.toString()
      }
    });
  }

  loadStudentsByGroup(group: StudentGroup) {
    this.api.get("/student-groups/" + group.id + "/students").subscribe({
      next: (students: any[]) => {
        let mappedStudents = students.map(UserData.fromApi);
        this.workspaceData = new GroupStudentsWorkspaceData(mappedStudents, group, this.api, this.examService);
      },
      error: err => {
        this.errorMessage = err.toString()
      }
    })
  }

  loadStudentResults(student: UserData, sourceGroup: StudentGroup) {
    this.workspaceData = new StudentExamsWorkspaceData(student, sourceGroup);
  }

  loadGroups() {
    this.api.get("/student-groups").subscribe({
      next: (groups: any[]) => {
        this.studentGroups = groups
      },
      error: err => {
        this.errorMessage = err.toString()
      }
    })
  }

  addStudentGroup() {
    this.workspaceData = new AddStudentGroupWorkspaceData("", this.api, this);
  }

  loadExamConfs(cb?: () => void) {
    this.api.get("/exam-confs").subscribe({
      next: (examConfs: IExamConf[]) => {
        this.examConfs = examConfs
        cb && cb()
      },
      error: err => {
        this.errorMessage = err.toString();
        alert(err)
      }
    })
  }

  loadExamConf(examConfId: number) {
    this.api.get("/exam-confs/" + examConfId + "/dto").subscribe({
      next: (examConfDto: IExamConfDto) => {
        this.workspaceData = new ExamWorkspaceData(examConfDto, this.testsGroupConfsFlat, this)
      },
      error: err => {
        this.errorMessage = err.toString();
        alert(err)
      }
    })
  }

  addExamConf() {
    this.workspaceData = new ExamWorkspaceData({
      examConf: newExamConf(),
      stepConfs: [newDefaultExamStepConfInstance(1), newResultsExamStepConfInstance(2)]
    }, this.testsGroupConfsFlat, this)
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

  loadProblemConf(problemConfId: number) {
    this.workspaceData = undefined;
    this.api.get("/problem-confs/" + problemConfId + "/with-variants").subscribe({
      next: (problemConfWithVariants: ProblemConfWithVariants) => {
        this.workspaceData = new ProblemWorkspaceData(problemConfWithVariants)
      },
      error: err => {
        this.errorMessage = err.toString();
        alert(err)
      }
    })
  }

  loadTestGroupConfs(cb?: () => void) {
    this.tcService.getTestGroupConfs(true).subscribe({
      next: (testGroupConfs: ITestGroupConf[]) => {
        this.testsGroupConfs = [];
        const groupsMap: Map<number, number> = new Map();
        const groupsWithChildren: ITestGroupConfWithChildren[] = [];
        testGroupConfs.forEach((g, i) => {
          groupsMap.set(g.id, i);
          groupsWithChildren.push(Object.assign({ childGroups: [] }, g));
        });
        groupsWithChildren.forEach(g => {
          if (g.parentGroupId) {
            groupsWithChildren[groupsMap.get(g.parentGroupId)].childGroups.push(g);
          } else {
            this.testsGroupConfs.push(g)
          }
        })
        this.testsGroupConfsFlat = groupsWithChildren;
        cb && cb()
      },
      error: err => {
        this.errorMessage = err.toString();
        alert(err)
      }
    })
  }

  addTestGroupConf() {
    const empty = {
      id: undefined,
      name: "",
      parentGroupId: undefined,
      childGroups: []
    };
    this.workspaceData = new AddTestGroupWorkspaceData(empty, this.tcService, this)
  }

  loadTestGroupConfById(testGroupConfId: number) {
    this.loadTestGroupConf(this.testsGroupConfsFlat.find(g => g.id === testGroupConfId))
  }

  loadTestGroupConf(testGroupConf: ITestGroupConfWithChildren) {
    this.tcService.getTestConfsByTestGroupConfId(testGroupConf.id).subscribe({
      next: (testGroupTestConfs: ITestEditDto[]) => {
        let copy: ITestGroupConfWithTestConfs = Object.assign({ testConfs: testGroupTestConfs }, testGroupConf);
        this.workspaceData = new EditTestGroupWorkspaceData(copy, this.tcService, this)
      },
      error: err => {
        this.errorMessage = err.toString();
        alert(err)
      }
    })
  }

  editTestConf(groupId: number, testConf: ITestEditDto) {
    if(!testConf) {
      testConf = new TestEdit();
      testConf.groupId = groupId;
    }
    this.workspaceData = new EditTestConfWorkspaceData(testConf, this.tcService)
  }

  addUserToCurrentGroup(group: StudentGroup) {
    this.workspaceData = new AddStudentWorkspaceData(group)
  }

  addStudent(student: UserData) {
    let toSend = JSON.parse(JSON.stringify(student));
    toSend.userType = toSend.userType.id;
    this.api.post(`/student-groups/${student.studentGroupId}/students`, toSend).subscribe({
      next: (users: any[]) => {
        let group = this.studentGroups.find(sg => student.studentGroupId === sg.id)
        this.loadStudentsByGroup(group)
      },
      error: err => {
        alert(err.toString())
      }
    })
  }

  deleteStudent(student: UserData) {
    let group = this.studentGroups.find(sg => student.studentGroupId === sg.id);
    if(window.confirm("Ви дійсно хочете видалити студента " + student.firstName + " " + student.lastName + "?")) {
      this.api.delete("/student-groups/" + student.studentGroupId + "/students/" + student.id).subscribe(() => {
        this.loadStudentsByGroup(group)
      }, err => alert(err.toString()))
    }
  }

  unlockAllInGroup(group: StudentGroup) {
    if(window.confirm("Ви дійсно хочете розблокувати всі роботи вгрупі " + group.name + "?")) {
      this.api.put("/user-exams/unlockAll?groupId=" + group.id, {}).subscribe(() => {
        alert("Успішно розблоковано")
      }, error => alert(error))
    }
  }

  lockAllInGroup(group: StudentGroup) {
    let hoursToLock = parseInt(prompt("На скільки годин блокуємо?", "24"));
    if(isNaN(hoursToLock) || hoursToLock < 0) {
      alert("Введено невірне значееня, введіть число більше 0");
      return;
    }
    if(window.confirm("Ви дійсно хочете заблокувати всі роботи вгрупі " + group.name + "?")) {
      this.api.put("/user-exams/lockAll?groupId=" + group.id + "&hoursAmount=" + hoursToLock, {}).subscribe(() => {
        alert("Успішно зазблоковано")
      }, error => alert(error))
    }
  }
}

/* ------------------------------------------------------------------------------------------------------------------ */
/*          Workspaces                                                                                                */
/* ------------------------------------------------------------------------------------------------------------------ */

class WorkspaceDataTypes {
  static user = "user";
  static addStudent = "add-student";
  static addStudentGroup = "add-student-group";
  static groupStudents = "group-students";
  static examResults = "exam-results";
  static editExam = "edit-exam";
  static problem = "problem";
  static studentExams = "student_exams";
  static testGroup = "test_group";
  static editTestConf = "edit_test_conf";
  static addTestGroup = "add_test_group";
  static articles = "articles";
  static loading = "loading";
}

abstract class WorkspaceData {
  abstract type: string;
  abstract data: any;
  errorMessage: string = null;
}

class UserWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.user;
  config = new UserComponentConfig();
  constructor(public data: UserData, private api: ApiService, private adminComponent: AdminComponent, private isEditStudent: boolean = false) {
    super();
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
          alert('Збережено успішно')
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

class ArticlesWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.articles;

  showArticles = true;
  articleToEdit: ArticleDto;
  articleToShow: ArticleDto;
  newArticleHeader: string = '';

  constructor(public data: ArticleDto[], private api: ApiService, private adminComponent: AdminComponent) {
    super();
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`/admin/articles`, `Адмінка :: Статті`)
    });
  }

  createNewArticle() {
    this.api.post('/articles', {
      id: -1,
      header: this.newArticleHeader,
      preview: '',
      body: '',
      visible: false,
      meta: {
        uploadedFileUrls: []
      }
    }).subscribe({
      next: (savedArticle: ArticleDto) => {
        this.data.unshift(savedArticle);
        this.articleToEdit = savedArticle;
        RMU.safe(() => {
          GoogleAnalyticsUtils.event("Admin", `Created article ${savedArticle.id} "${savedArticle.header}"`, "CreateArticle", savedArticle.id)
        });
      },
      error: (e) => alert(JSON.stringify(e)),
      complete: () => this.newArticleHeader = undefined,
    });
  }
  show(article: ArticleDto) {
    this.showArticles = false;
    this.articleToShow = article;
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`/admin/articles/${article.id}/view`, `Адмінка :: Перегляд статті "${article.header}"`)
    });
  }
  edit(article: ArticleDto) {
    this.showArticles = false;
    this.articleToEdit = article;
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`/admin/articles/${article.id}/edit`, `Адмінка :: Редагування статті "${article.header}"`)
    });
  }
  saveEdited(article: ArticleDto) {
    const toSend = JSON.parse(JSON.stringify(article));
    this.api.put(`/articles/${article.id}`, toSend).subscribe({
      next: (savedArticle: ArticleDto) => {
        for(let i = 0; i < this.data.length; i++) {
          if(this.data[i].id === savedArticle.id) {
            this.data[i] = savedArticle;
            break;
          }
        }
        RMU.safe(() => {
          GoogleAnalyticsUtils.event("Admin", `Edited article ${savedArticle.id}`, "EditArticle", savedArticle.id);
        });
        alert("Збережено успішно")
      },
      error: (e) => alert(JSON.stringify(e))
    });
  }
  deleteArticle(article: ArticleDto) {
    if(window.confirm("Ви дійсно хочете видалити статтю '" + article.header + "' ?")) {
      this.api.delete(`/articles/${article.id}`).subscribe({
        next: () => {
          const index = this.data.indexOf(article);
          RMU.safe(() => {
            GoogleAnalyticsUtils.event("Admin", `Deleted article ${article.id} "${article.header}"`, "DeleteArticle", article.id);
          });
          if(index === -1) {
            alert("Щось не так з видаленням матеріалу, не найдено у списку")
          } else {
            alert("Видалено успішно");
            this.data.splice(index, 1)
          }
        },
        error: e => alert("Не вдалося видалити матеріал: " + JSON.stringify(e))
      })
    }
  }
  backToList() {
    this.showArticles = true;
    this.articleToShow = null;
    this.articleToEdit = null;
  }

}

class AddStudentWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.addStudent;
  constructor(public data: StudentGroup) {
    super();
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`/admin/student-groups/${this.data.id}/add-student`, `Адмінка :: Створення групи студентів`)
    });
  }
}

class GroupStudentsWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.groupStudents;
  selectableArticles: SelectableItem[] = [];
  itemSelectorConfig = {
    mutateInput: true
  };

  constructor(public data: UserData[], public group: StudentGroup, private api: ApiService, private examService: ExamService) {
    super();
    this.loadSelectableArticles();
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`/admin/student-groups/${group.id}`, `Адмінка :: Група студентів "${group.name}"`)
    });
  }

  loadSelectableArticles() {
    Observable.forkJoin([
      this.api.get('/articles'),
      this.api.get(`/articles?studentGroupId=${this.group.id}`)
    ]).subscribe(([all, group]: ArticleDto[][]) => {
      all.forEach(a => {
        this.selectableArticles.push(
          new SelectableItem(a.id, `${a.header}${!a.visible ? ' (Приховано)' : ''}`, !!group.find(ga => ga.id === a.id))
        )
      })
    });
  }

  saveSelectedArticles() {
    let selectedIds = this.selectableArticles.filter(a => a.isSelected).map(a => a.id);
    this.api.put(
      `/student-groups/${this.group.id}/articles`,
      selectedIds
    ).subscribe({
      next: () => {
        RMU.safe(() => {
          GoogleAnalyticsUtils.event("Admin", `Added articles ${selectedIds.join(',')} to student group ${this.group.id}`, "AddArticlesToStudentGroup");
        });
        alert("Успішно збережено")
      },
      error: e => alert("Не вдалося зберегти вибрані матеріали")
    })
  }

  saveGroupName(editedGroupName: string) {
    const previousName = this.group.name;
    this.group.name = editedGroupName;
    this.api.put(`/student-groups/${this.group.id}`, this.group).subscribe({
      next: () => {
        RMU.safe(() => {
          GoogleAnalyticsUtils.event("Admin", `Edited name for student group ${this.group.id}`, "EditStudentGroup", this.group.id);
        });
        alert("Успішно збережено")
      },
      error: e => {
        this.group.name = previousName;
        alert("Не вдалося оновити ім'я групи: " + JSON.stringify(e))
      }
    })
  }

  addExamForAllStudents(ec: IExamConf) {
    if(window.confirm(`Ви дійсно хочете додати роботу '${ec.name}' для всіх студентів в групі '${this.group.name}'?`)) {
      alert("Не закривайте сторінку поки не отримаєте повідомлення про закінчення операції!");
      Observable.forkJoin(this.data.map(student => {
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
    if(window.confirm(`Ви дійсно хочете ВИДАЛИТИ роботу '${ec.name}' для всіх студентів в групі '${this.group.name}'?`)) {
      this.examService.deleteExamForAllStudentsInGroup(ec.id, this.group.id).subscribe(created => {
        RMU.safe(() => {
          GoogleAnalyticsUtils.event("Admin", `Deleted exam ${ec.id} for all students in group ${this.group.id}`, "DeleteExamForAllStudentsInGroup", this.group.id);
        });
        alert("Успішно видалено");
      }, error => alert(`Не вийшло видалити роботу '${ec.name}' для всіх студентів групи, причина: ${JSON.stringify(error)}`));
    }
  }
}

class ExamResultWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.examResults;
  constructor(public data: ExamResult[]) {
    super();
  }
}

class ExamWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.editExam;
  isSaving = false;

  testGroupConfsDropdownOptions: DropdownOption[];

  constructor(public data: IExamConfDto, testGroupConfsFlat: ITestGroupConf[], protected adminComponent: AdminComponent) {
    super();
    this.testGroupConfsDropdownOptions = testGroupConfsFlat.map(tgc => new DropdownOption(tgc.id, tgc.name));
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`/admin/exams`, `Адмінка :: Іспити`)
    });
  }

  onSaved(saved: IExamConfDto) {
    this.adminComponent.loadExamConfs();
    this.data = saved;
    RMU.safe(() => {
      if (this.data.examConf.id > 0) {
        GoogleAnalyticsUtils.event("Admin", `Edited exam ${this.data.examConf.id}`, "EditExam", this.data.examConf.id);
      } else {
        GoogleAnalyticsUtils.event("Admin", `Created exam ${this.data.examConf.id} "${this.data.examConf.name}"`, "CreateExam", saved.examConf.id);
      }
    });
  }
}

class ProblemWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.problem;
  constructor(public data: ProblemConfWithVariants) {
    super();
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`/admin/problems/${this.data.problemConf.id}`, `Адмінка :: Задача "${this.data.problemConf.name}"`)
    });
  }
}

class StudentExamsWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.studentExams;
  constructor(public data: UserData, public sourceGroup: StudentGroup) {
    super();
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`/admin/students/${this.data.id}/exams`, `Адмінка :: Роботи студента ${this.data.id}`)
    });
  }
}

abstract class TestGroupWorkspaceData extends WorkspaceData {
  selectedParentGroupId: number;
  parentGroupOptions: DropdownOption[];
  notSelectedParentGroupOption = new DropdownOption(-1, "Не вибрано");

  constructor(public data: ITestGroupConfWithChildren, protected tcService: TestConfService, protected adminComponent: AdminComponent) {
    super();
    this.initialiseParentGroupOptions();
  }

  protected initialiseParentGroupOptions() {
    this.selectedParentGroupId = this.data.parentGroupId || this.notSelectedParentGroupOption.id;
    const forbiddenIds = this.getGroupAndChildrenIdsRecursively(this.data);
    this.parentGroupOptions = this.adminComponent
      .testsGroupConfsFlat
      .filter(g => !forbiddenIds.find(id => id === g.id))
      .map(g => new DropdownOption(g.id, g.name))
      .concat([this.notSelectedParentGroupOption])
  }

  protected getGroupAndChildrenIdsRecursively(group: ITestGroupConfWithChildren, initialValue: number[] = []): number[] {
    return group.childGroups.reduce((ids, g) => {
      return ids.concat(this.getGroupAndChildrenIdsRecursively(g, ids))
    }, initialValue.concat(group.id))
  }
}

class EditTestGroupWorkspaceData extends TestGroupWorkspaceData {
  type = WorkspaceDataTypes.testGroup;

  constructor(public data: ITestGroupConfWithTestConfs, tcService: TestConfService, adminComponent: AdminComponent) {
    super(data, tcService, adminComponent);
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`/admin/test-groups/${this.data.id}/edit`, `Адмінка :: Редагування групи тестів "${this.data.name}"`)
    });
  }

  save(name: string, parentGroupId: number = this.selectedParentGroupId) {
    let requestBody: ITestGroupConf = {
      id: this.data.id,
      name: name,
      parentGroupId: parentGroupId === this.notSelectedParentGroupOption.id ? undefined : parentGroupId
    };
    this.tcService.updateTestGroupConf(this.data.id, requestBody).subscribe({
      next: (updated: ITestGroupConf) => {
        this.adminComponent.loadTestGroupConfs();
        RMU.safe(() => {
          GoogleAnalyticsUtils.event("Admin", `Edited test group ${this.data.id}`, "EditTestGroup", this.data.id);
        });
        alert("Успішно збережено");
      },
      error: err => {
        this.errorMessage = err.toString();
        alert("Помилка під час збереження: " + JSON.stringify(err))
      }
    })
  }

  deleteTestConf(testConf: ITestEditDto) {
    if(window.confirm("Ви дійсно хочете видалити тест '" + testConf.question + "' ? " +
        "Це призведе до видалення тесту з усіх робіт де він використовувався.")) {
      this.tcService.deleteTestConf(this.data.id, testConf.id).subscribe({
        next: () => {
          const idx = this.data.testConfs.indexOf(testConf);
          this.data.testConfs.splice(idx, 1);
          alert("Успішно видалено");
        },
        error: err => {
          this.errorMessage = err.toString();
          alert("Помилка під час збереження: " + JSON.stringify(err))
        }
      })
    }
  }

  parentGroupChanged(option: DropdownOption) {
    if (option.id !== this.data.id) {
      let question = ""
      if (option.id === this.notSelectedParentGroupOption.id) {
        question = `Ви дійсно хочете зробити групу '${this.data.name}' незалежною групою вернього рівня?`
      } else {
        question = `Ви дійсно хочете перемістити групу '${this.data.name}' в групу '${option.text}' ? `
      }
      if(window.confirm(question)) {
        this.save(this.data.name, option.id);
      }
    }
  }

}

class AddTestGroupWorkspaceData extends TestGroupWorkspaceData {
  type = WorkspaceDataTypes.addTestGroup;

  constructor(public data: ITestGroupConfWithChildren, tcService: TestConfService, adminComponent: AdminComponent) {
    super(data, tcService, adminComponent);
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`/admin/test-groups/create-new`, `Адмінка :: Створення групи тестів`)
    });
  }

  save() {
    if(!this.data.name) {
      alert("Введіть ім'я групи");
      return;
    }
    let requestBody: ITestGroupConf = {
      id: -1,
      name: this.data.name,
      parentGroupId: this.selectedParentGroupId === this.notSelectedParentGroupOption.id
        ? undefined
        : this.selectedParentGroupId
    };
    this.tcService.createTestGroupConf(requestBody).subscribe({
      next: (result: ITestGroupConf) => {
        this.adminComponent.loadTestGroupConfs(() => {
          this.adminComponent.loadTestGroupConfById(result.id)
        });
        RMU.safe(() => {
          GoogleAnalyticsUtils.event("Admin", `Created test group ${result.id} ${result.name}`, "CreateTestGroup", result.id);
        });
        alert("Успішно збережено");
      },
      error: err => {
        this.errorMessage = err.toString();
        alert(err)
      }
    })
  }

  parentGroupChanged(option: DropdownOption) {
    this.selectedParentGroupId = option.id
  }
}

class EditTestConfWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.editTestConf;
  isSaving = false;

  constructor(public data: ITestEditDto, private tcService: TestConfService) {
    super();
    RMU.safe(() => {
      if (this.data.id > 0) {
        GoogleAnalyticsUtils.pageView(`/admin/test-confs/${this.data.id}/edit`, `Адмінка :: Редагування тесту "${this.data.id}"`)
      } else {
        GoogleAnalyticsUtils.pageView(`/admin/test-confs/${this.data.id}/create`, `Адмінка :: Створення тесту`)
      }
    });
  }

  save(updatedOrCreatedTest: ITestEditDto) {
    this.isSaving = true;
    const subscribeCallback = {
      next: (result: ITestEditDto) => {
        this.isSaving = false;
        updatedOrCreatedTest.id = result.id;
        updatedOrCreatedTest.imageUrl = result.imageUrl;
        updatedOrCreatedTest.help = result.help;
        updatedOrCreatedTest.options = result.options;
        RMU.safe(() => {
          if (updatedOrCreatedTest.id > 0) {
            GoogleAnalyticsUtils.event("Admin", `Edited test ${result.id}`, "EditTestConf", result.id);
          } else {
            GoogleAnalyticsUtils.event("Admin", `Created test ${result.id}`, "CreateTestConf", result.id);
          }
        });
        alert("Успішно збережено")
      },
      error: err => {
        this.isSaving = false;
        this.errorMessage = err.toString();
        alert(err)
      }
    };
    if(updatedOrCreatedTest.id > 0) {
      this.tcService.updateTestConf(
        updatedOrCreatedTest.groupId,
        updatedOrCreatedTest.id,
        updatedOrCreatedTest
      ).subscribe(subscribeCallback)
    } else {
      UserDefaults.EditTestConf.precision = updatedOrCreatedTest.precision;
      this.tcService.createTestConf(
        updatedOrCreatedTest.groupId,
        updatedOrCreatedTest
      ).subscribe(subscribeCallback)
    }
  }
}

class AddStudentGroupWorkspaceData extends WorkspaceData {
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
