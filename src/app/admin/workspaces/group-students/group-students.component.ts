import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { StudentGroup, UserData } from "../../../user/user.models";
import { GroupStudentsWorkspaceData } from "./group-students-workspace-data";
import { ApiService } from "../../../api.service";
import { IExamConf } from "../../../exam/data/exam.api-protocol";
import {
  StudentExamListComponentConf,
  StudentUserExam
} from "../../components/student-exams/student-exam-list/student-exam-list.component";
import { DocxParser } from "../../../utils/docx-parser";
import { TestEdit } from "../../components/edit-test-conf/edit-test-conf.component";
import { NumberUtils } from "../../../utils/NumberUtils";
import { Observable } from "rxjs";

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
    operations: "operations",
    progress: "progress",
    upload: "upload",
    learningMaterials: "learning-materials"
  };
  activeTab: string = this.tabs.students;

  parsedStudents: UserData[];
  isSavingParsedStudents: boolean = false;

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

  fileAdded(file: File) {
    const groupId = this.workspaceData.data.id;
    const groupName = this.workspaceData.data.name;
    DocxParser.loadFileAndParseOutUsers(file).then(users => {
      if (users.length < 1) {
        alert("В вибраному файлі не знайдено жодного студента");
        return;
      }
      const parsedUsers = UserData.fromSimpleBulk(groupId, groupName, users);
      this.parsedStudents = parsedUsers;
      alert(`Завантажено ${parsedUsers.length} студентів. Вони ще НЕ ЗБЕРЕЖЕНІ, натисніть ЗБЕРЕГТИ для збереження.`);
    }, error => {
      alert("Не вдалося завантажити студентів з файлу. Причина: " + JSON.stringify(error))
    })
  };

  deleteFromParsedStudents(index: number): void {
    this.parsedStudents.splice(index, 1)
  }

  saveParsedStudents(replaceExisting: boolean): void {
    if (!this.parsedStudents || !this.parsedStudents.length) {
      return
    }
    const consent = replaceExisting
      ? `Ви дійсно хочете ЗАМІНИТИ всіх існуючих студентів на ${this.parsedStudents.length} нових в групі '${this.workspaceData.data.name}'?`
      : `Ви дійсно хочете ДОДАТИ ${this.parsedStudents.length} нових студентів в групу '${this.workspaceData.data.name}'?`;
    if (window.confirm(consent)) {
      this.isSavingParsedStudents = true;
      const toSendAll = this.parsedStudents.map(ps => {
        const toSend = JSON.parse(JSON.stringify(ps));
        toSend.userType = ps.userType.id as any;
        return toSend;
      });
      const replaceParam = replaceExisting ? '?replaceExisting=true' : "";
      this.api.post(`/student-groups/${this.workspaceData.data.id}/students/bulk${replaceParam}`, toSendAll).subscribe(success => {
        alert(`Успішно збережено ${this.parsedStudents.length} студентів.`);
        this.isSavingParsedStudents = false;
        this.parsedStudents = [];
        this.workspaceData.loadStudentsByGroup();
        this.switchTab(this.tabs.students)
      }, error => {
        this.isSavingParsedStudents = false;
        console.error(error);
        alert(`Не вдалося зберегти студентів студентів. Причина: ${JSON.stringify(error)}`)
      })
    }
  }

}
