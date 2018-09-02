import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DropdownOption } from "../../../../../components/dropdown/dropdown.component";
import { ITestSetConfDto, ITestSetConfTestGroup } from "../../../../../exam/data/test-set.api-protocol";
import { TestConfService } from "../../../../data/test-conf.service";
import { TestSetConfStepWorkspace } from "../../edit-exam-conf.component";

@Component({
  selector: 'edit-test-set-conf',
  templateUrl: './edit-test-set-conf.component.html',
  styleUrls: ['./edit-test-set-conf.component.css']
})
export class EditTestSetConfComponent implements OnInit {

  @Input() workspace: TestSetConfStepWorkspace;
  @Input() isSaving: Boolean = false;

  data: ITestSetConfDto;

  filteredTestGroupConfDrowpdownOptions: DropdownOption[];
  newTestGroup: ITestSetConfTestGroup;

  constructor() {}

  ngOnInit() {
    this.data = this.workspace.stepData;
    this.resetNewTestGroup();
  }

  groupSelected(opt: DropdownOption, group: ITestSetConfTestGroup) {
    group.testGroupConfId = opt.id
  }

  addTestGroup() {
    this.data.testGroups.push(this.newTestGroup);
    this.resetNewTestGroup();
  }

  deleteTestGroup(group: ITestSetConfTestGroup) {
    if (window.confirm(`Ви дійсно хочете видалити групу "${this.getTestGroupNameById(group.testGroupConfId)}" з набору тестів?`)) {
      let index = this.data.testGroups.findIndex(tg => tg.testGroupConfId === group.testGroupConfId);
      if (index >= 0) {
        this.data.testGroups.splice(index, 1)
      }
      this.resetNewTestGroup();
    }
  }

  getTestGroupNameById(testGroupConfId: number): string {
    return this.workspace.testGroupConfDropdownOptions.find(opt => opt.id === testGroupConfId).text
  }

  private resetNewTestGroup() {
    if (this.workspace.testGroupConfDropdownOptions.length > 0) {
      //filter out already added groups
      this.filteredTestGroupConfDrowpdownOptions = this.workspace.testGroupConfDropdownOptions.filter(
        opt => !this.data.testGroups.find(tg => tg.testGroupConfId === opt.id)
      );

      if (this.filteredTestGroupConfDrowpdownOptions.length > 0) {
        this.newTestGroup = {
          id: -1,
          testSetConfId: this.data.testSetConf.id,
          testGroupConfId: this.filteredTestGroupConfDrowpdownOptions[0].id,
          proportionPercents: 5
        }
      } else {
        this.newTestGroup = undefined
      }
    }
  }

}
