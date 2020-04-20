import { Component, OnInit } from "@angular/core";
import { ApiService } from "../api.service";
import { Router } from "@angular/router";
import { StudentGroup, UserData, UserType } from "../user/user.models";
import { CurrentSession } from "../current-session";
import { ProblemConfWithVariants, } from "./components/problem-conf/problem-conf.component";
import { ITestEditDto } from "../exam/data/test-set.api-protocol";
import { TestEdit } from "./components/edit-test-conf/edit-test-conf.component";
import { ITestGroupConf, ITestGroupConfWithChildren } from "./components/test-group-list/test-group-list.component";
import { IExamConf, IExamConfDto } from "../exam/data/exam.api-protocol";
import {
  newDefaultExamStepConfInstance,
  newExamConf,
  newResultsExamStepConfInstance
} from "./components/edit-exam-conf/examConfConstants";
import { TestConfService } from "./data/test-conf.service";
import { AfterViewInit } from "@angular/core/src/metadata/lifecycle_hooks";
import { GoogleAnalyticsUtils } from "../utils/GoogleAnalyticsUtils";
import { RMU } from "../utils/utils";
import { ProblemConf } from "../steps/exam.task-flow-step";
import { ExamService } from "../exam/data/exam-service.service";
import { WorkspaceData, WorkspaceDataTypes } from "./workspaces/workspace-data";
import { UserWorkspaceData } from "./workspaces/user-workspace-data";
import { ArticlesWorkspaceData } from "./workspaces/articles-workspace-data";
import { GroupStudentsWorkspaceData } from "./workspaces/group-students/group-students-workspace-data";
import { StudentExamsWorkspaceData } from "./workspaces/student-exams-workspace-data";
import { ExamWorkspaceData } from "./workspaces/exam-workspace-data";
import { ProblemWorkspaceData } from "./workspaces/problem-workspace-data";
import {
  AddTestGroupWorkspaceData,
  EditTestGroupWorkspaceData,
  ITestGroupConfWithTestConfs
} from "./workspaces/test-group-workspace-data";
import { AddStudentWorkspaceData } from "./workspaces/add-student-workspace-data";
import { AddStudentGroupWorkspaceData } from "./workspaces/add-student-group-workspace-data";
import { EditTestConfWorkspaceData } from "./workspaces/edit-test-conf-workspace-data";
import { UserComponentConfig } from "./components/user/user.component";
import { ArchiveWorkspaceData } from "./workspaces/archive-workspace/archive-workspace-data";

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

  constructor(private router: Router, private api: ApiService, private tcService: TestConfService, private examService: ExamService) {
  }

  ngAfterViewInit(): void {
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView("/admin", "Admin")
    });
  }

  ngOnInit() {
    this.currentUser = CurrentSession.user;
    console.log("Current user", this.currentUser);
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.userPermission = this.currentUser.userType.rate;
    if (this.userPermission >= UserType.admin.rate) {
      this.loadUsers();
      this.loadProblemConfs();
    }
    if (this.userPermission >= UserType.instructor.rate) {
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

  emptyWorkspace() {
    this.workspaceData = undefined;
  }

  loadCreateUser() {
    this.workspaceData = new UserWorkspaceData(UserData.empty(), this.api, this);
  }

  loadEditUser(user: UserData, isEditStudent: boolean = false, sourceStudentGroup?: StudentGroup) {
    this.workspaceData = new UserWorkspaceData(user, this.api, this, isEditStudent, sourceStudentGroup);
  }
  loadStudentResults(student: UserData, sourceGroup: StudentGroup) {
    this.workspaceData = new StudentExamsWorkspaceData(student, sourceGroup);
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
      childGroups: [],
      isArchived: false
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
    if (!testConf) {
      testConf = new TestEdit();
      testConf.groupId = groupId;
    }
    this.workspaceData = new EditTestConfWorkspaceData(testConf, this.tcService, this)
  }

  addUserToCurrentGroup(group: StudentGroup) {
    this.workspaceData = new AddStudentWorkspaceData(group)
  }

  addStudent(student: UserData) {
    let toSend = JSON.parse(JSON.stringify(student));
    toSend.userType = toSend.userType.id;
    this.api.post(`/student-groups/${student.studentGroupId}/students`, toSend).subscribe({
      next: (users: any[]) => {
        let group = this.studentGroups.find(sg => student.studentGroupId === sg.id);
        this.loadGroupStudentsWorkspace(group);
      },
      error: err => {
        alert(err.toString())
      }
    })
  }

  loadGroupStudentsWorkspace(group: StudentGroup) {
    if (this.workspaceData && this.workspaceData.type === WorkspaceDataTypes.groupStudents) {
      const current = this.workspaceData as GroupStudentsWorkspaceData;
      this.workspaceData = new GroupStudentsWorkspaceData(group, this.examConfs, this.api, this.examService, this, current.selectedExamConf);
    } else {
      this.workspaceData = new GroupStudentsWorkspaceData(group, this.examConfs, this.api, this.examService, this);
    }
  }

  loadArchiveWorkspace() {
    this.workspaceData = new ArchiveWorkspaceData(null, this.api, this.tcService, this);
  }
}
