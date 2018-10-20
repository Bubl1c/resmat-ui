import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import {ArticleDto} from "../../admin/components/article-editor/article-editor.component";
import {Router} from "@angular/router";
import {ApiService} from "../../api.service";
import { GoogleAnalyticsUtils } from "../../utils/GoogleAnalyticsUtils";
import { RMU } from "../../utils/utils";

@Component({
  selector: 'article-list',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.css']
})
export class ArticleListComponent implements OnInit, AfterViewInit {

  list: ArticleDto[];

  constructor(private router: Router, private api: ApiService) { }

  ngOnInit() {
    this.api.get(`/public-articles`).subscribe((articles: ArticleDto[]) => {
      this.list = articles;
    }, e => alert("Сталася помилка під час завантаження: " + JSON.stringify(e)))
  }

  ngAfterViewInit(): void {
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView("/articles", "Статті")
    });
  }

  onArticleSelected(article: ArticleDto) {
    this.router.navigate([`articles/${article.id}`]);
  }

}
