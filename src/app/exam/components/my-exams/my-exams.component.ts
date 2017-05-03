import { Component, OnInit } from '@angular/core';
import { ExamService } from "../../data/exam-service.service";
import { IExamDto } from "../../data/exam.api-protocol";
import { Router, ActivatedRoute } from "@angular/router";
import { CurrentSession } from "../../../current-session";

@Component({
  selector: 'my-exams',
  templateUrl: './my-exams.component.html',
  styleUrls: ['./my-exams.component.css'],
  providers: [ExamService]
})
export class MyExamsComponent implements OnInit {
  exams: IExamDto[];
  loading = true;

  constructor(private examService: ExamService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.examService.getAvailableExamsForUser().subscribe(fetchedExams => {
      this.exams = fetchedExams;
      this.loading = false;
    });
  }

  getCurrentUserName() {
    if(CurrentSession.user) {
      return "Ви увійшли як: " + CurrentSession.user.firstName + " " + CurrentSession.user.lastName
    } else {
      return ""
    }
  }

  withStatus(e: IExamDto, s: string): IExamDto {
    let copied = JSON.parse(JSON.stringify(e));
    copied.status = s;
    return copied;
  }

  loadExam(exam: IExamDto) {
    this.router.navigate([exam.id], {relativeTo: this.route});
  }

}
