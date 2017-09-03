import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FileUploader, FileItem } from "ng2-file-upload";
import { HttpUtils } from "../../utils/HttpUtils";
import { CurrentSession } from "../../current-session";

@Component({
  selector: 'upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

  @Input() path: string;
  @Input() auto: boolean;

  @Output() onUploaded = new EventEmitter<string>();
  @Output() onUploadFailed = new EventEmitter<string>();

  errorMessage = '';

  public uploader:FileUploader;
  public hasDropZoneOver:boolean = false;

  constructor() { }

  ngOnInit() {
    this.uploader = new FileUploader({url: HttpUtils.baseUrl + this.path, authToken: CurrentSession.token});
    this.uploader.onAfterAddingFile = (file: FileItem) => {
      if(this.auto) {
        this.uploadFile(file)
      }
      this.errorMessage = '';
      if(this.uploader.queue.length > 1) {
        this.uploader.removeFromQueue(this.uploader.queue[0])
      }
    }
  }

  public fileOver(e:any):void {
    this.hasDropZoneOver = e;
  }

  public uploadFile(item: FileItem): void {
    if(!item || !item.file) {
      alert('No file to upload: ' + JSON.stringify(item));
    }
    this.addFileSizeHeader(item);
    this.uploader.uploadItem(item);
    item.onCancel = (response: string, status: number, headers: any) => {
      this.errorMessage = 'Завантаження відмінене' + (response ? ': ' + response : '');
    };
    item.onComplete = (response: string, status: number, headers: any) => {
      if(status === 200) {
        if(this.auto) {
          this.uploader.queue = [];
        }
        this.errorMessage = '';
        this.onUploaded && this.onUploaded.emit(response);
      } else {
        if(!item.isCancel) {
          this.errorMessage = 'Не вдалося завантажити: ' + response;
        }
        this.onUploadFailed && this.onUploadFailed.emit(status + ": " + response);
      }
    };
  }

  private addFileSizeHeader(item: FileItem): void {
    let fileSize = parseInt(item.file.size);
    if(isNaN(fileSize)) {
      alert("Invalid file size: " + item.file.size)
    }
    let headerName = 'File-size';
    let fileSizeHeader = item.headers.find(h => h.name === headerName);
    if(!fileSizeHeader) {
      item.headers.push({ name: headerName, value: fileSize });
    } else {
      fileSizeHeader.value = fileSize
    }
  }

}
