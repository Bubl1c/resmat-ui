import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IExamDto } from "../../../../exam/data/exam.api-protocol";
import { RMU } from "../../../../utils/utils";
import { GoogleAnalyticsUtils } from "../../../../utils/GoogleAnalyticsUtils";
import { ExamResult } from "../../../../exam/components/exam-results/exam-results.component";
import { ExamService } from "../../../../exam/data/exam-service.service";
import { ApiService } from "../../../../api.service";
import { UserData } from "../../../../user/user.models";

export interface StudentUserExam {
  exam: IExamDto
  student?: UserData
}

export interface StudentExamListComponentConf {
  deletable?: boolean
  showStudentInfoInsteadOfExam?: boolean
}

@Component({
  selector: 'student-exam-list',
  templateUrl: './student-exam-list.component.html',
  styleUrls: ['./student-exam-list.component.css']
})
export class StudentExamListComponent implements OnInit {

  @Input() exams: StudentUserExam[];
  @Input() conf?: StudentExamListComponentConf;

  showExamResult: boolean = false;
  examResult: ExamResult;

  loading = true;

  constructor(private examService: ExamService) {
    this.conf = this.conf || {};
    this.conf = {
      deletable: this.conf.deletable || false,
      showStudentInfoInsteadOfExam: this.conf.showStudentInfoInsteadOfExam || false
    }
  }

  ngOnInit() {
  }

  deleteExam(sue: StudentUserExam) {
    const ue = sue.exam;
    if (window.confirm("Ви дійсно хочете видалити роботу " + ue.name + "(" + ue.id + ")?")) {
      this.examService.deleteExam(ue.id).subscribe(() => {
        let index = this.exams.findIndex(e => e.exam.id == ue.id);
        if (index > -1) {
          this.exams.splice(index, 1);
        }
        RMU.safe(() => {
          GoogleAnalyticsUtils.event("Admin", `Deleted exam ${ue.id} for student ${ue.userId}`, "DeleteExamForStudent", ue.id);
        });
      }, error => alert(error))
    }
  }

  toggleLock(sue: StudentUserExam) {
    if (sue.exam.lockedUntil) {
      this.unlock(sue.exam)
    } else {
      this.lock(sue.exam)
    }
  }

  unlock(ue: IExamDto) {
    if (window.confirm("Ви дійсно хочете розблокувати роботу " + ue.name + "(" + ue.id + ")?")) {
      this.examService.unlockExam(ue.id).subscribe(updated => {
        let index = this.exams.findIndex(e => e.exam.id == updated.id);
        this.exams[index].exam = updated;
        RMU.safe(() => {
          GoogleAnalyticsUtils.event("Admin", `Unlocked exam ${ue.id} for student ${ue.userId}`, "UnlockExamForStudent", ue.id);
        });
      }, error => alert(error))
    }
  }

  lock(ue: IExamDto) {
    let hoursToLock = parseInt(prompt("На скільки годин блокуємо?", "24"));
    if (isNaN(hoursToLock) || hoursToLock < 0) {
      alert("Введено невірне значееня, введіть число більше 0");
      return;
    }
    if (window.confirm("Ви дійсно хочете заблокувати роботу " + ue.name + "(" + ue.id + ") на " + hoursToLock + " годин?")) {
      this.examService.lockExam(ue.id, hoursToLock).subscribe(updated => {
        let index = this.exams.findIndex(e => e.exam.id == updated.id);
        this.exams[index].exam = updated;
        RMU.safe(() => {
          GoogleAnalyticsUtils.event("Admin", `Locked exam ${ue.id} for student ${ue.userId}`, "LockExamForStudent", ue.id);
        });
      }, error => alert(error))
    }
  }

  loadExamResult(sue: StudentUserExam) {
    this.examService.getUserExamResult(sue.exam.id).subscribe(result => {
      this.examResult = result;
      this.showExamResult = true;
    }, error => alert(error))
  }

  hideExamResult() {
    this.showExamResult = false;
  }

}
