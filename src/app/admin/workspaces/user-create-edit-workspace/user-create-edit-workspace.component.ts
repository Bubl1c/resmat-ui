import { Component, Input, OnInit } from '@angular/core';
import { UserWorkspaceData } from "./user-workspace-data";

@Component({
  selector: 'user-create-edit-workspace',
  templateUrl: './user-create-edit-workspace.component.html',
  styleUrls: ['./user-create-edit-workspace.component.css']
})
export class UserCreateEditWorkspaceComponent implements OnInit {

  @Input() workspaceData: UserWorkspaceData;

  tabs = {
    userData: "userData",
    access: "access"
  };
  activeTab: string = this.tabs.userData;

  constructor() { }

  ngOnInit() {
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

}
