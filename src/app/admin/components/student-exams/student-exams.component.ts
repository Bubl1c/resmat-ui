import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IExamConf, IExamDto } from "../../../exam/data/exam.api-protocol";
import { ExamService } from "../../../exam/data/exam-service.service";
import { UserData } from "../../../user/user.models";
import { GoogleAnalyticsUtils } from "../../../utils/GoogleAnalyticsUtils";
import { RMU } from "../../../utils/utils";
import { ApiService } from "../../../api.service";
import { IUserExamResult } from "../../../steps/exam.results-step";
import { ExamResult } from "../../../exam/components/exam-results/exam-results.component";

@Component({
  selector: 'student-exams',
  templateUrl: './student-exams.component.html',
  styleUrls: ['./student-exams.component.css'],
  providers: [ExamService]
})
export class StudentExamsComponent implements OnInit {
  @Input() student: UserData;
  @Input() examConfs: IExamConf[];
  @Input() deletable: boolean = true;

  @Output() onBackToGroup = new EventEmitter<void>();

  exams: IExamDto[];
  loading = true;

  showExamResult: boolean = false;
  examResults: IUserExamResult[];
  examResult: ExamResult;

  constructor(private examService: ExamService, private api: ApiService) { }

  ngOnInit() {
    this.examService.getAvailableExamsForUser(this.student.id).subscribe(fetchedExams => {
      this.exams = fetchedExams;
      this.loading = false;
    })
  }

  addExamForConf(ec: IExamConf) {
    if(window.confirm("Ви дійсно хочете створити роботу " + ec.name + "?")) {
      this.examService.createExamForStudent(ec.id, this.student.id).subscribe(created => {
        this.exams.unshift(created);
        RMU.safe(() => {
          GoogleAnalyticsUtils.event("Admin", `Added exam ${ec.id} for student ${this.student.id}`, "AddExamForStudent", ec.id);
        });
        alert("Успішно створена")
      }, error => alert(error))
    }
  }

  deleteExam(ec: IExamDto) {
    if(window.confirm("Ви дійсно хочете видалити роботу " + ec.name + "(" + ec.id + ")?")) {
      this.examService.deleteExam(ec.id).subscribe(() => {
        let index = this.exams.findIndex(e => e.id == ec.id);
        if (index > -1) {
          this.exams.splice(index, 1);
        }
        RMU.safe(() => {
          GoogleAnalyticsUtils.event("Admin", `Deleted exam ${ec.id} for student ${this.student.id}`, "DeleteExamForStudent", ec.id);
        });
        alert("Успішно видалено")
      }, error => alert(error))
    }
  }

  toggleLock(ec: IExamDto) {
    if(ec.lockedUntil) {
      this.unlock(ec)
    } else {
      this.lock(ec)
    }
  }

  unlock(ec: IExamDto) {
    if(window.confirm("Ви дійсно хочете розблокувати роботу " + ec.name + "(" + ec.id + ")?")) {
      this.examService.unlockExam(ec.id).subscribe(updated => {
        let index = this.exams.findIndex(e => e.id == updated.id);
        this.exams[index] = updated;
        RMU.safe(() => {
          GoogleAnalyticsUtils.event("Admin", `Unlocked exam ${ec.id} for student ${this.student.id}`, "UnlockExamForStudent", ec.id);
        });
        alert("Успішно розблоковано")
      }, error => alert(error))
    }
  }

  lock(ec: IExamDto) {
    let hoursToLock = parseInt(prompt("На скільки годин блокуємо?", "24"));
    if(isNaN(hoursToLock) || hoursToLock < 0) {
      alert("Введено невірне значееня, введіть число більше 0")
      return;
    }
    if(window.confirm("Ви дійсно хочете заблокувати роботу " + ec.name + "(" + ec.id + ") на " + hoursToLock + " годин?")) {
      this.examService.lockExam(ec.id, hoursToLock).subscribe(updated => {
        let index = this.exams.findIndex(e => e.id == updated.id);
        this.exams[index] = updated;
        RMU.safe(() => {
          GoogleAnalyticsUtils.event("Admin", `Locked exam ${ec.id} for student ${this.student.id}`, "LockExamForStudent", ec.id);
        });
        alert("Успішно заблоковано")
      }, error => alert(error))
    }
  }

  emitBackToGroup() {
    this.onBackToGroup.emit()
  }

  loadExamResult(exam: IExamDto) {
    if (!this.examResults) {
      this.api.get("/user-exams/results?userId=" + this.student.id).subscribe((results: IUserExamResult[]) => {
        this.examResults = results;
        this.examResult = ExamResult.create(this.examResults.find(r => r.userExamId == exam.id));
        this.showExamResult = true;
      }, err => alert(err));
    } else {
      this.examResult = ExamResult.create(this.examResults.find(r => r.userExamId == exam.id));
      this.showExamResult = true;
    }
  }

  hideExamResult() {
    this.showExamResult = false;
  }

}
