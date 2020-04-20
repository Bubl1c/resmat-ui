import { Component, Input, OnInit } from '@angular/core';
import { ArchiveWorkspaceData } from "./archive-workspace-data";

@Component({
  selector: 'archive-workspace',
  templateUrl: './archive-workspace.component.html',
  styleUrls: ['./archive-workspace.component.css']
})
export class ArchiveWorkspaceComponent implements OnInit {

  @Input() workspaceData: ArchiveWorkspaceData;

  tabs = {
    studentGroups: "studentGroups",
    testGroups: "testGroups"
  };
  activeTab: string = this.tabs.studentGroups;

  constructor() { }

  ngOnInit() {
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

}
