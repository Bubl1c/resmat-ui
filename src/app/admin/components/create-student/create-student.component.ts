import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { UserData, StudentGroup, UserType } from "../../../user/user.models";

@Component({
  selector: 'create-student',
  templateUrl: './create-student.component.html',
  styleUrls: ['./create-student.component.css']
})
export class CreateStudentComponent implements OnInit {

  @Input() group: StudentGroup;

  @Output() onSaved = new EventEmitter<UserData>();

  user: UserData;

  constructor() { }

  ngOnInit() {
    this.user = UserData.empty();
    this.user.studentGroupId = this.group.id;
    this.user.userType = UserType.student;
  }

  save() {
    this.onSaved.emit(this.user)
  }

}
