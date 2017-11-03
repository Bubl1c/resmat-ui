import {Component, group, OnInit} from "@angular/core";
import {ApiService} from "../api.service";
import {Router} from "@angular/router";
import {StudentGroup, UserData, UserType} from "../user/user.models";
import {CurrentSession} from "../current-session";
import {UserComponentConfig} from "./components/user/user.component";
import {ExamResult} from "../exam/components/exam-results/exam-results.component";
import {IExamConf, IExamConfWithSteps, IExamStepConf} from "./components/exam-conf/exam-conf.component";
import {
  IProblemConf,
  IProblemConfWithVariants,
  IProblemVariantConf
} from "./components/problem-conf/problem-conf.component";
import {ITestEditDto} from "../exam/data/test-set.api-protocol";
import {TestEdit} from "./components/edit-test-conf/edit-test-conf.component";
import {ArticleDto} from "./components/article-editor/article-editor.component";
import {SelectableItem} from "../components/item-selector/item-selector.component";
import {Observable} from "rxjs/Observable";

class WorkspaceDataTypes {
  static user = "user";
  static addStudent = "add-student";
  static groupStudents = "group-students";
  static examResults = "exam-results";
  static exam = "exam";
  static problem = "problem";
  static studentExams = "student_exams";
  static testGroup = "test_group";
  static editTestConf = "edit_test_conf";
  static addTestGroup = "add_test_group";
  static articles = "articles";
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
  }

  save(user: UserData) {
    if(user.id) {
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
          alert('Збережено успішно')
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
      },
      error: (e) => alert(JSON.stringify(e)),
      complete: () => this.newArticleHeader = undefined,
    });
  }
  show(article: ArticleDto) {
    this.showArticles = false;
    this.articleToShow = article;
  }
  edit(article: ArticleDto) {
    this.showArticles = false;
    this.articleToEdit = article;
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
  }
}

class GroupStudentsWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.groupStudents;
  selectableArticles: SelectableItem[] = [];
  itemSelectorConfig = {
    mutateInput: true
  };

  constructor(public data: UserData[], public group: StudentGroup, private api: ApiService) {
    super();
    this.loadSelectableArticles();
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
    this.api.put(
      `/student-groups/${this.group.id}/articles`,
      this.selectableArticles.filter(a => a.isSelected).map(a => a.id)
    ).subscribe({
      next: () => alert("Успішно збережено"),
      error: e => alert("Не вдалося зберегти вибрані матеріали")
    })
  }

  saveGroupName(editedGroupName: string) {
    const previousName = this.group.name;
    this.group.name = editedGroupName;
    this.api.put(`/student-groups/${this.group.id}`, this.group).subscribe({
      next: () => alert("Успішно збережено"),
      error: e => {
        this.group.name = previousName;
        alert("Не вдалося оновити ім'я групи: " + JSON.stringify(e))
      }
    })
  }
}

class ExamResultWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.examResults;
  constructor(public data: ExamResult[]) {
    super();
  }
}

class ExamWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.exam;
  constructor(public data: IExamConfWithSteps) {
    super();
  }
}

class ProblemWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.problem;
  constructor(public data: IProblemConfWithVariants) {
    super();
  }
}

class StudentExamsWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.studentExams;
  constructor(public data: UserData) {
    super();
  }
}

class TestGroupWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.testGroup;
  constructor(public data: ITestGroupConfWithTestConfs, private api: ApiService, private adminComponent: AdminComponent) {
    super();
  }

  save(name: string) {
    this.data.name = name;
    this.api.put("/test-groups/" + this.data.id, this.data).subscribe({
      next: (updated: ITestGroupConf) => {
        this.adminComponent.loadTestGroupConfs();
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
      this.api.delete("/test-groups/" + this.data.id + "/tests/" + testConf.id).subscribe({
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
}

class EditTestConfWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.editTestConf;
  isSaving = false;

  constructor(public data: ITestEditDto, private api: ApiService) {
    super();
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
        alert("Успішно збережено")
      },
      error: err => {
        this.isSaving = false;
        this.errorMessage = err.toString();
        alert(err)
      }
    };
    if(updatedOrCreatedTest.id > 0) {
      this.api.put(
        "/test-groups/" + updatedOrCreatedTest.groupId + "/tests/" + updatedOrCreatedTest.id, updatedOrCreatedTest
      ).subscribe(subscribeCallback)
    } else {
      this.api.post(
        "/test-groups/" + updatedOrCreatedTest.groupId + "/tests", updatedOrCreatedTest
      ).subscribe(subscribeCallback)
    }
  }
}

class AddTestGroupWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.addTestGroup;
  constructor(public data: string, private api: ApiService, private adminComponent: AdminComponent) {
    super();
  }

  save() {
    if(!this.data) {
      alert("Введіть ім'я групи");
      return;
    }
    this.api.post(
      "/test-groups", {id: -1, name: this.data}
    ).subscribe({
      next: (result: ITestGroupConf) => {
        this.adminComponent.loadTestGroupConfs();
        this.data = "";
        alert("Успішно збережено");
      },
      error: err => {
        this.errorMessage = err.toString();
        alert(err)
      }
    })
  }
}

class AddStudentGroupWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.addTestGroup;
  constructor(public data: string, private api: ApiService, private adminComponent: AdminComponent) {
    super();
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
        alert("Успішно збережено");
      },
      error: err => {
        this.errorMessage = err.toString();
        alert(err)
      }
    })
  }
}

