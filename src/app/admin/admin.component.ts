import {Component, OnInit} from "@angular/core";
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
  constructor(public data: UserData, private api: ApiService) {
    super();
  }

  save(user: UserData) {
    this.api.put("/api-users/" + user.id, user).subscribe({
      next: savedUser => {
        this.config.disabled = false;
      },
      error: err => {
        this.errorMessage = err.toString();
      }
    })
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
    //call api
    this.showArticles = false;
    this.articleToEdit = {
      id: 2222,
      header: this.newArticleHeader,
      preview: '',
      body: '',
      meta: {
        visible: false,
        uploadedFileUrls: []
      }
    };
    this.newArticleHeader = undefined;
    this.data.unshift(this.articleToEdit)
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
    for(let i = 0; i < this.data.length; i++) {
      let cur = this.data[i];
      if(cur.id === article.id) {
        cur[i] = article;
      }
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
  constructor(public data: UserData[], public group: StudentGroup) {
    super();
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
  isAdmin: boolean;

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
    this.isAdmin = this.currentUser.userType == UserType.admin;
    if(this.isAdmin) {
      this.loadUsers()
    }
    this.loadGroups();
    this.loadExamConfs();
    this.loadProblemConfs();
    this.loadTestGroupConfs();
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

  loadEditUser(user: UserData) {
    this.workspaceData = new UserWorkspaceData(user, this.api);
  }

  loadArticles() {
    this.workspaceData = new ArticlesWorkspaceData([
      {
        id: 1,
        "header": "Lorem Ipsum",
        "preview": "<h2>Что такое Lorem Ipsum?</h2>\n<p><strong>Lorem Ipsum</strong>&nbsp;- это текст-\"рыба\", часто используемый в печати и вэб-дизайне. Lorem Ipsum является стандартной \"рыбой\" для текстов на латинице с начала XVI века. В то время некий безымянный печатник создал большую коллекцию размеров и форм шрифтов, используя Lorem Ipsum для распечатки образцов. Lorem Ipsum не только успешно пережил без заметных изменений пять веков, но и перешагнул в электронный дизайн. Его популяризации в новое время послужили публикация листов Letraset с образцами Lorem Ipsum в 60-х годах и, в более недавнее время, программы электронной вёрстки типа Aldus PageMaker, в шаблонах которых используется Lorem Ipsum.</p>",
        "body": "<div>\n<h2>Почему он используется?</h2>\n<p>Давно выяснено, что при оценке дизайна и композиции читаемый текст мешает сосредоточиться. Lorem Ipsum используют потому, что тот обеспечивает более или менее стандартное заполнение шаблона, а также реальное распределение букв и пробелов в абзацах, которое не получается при простой дубликации \"Здесь ваш текст.. Здесь ваш текст.. Здесь ваш текст..\" Многие программы электронной вёрстки и редакторы HTML используют Lorem Ipsum в качестве текста по умолчанию, так что поиск по ключевым словам \"lorem ipsum\" сразу показывает, как много веб-страниц всё ещё дожидаются своего настоящего рождения. За прошедшие годы текст Lorem Ipsum получил много версий. Некоторые версии появились по ошибке, некоторые - намеренно (например, юмористические варианты).</p>\n</div>\n<p>&nbsp;</p>\n<div>\n<h2>Откуда он появился?</h2>\n<p>Многие думают, что Lorem Ipsum - взятый с потолка псевдо-латинский набор слов, но это не совсем так. Его корни уходят в один фрагмент классической латыни 45 года н.э., то есть более двух тысячелетий назад. Ричард МакКлинток, профессор латыни из колледжа Hampden-Sydney, штат Вирджиния, взял одно из самых странных слов в Lorem Ipsum, \"consectetur\", и занялся его поисками в классической латинской литературе. В результате он нашёл неоспоримый первоисточник Lorem Ipsum в разделах 1.10.32 и 1.10.33 книги \"de Finibus Bonorum et Malorum\" (\"О пределах добра и зла\"), написанной Цицероном в 45 году н.э. Этот трактат по теории этики был очень популярен в эпоху Возрождения. Первая строка Lorem Ipsum, \"Lorem ipsum dolor sit amet..\", происходит от одной из строк в разделе 1.10.32</p>\n</div>",
        "meta": { visible: false, "uploadedFileUrls": [] }
      }
    ], this.api, this);
  }

  loadStudentsByGroup(group: StudentGroup) {
    this.api.get("/student-groups/" + group.id + "/students").subscribe({
      next: (students: any[]) => {
        let mappedStudents = students.map(UserData.fromApi);
        this.workspaceData = new GroupStudentsWorkspaceData(mappedStudents, group);
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
    this.api.post("/api-users", toSend).subscribe({
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
