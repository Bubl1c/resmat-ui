import { AfterViewInit, Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ApiService} from "../../api.service";
import {ArticleDto} from "../../admin/components/article-editor/article-editor.component";
import { GoogleAnalyticsUtils } from "../../utils/GoogleAnalyticsUtils";
import { RMU } from "../../utils/utils";

@Component({
  selector: 'app-article-wrapper',
  templateUrl: './article-wrapper.component.html',
  styleUrls: ['./article-wrapper.component.css']
})
export class ArticleWrapperComponent implements OnInit, AfterViewInit {

  article: ArticleDto;

  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router) { }

  ngOnInit() {
    let articleId: number = this.route.snapshot.params['articleId'];
    this.api.get(`/public-articles/${articleId}`).subscribe((article: ArticleDto) => {
      this.article = article;
    }, e => alert("Сталася помилка під час завантаження: " + JSON.stringify(e)))
  }

  ngAfterViewInit(): void {
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`/articles/${this.article.id}`, `Стаття "${this.article.header}"`)
    });
  }

  backToList() {
    this.router.navigate([`articles`]);
  }

}
