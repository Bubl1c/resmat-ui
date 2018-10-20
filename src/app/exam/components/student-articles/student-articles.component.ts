import { AfterViewInit, Component, OnInit } from '@angular/core';
import {ApiService} from "../../../api.service";
import {ArticleDto} from "../../../admin/components/article-editor/article-editor.component";
import {CurrentSession} from "../../../current-session";
import {Router} from "@angular/router";
import { GoogleAnalyticsUtils } from "../../../utils/GoogleAnalyticsUtils";
import { RMU } from "../../../utils/utils";

@Component({
  selector: 'student-articles',
  templateUrl: './student-articles.component.html',
  styleUrls: ['./student-articles.component.css']
})
export class StudentArticlesComponent implements OnInit, AfterViewInit {

  isLoading: boolean = true;
  availableArticles: ArticleDto[] = [];
  articleDetails: ArticleDto;

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit() {
    if(!CurrentSession.user) {
      this.router.navigate(['/login']);
      return;
    }
    const groupId = CurrentSession.user.studentGroupId;
    if(!groupId) {
      alert("Не вдалося визначити групу користувача: " + JSON.stringify(CurrentSession.user));
      this.availableArticles = [];
      this.isLoading = false;
      return;
    }
    console.log("Hey");
    this.api.get(`/articles?own=true`).subscribe({
      next: (articles: ArticleDto[]) => {
        articles.forEach(a => this.availableArticles.push(a));
        this.isLoading = false;
      },
      error: e => alert("Не вдалося завантажити навчальні матеріали: " + JSON.stringify(e)),
      complete: () => this.isLoading = false,
    })
  }

  ngAfterViewInit(): void {
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`users/${CurrentSession.user.id}/study`, "Навчальні матеріали користувача")
    });
  }

  viewDetails(article: ArticleDto) {
    this.articleDetails = article;
  }

  backToList() {
    this.articleDetails = null;
  }

}
