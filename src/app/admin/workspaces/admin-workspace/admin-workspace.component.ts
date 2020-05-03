import { Component, Input, OnInit } from '@angular/core';
import { AdminWorkspaceData } from "./admin-workspace-data";
import { UserData } from "../../../user/user.models";
import { ProblemConf } from "../../../steps/exam.task-flow-step";
import { UserDefaults } from "../../userDefaults";

@Component({
  selector: 'admin-workspace',
  templateUrl: './admin-workspace.component.html',
  styleUrls: ['./admin-workspace.component.css']
})
export class AdminWorkspaceComponent implements OnInit {

  @Input() workspaceData: AdminWorkspaceData;

  tabs = {
    users: "users",
    problemConfs: "problemConfs"
  };
  activeTab: string;

  constructor() {
    const savedActiveTab = UserDefaults.AdminAdminWorkspace.getActiveTab();
    this.activeTab = savedActiveTab || this.tabs.users
  }

  ngOnInit() {
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    UserDefaults.AdminAdminWorkspace.setActiveTab(tab);
  }

}
