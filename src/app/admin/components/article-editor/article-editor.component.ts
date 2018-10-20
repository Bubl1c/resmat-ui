import {
  AfterViewInit,
  Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { GoogleAnalyticsUtils } from "../../../utils/GoogleAnalyticsUtils";
import { RMU } from "../../../utils/utils";

export interface ArticleDto {
  id: number
  header: string
  preview: string
  body: string
  visible: boolean
  meta: {
    uploadedFileUrls: string[]
  }
}

@Component({
  selector: 'article-editor',
  templateUrl: './article-editor.component.html',
  styleUrls: ['./article-editor.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ArticleEditorComponent implements OnInit, AfterViewInit {

  @Input() data: ArticleDto;
  @Output() onSave = new EventEmitter<ArticleDto>();

  updatedData: ArticleDto;

  uploadPath: string = "/upload-temp-file";

  showPreview: boolean = false;
  showPreviewDetails: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
    if (this.data) {
      this.updatedData = JSON.parse(JSON.stringify(this.data));
      this.uploadPath = `/articles/${this.updatedData.id}/upload-file`;
    } else {
      throw new Error("article data must be defined");
    }
  }

  ngAfterViewInit(): void {
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView("/blog", "Блог")
    });
  }

  onPreviewChanged(newValue: string) {
    this.updatedData.preview = newValue;
  }

  onBodyChanged(newValue: string) {
    this.updatedData.body = newValue;
  }

  save() {
    this.onSave.emit(this.updatedData)
  }

  addUploadedFileUrl(url) {
    console.log(this.updatedData.meta);
    const urls = this.updatedData.meta.uploadedFileUrls || [];
    const alreadyExistsIndex = urls.indexOf(url);
    if(alreadyExistsIndex > -1) {
      urls.splice(alreadyExistsIndex, 1)
    }
    this.updatedData.meta.uploadedFileUrls.unshift(url);
  }

  onUploadFailed(err) {
    alert("uploading failed: " + JSON.stringify(err))
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
