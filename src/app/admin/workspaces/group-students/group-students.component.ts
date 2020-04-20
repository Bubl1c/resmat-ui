import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { StudentGroup, UserData } from "../../../user/user.models";
import { GroupStudentsWorkspaceData } from "./group-students-workspace-data";
import { ApiService } from "../../../api.service";
import { IExamConf } from "../../../exam/data/exam.api-protocol";
import {
  StudentExamListComponentConf,
  StudentUserExam
} from "../../components/student-exams/student-exam-list/student-exam-list.component";

@Component({
  selector: 'group-students',
  templateUrl: './group-students.component.html',
  styleUrls: ['./group-students.component.css']
})
export class GroupStudentsComponent implements OnInit {

  @Input() workspaceData: GroupStudentsWorkspaceData;
  @Input() deletable: boolean = true;

  @Output() onResultsRequested = new EventEmitter<UserData>();
  @Output() onEditRequested = new EventEmitter<UserData>();
  @Output() onAddUserToCurrentGroup = new EventEmitter<StudentGroup>();

  tabs = {
    students: "students",
    learningMaterials: "learning-materials",
    operations: "operations",
    progress: "progress"
  };
  activeTab: string = this.tabs.students;

  constructor(private api: ApiService) {}

  ngOnInit() {
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  edit(student: UserData) {
    this.onEditRequested.emit(student);
  }

  results(student: UserData) {
    this.onResultsRequested.emit(student);
  }

  delete(student: UserData) {
    this.workspaceData.deleteStudent(student);
  }

  addUserToCurrentGroup() {
    this.onAddUserToCurrentGroup.emit(this.workspaceData.data);
  }

  unlockAllInGroup(group: StudentGroup) {
    if (window.confirm("Ви дійсно хочете РОЗблокувати всі роботи вгрупі " + group.name + "?")) {
      this.api.put("/user-exams/unlockAll?groupId=" + group.id, {}).subscribe(() => {
        alert("Успішно розблоковано")
      }, error => alert(error))
    }
  }

  lockAllInGroup(group: StudentGroup) {
    let hoursToLock = parseInt(prompt("На скільки годин блокуємо?", "24"));
    if (isNaN(hoursToLock) || hoursToLock < 0) {
      alert("Введено невірне значееня, введіть число більше 0");
      return;
    }
    if (window.confirm("Ви дійсно хочете ЗАблокувати всі роботи вгрупі " + group.name + "?")) {
      this.api.put("/user-exams/lockAll?groupId=" + group.id + "&hoursAmount=" + hoursToLock, {}).subscribe(() => {
        alert("Успішно зазблоковано")
      }, error => alert(error))
    }
  }

}
