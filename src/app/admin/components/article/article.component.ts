import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit {

  @Input() header: string;
  @Input() bodyText: string;

  constructor() { }

  ngOnInit() {
  }

}
