import { Component, OnInit } from '@angular/core';
import { ExamService } from "../../data/exam-service.service";
import { IExamDto } from "../../data/exam.api-protocol";
import { Router, ActivatedRoute } from "@angular/router";
import { CurrentSession } from "../../../current-session";
import { GoogleAnalyticsUtils } from "../../../utils/GoogleAnalyticsUtils";
import { AfterViewInit } from "@angular/core/src/metadata/lifecycle_hooks";
import { RMU } from "../../../utils/utils";

@Component({
  selector: 'my-exams',
  templateUrl: './my-exams.component.html',
  styleUrls: ['./my-exams.component.css'],
  providers: [ExamService]
})
export class MyExamsComponent implements OnInit, AfterViewInit {
  exams: IExamDto[];
  loading = true;

  constructor(private examService: ExamService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.examService.getAvailableExamsForUser().subscribe(fetchedExams => {
      this.exams = fetchedExams;
      this.loading = false;
    });
  }

  ngAfterViewInit(): void {
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`users/${CurrentSession.user.id}/exams`, "Іспити користувача")
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
