import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { StudentGroup, UserData, UserType } from "../../../user/user.models";
import { DropdownOption } from "../../../components/dropdown/dropdown.component";

export class UserComponentConfig {
  constructor(public isSaving: boolean = false) {}
}

@Component({
  selector: 'user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  @Input() user: UserData;
  @Input() config: UserComponentConfig;

  @Output() onSaved = new EventEmitter<UserData>();
  @Output() onCancel = new EventEmitter<void>();

  userTypes = UserType.all.map(ut => new DropdownOption(ut.id, ut.name));

  constructor() {}

  ngOnInit() {
  }

  userTypeChanged(option: DropdownOption) {
    this.user.userType = UserType.withId(option.id)
  }

  save() {
    this.config.isSaving = true;
    this.onSaved.emit(this.user);
  }

}
