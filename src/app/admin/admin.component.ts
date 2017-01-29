import { Component, OnInit } from '@angular/core';
import { ApiService } from "../api.service";
import { Router } from "@angular/router";
import { UserData, UserType, StudentGroup } from "../user/user.models";
import { CurrentSession } from "../current-session";
import { UserComponentConfig } from "./components/user/user.component";
import { ExamResult } from "../exam/components/exam-results/exam-results.component";

class WorkspaceDataTypes {
  static user = "user";
  static groupStudents = "group-students";
  static examResults = "exam-results"
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
    this.loadGroups()
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
    let results = [
      new ExamResult(1, "Семестрова контрольна робота", "Кільцева пластина", student.firstName + " " + student.lastName, studentGroup.name, 3, 5, 1, 3435634, 88, 100),
      new ExamResult(2, "Атестаційна контрольна робота", "Кільцева пластина", student.firstName + " " + student.lastName, studentGroup.name, 2, 3, 1, 3435634, 95, 100)
    ];
    this.workspaceData = new ExamResultWorkspaceData(results);
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


}
