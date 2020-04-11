import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IExamConf, IExamDto } from "../../../exam/data/exam.api-protocol";
import { ExamService } from "../../../exam/data/exam-service.service";
import { UserData } from "../../../user/user.models";
import { GoogleAnalyticsUtils } from "../../../utils/GoogleAnalyticsUtils";
import { RMU } from "../../../utils/utils";
import { ApiService } from "../../../api.service";
import { IUserExamResult } from "../../../steps/exam.results-step";
import { ExamResult } from "../../../exam/components/exam-results/exam-results.component";
import { StudentExamListComponentConf, StudentUserExam } from "./student-exam-list/student-exam-list.component";

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

  studentExamListConf: StudentExamListComponentConf;
  exams: StudentUserExam[];
  loading = true;

  constructor(private examService: ExamService, private api: ApiService) {
    this.studentExamListConf = {
      deletable: this.deletable
    }
  }

  ngOnInit() {
    this.examService.getAvailableExamsForUser(this.student.id).subscribe(fetchedExams => {
      this.exams = fetchedExams.map(e => ({
        exam: e,
        student: this.student
      }));
      this.loading = false;
    })
  }

  addExamForConf(ec: IExamConf) {
    if(window.confirm("Ви дійсно хочете створити роботу " + ec.name + "?")) {
      this.examService.createExamForStudent(ec.id, this.student.id).subscribe(created => {
        this.exams.unshift({
          exam: created,
          student: this.student
        });
        RMU.safe(() => {
          GoogleAnalyticsUtils.event("Admin", `Added exam ${ec.id} for student ${this.student.id}`, "AddExamForStudent", ec.id);
        });
        alert("Успішно створена")
      }, error => alert(error))
    }
  }

}
