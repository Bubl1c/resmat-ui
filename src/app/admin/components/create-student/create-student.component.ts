import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { UserData, StudentGroup, UserType } from "../../../user/user.models";
import { StringUtils } from "../../../utils/StringUtils";

@Component({
  selector: 'create-student',
  templateUrl: './create-student.component.html',
  styleUrls: ['./create-student.component.css']
})
export class CreateStudentComponent implements OnInit {

  @Input() group: StudentGroup;
  @Input() isSaving: boolean;

  @Output() onSaved = new EventEmitter<UserData>();

  user: UserData;

  constructor() { }

  ngOnInit() {
    this.user = UserData.empty();
    this.user.studentGroupId = this.group.id;
    this.user.userType = UserType.student;
  }

  save() {
    this.preProcess();
    this.onSaved.emit(this.user)
  }

  private preProcess() {
    if (!this.user.lastName) {
      this.user.lastName = ""
    }
    this.user.lastName = this.user.lastName.trim();
    this.user.firstName = this.user.firstName.trim();
    this.user.accessKey = this.user.accessKey.trim();
    this.user.username = UserData.generateUsername(this.user.firstName, this.user.lastName);
    this.user.password = StringUtils.random(5);
  }

}
