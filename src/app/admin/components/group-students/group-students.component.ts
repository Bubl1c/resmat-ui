import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { UserData } from "../../../user/user.models";

@Component({
  selector: 'group-students',
  templateUrl: './group-students.component.html',
  styleUrls: ['./group-students.component.css']
})
export class GroupStudentsComponent implements OnInit {

  @Input() students: UserData[] = [];
  @Input() deletable: boolean = true;

  @Output() onResultsRequested = new EventEmitter<UserData>();
  @Output() onEditRequested = new EventEmitter<UserData>();
  @Output() onDeleteRequested = new EventEmitter<UserData>();

  constructor() { }

  ngOnInit() {
  }

  edit(student: UserData) {
    this.onEditRequested.emit(student);
  }

  results(student: UserData) {
    this.onResultsRequested.emit(student);
  }

  delete(student: UserData) {
    this.onDeleteRequested.emit(student);
  }

}
