import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ApiService} from "../../api.service";
import {ArticleDto} from "../../admin/components/article-editor/article-editor.component";

@Component({
  selector: 'app-article-wrapper',
  templateUrl: './article-wrapper.component.html',
  styleUrls: ['./article-wrapper.component.css']
})
export class ArticleWrapperComponent implements OnInit {

  article: ArticleDto;

  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router) { }

  ngOnInit() {
    let articleId: number = this.route.snapshot.params['articleId'];
    this.api.get(`/public-articles/${articleId}`).subscribe((article: ArticleDto) => {
      this.article = article;
    }, e => alert("Сталася помилка під час завантаження: " + JSON.stringify(e)))
  }

  backToList() {
    this.router.navigate([`articles`]);
  }

}
