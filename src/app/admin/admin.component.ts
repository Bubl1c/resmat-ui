import { Component, OnInit } from "@angular/core";
import { ApiService } from "../api.service";
import { Router } from "@angular/router";
import { UserData, UserType, StudentGroup } from "../user/user.models";
import { CurrentSession } from "../current-session";
import { UserComponentConfig } from "./components/user/user.component";
import { ExamResult } from "../exam/components/exam-results/exam-results.component";
import { IUserExamResult } from "../steps/exam.results-step";
import { IExamDto } from "../exam/data/exam.api-protocol";
import { IExamConfWithSteps, IExamConf, IExamStepConf } from "./components/exam-conf/exam-conf.component";
import {
  IProblemConf, IProblemVariantConf,
  IProblemConfWithVariants
} from "./components/problem-conf/problem-conf.component";

class WorkspaceDataTypes {
  static user = "user";
  static groupStudents = "group-students";
  static examResults = "exam-results";
  static exam = "exam"
  static problem = "problem";
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

class GroupStudentsWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.groupStudents;
  constructor(public data: UserData[]) {
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

  loadStudentsByGroup(group: StudentGroup) {
    this.api.get("/student-groups/" + group.id + "/students").subscribe({
      next: (students: any[]) => {
        let mappedStudents = students.map(UserData.fromApi);
        this.workspaceData = new GroupStudentsWorkspaceData(mappedStudents);
      },
      error: err => {
        this.errorMessage = err.toString()
      }
    })
  }

  loadStudentResults(student: UserData) {
    let studentGroup = this.studentGroups.find(group => group.id === student.studentGroupId);
    this.api.get("/user-exams/results?userId=" + student.id).subscribe((results: IUserExamResult[]) => {
      this.workspaceData = new ExamResultWorkspaceData(results.map(r => ExamResult.create(r)));
    }, err => alert(err));
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
}
