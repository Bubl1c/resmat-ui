import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ITestDto } from "../../../exam/data/test-set.api-protocol";

@Component({
  selector: 'edit-test-conf',
  templateUrl: './edit-test-conf.component.html',
  styleUrls: ['./edit-test-conf.component.css']
})
export class EditTestConfComponent implements OnInit {

  @Input() test: ITestDto;
  @Output() onSave = new EventEmitter<ITestDto>();

  updated: ITestDto;
  isSaving = false;

  constructor() { }

  ngOnInit() {
    this.updated = Object.assign({}, this.test) as ITestDto;
  }

  save() {
    this.onSave.emit(this.updated)
  }

}
