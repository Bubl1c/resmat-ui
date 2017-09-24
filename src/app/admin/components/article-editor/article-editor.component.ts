import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';

export interface ArticleDto {
  id: number
  header: string
  preview: string
  body: string
  meta: {
    uploadedFileUrls: string[],
    visible: boolean
  }
}

@Component({
  selector: 'article-editor',
  templateUrl: './article-editor.component.html',
  styleUrls: ['./article-editor.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ArticleEditorComponent implements OnInit {

  @Input() data: ArticleDto;
  @Output() onSave = new EventEmitter<ArticleDto>();

  updatedData: ArticleDto;

  uploadTempPath: string = "/upload-temp-file";

  showPreview: boolean = false;
  showPreviewDetails: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
    if (this.data) {
      this.updatedData = JSON.parse(JSON.stringify(this.data));
    } else {
      this.updatedData = {
        id: -1,
        header: '',
        preview: '',
        body: '',
        meta: {
          visible: false,
          uploadedFileUrls: []
        }
      }
    }
  }

  onPreviewChanged(newValue: string) {
    this.updatedData.preview = newValue;
  }

  onBodyChanged(newValue: string) {
    this.updatedData.body = newValue;
  }

  save() {
    console.log(JSON.stringify(this.updatedData));
    this.onSave.emit(this.updatedData)
  }

  addUploadedFileUrl(url) {
    this.updatedData.meta.uploadedFileUrls.unshift(url)
  }

  startPreview() {
    this.showPreview = true;
  }

  previewDetails() {
    this.showPreviewDetails = true;
  }

  backToEditing() {
    this.showPreview = this.showPreviewDetails = false;
  }

}
