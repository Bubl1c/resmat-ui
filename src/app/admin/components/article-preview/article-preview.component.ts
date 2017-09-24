import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'article-preview',
  templateUrl: './article-preview.component.html',
  styleUrls: ['./article-preview.component.css']
})
export class ArticlePreviewComponent implements OnInit {

  @Input() header: string;
  @Input() previewText: string;
  @Input() editable: boolean = false;
  @Input() invisible: boolean = false;
  @Output() onDetailsClicked = new EventEmitter<void>();
  @Output() onEditClicked = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
  }

  detailsClicked() {
    this.onDetailsClicked.emit();
  }

  editClicked() {
    this.onEditClicked.emit();
  }

}
