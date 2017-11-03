import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { UserData, UserType } from "../../../user/user.models";
import { DropdownOption } from "../../../components/dropdown/dropdown.component";
import { NgForm } from "@angular/forms";

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

  @Output() onSaved = new EventEmitter<UserData>();

  @Input() config: UserComponentConfig;

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
