import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ITestDto } from "../../../exam/data/test-set.api-protocol";

@Component({
  selector: 'test-conf-preview',
  templateUrl: './test-conf-preview.component.html',
  styleUrls: ['./test-conf-preview.component.css']
})
export class TestConfPreviewComponent implements OnInit {

  @Input() test: ITestDto;
  @Output() onEdit = new EventEmitter<ITestDto>();
  @Output() onDelete = new EventEmitter<ITestDto>();

  constructor() { }

  ngOnInit() {
  }

  edit() {
    this.onEdit.emit(this.test);
  }

  delete() {
    this.onDelete.emit(this.test);
  }

}