interface ITestGroupConfWithTestConfs extends ITestGroupConf {
  testConfs: ITestEditDto[]
}

interface ITestGroupConf {
  id: number
  name: string
}

@Component({
  selector: 'admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
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
  problemConfs: IProblemConf[];

  testsGroupConfs: ITestGroupConf[];

  workspaceData: WorkspaceData;

  constructor(private router: Router, private api: ApiService) { }

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
        this.workspaceData = new GroupStudentsWorkspaceData(mappedStudents, group, this.api);
      },
      error: err => {
        this.errorMessage = err.toString()
      }
    })
  }

  loadStudentResults(student: UserData) {
    // let studentGroup = this.studentGroups.find(group => group.id === student.studentGroupId);
    // this.api.get("/user-exams/results?userId=" + student.id).subscribe((results: IUserExamResult[]) => {
    //   this.workspaceData = new ExamResultWorkspaceData(results.map(r => ExamResult.create(r)));
    // }, err => alert(err));
    this.workspaceData = new StudentExamsWorkspaceData(student);
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

  loadExamConfs() {
    this.api.get("/exam-confs").subscribe({
      next: (examConfs: IExamConf[]) => {
        this.examConfs = examConfs
      },
      error: err => {
        this.errorMessage = err.toString();
        alert(err)
      }
    })
  }

  loadExamConf(examConfId: number) {
    this.api.get("/exam-confs/" + examConfId + "/dto").subscribe({
      next: (examConfDto: any) => {
        let ec: IExamConf = examConfDto.examConf;
        let stepConfs: IExamStepConf[] = examConfDto.stepConfs;
        let ecWithSteps: IExamConfWithSteps = {
          id: ec.id,
          name: ec.name,
          description: ec.description,
          maxScore: ec.maxScore,
          steps: stepConfs
        };
        this.workspaceData = new ExamWorkspaceData(ecWithSteps)
      },
      error: err => {
        this.errorMessage = err.toString();
        alert(err)
      }
    })
  }

  loadProblemConfs() {
    this.api.get("/problem-confs").subscribe({
      next: (problemConfs: IProblemConf[]) => {
        this.problemConfs = problemConfs
      },
      error: err => {
        this.errorMessage = err.toString();
        alert(err)
      }
    })
  }

  loadProblemConf(problemConfId: number) {
    this.api.get("/problem-confs/" + problemConfId + "/with-variants").subscribe({
      next: (problemConfWithVariants: any) => {
        let pc: IProblemConf = problemConfWithVariants.problemConf;
        let variants: IProblemVariantConf[] = problemConfWithVariants.variants;
        let pcwv: IProblemConfWithVariants = {
          id: pc.id,
          name: pc.name,
          problemType: pc.problemType,
          inputVariableConfs: pc.inputVariableConfs,
          variants: variants
        };
        this.workspaceData = new ProblemWorkspaceData(pcwv)
      },
      error: err => {
        this.errorMessage = err.toString();
        alert(err)
      }
    })
  }

  loadTestGroupConfs() {
    this.api.get("/test-groups").subscribe({
      next: (testGroupConfs: ITestGroupConf[]) => {
        this.testsGroupConfs = testGroupConfs;
      },
      error: err => {
        this.errorMessage = err.toString();
        alert(err)
      }
    })
  }

  addTestGroupConf() {
    this.workspaceData = new AddTestGroupWorkspaceData("", this.api, this)
  }


  loadTestGroupConf(testGroupConf: ITestGroupConf) {
    this.api.get("/test-groups/" + testGroupConf.id + "/tests").subscribe({
      next: (testGroupTestConfs: ITestEditDto[]) => {
        let copy = Object.assign({}, testGroupConf) as ITestGroupConfWithTestConfs;
        copy.testConfs = testGroupTestConfs;
        this.workspaceData = new TestGroupWorkspaceData(copy, this.api, this)
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
    this.workspaceData = new EditTestConfWorkspaceData(testConf, this.api)
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
