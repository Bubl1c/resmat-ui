import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { UserData } from "../../../user/user.models";

export class UserComponentConfig {
  constructor(public disabled: boolean = false) {}
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

  constructor() {}

  ngOnInit() {
  }

  save() {
    this.config.disabled = true;
    this.onSaved.emit(this.user);
  }

}
