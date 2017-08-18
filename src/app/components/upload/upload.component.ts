import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FileUploader } from "ng2-file-upload";
import { HttpUtils } from "../../utils/HttpUtils";

@Component({
  selector: 'upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

  @Input() path: string;

  @Output() onUploaded = new EventEmitter<string>();
  @Output() onUploadFailed = new EventEmitter<string>();

  //todo: make sure user cannot add more than 1 file
  public uploader:FileUploader;
  public hasDropZoneOver:boolean = false;

  constructor() { }

  ngOnInit() {
    this.uploader = new FileUploader({url: HttpUtils.baseUrl + this.path});
    this.uploader.onAfterAddingFile = (file: any) => {
      if(this.uploader.queue.length > 1) {
        this.uploader.removeFromQueue(this.uploader.queue[0])
      }
    }
  }

  public fileOver(e:any):void {
    this.hasDropZoneOver = e;
  }

  public uploadFile(item: any): void {
    if(!item || !item.file) {
      alert('No file to upload: ' + JSON.stringify(item));
    }
    this.addFileSizeHeader(item);
    this.uploader.uploadItem(item);
    item.onComplete = (response: string, status: number, headers: any) => {
      if(status === 200) {
        this.onUploaded && this.onUploaded.emit(response);
        this.uploader.clearQueue();
      } else {
        this.onUploadFailed && this.onUploadFailed.emit(status + ": " + response);
      }
    };
  }

  private addFileSizeHeader(item: any): void {
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
