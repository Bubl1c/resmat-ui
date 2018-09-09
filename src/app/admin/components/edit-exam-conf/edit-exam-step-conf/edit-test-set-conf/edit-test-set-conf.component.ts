import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DropdownOption } from "../../../../../components/dropdown/dropdown.component";
import { ITestSetConfDto, ITestSetConfTestGroup } from "../../../../../exam/data/test-set.api-protocol";
import { TestSetConfStepWorkspace } from "../../edit-exam-conf.component";
import { ExamStepDataConfTestSetConfDto } from "../../../../../exam/data/exam.api-protocol";

@Component({
  selector: 'edit-test-set-conf',
  templateUrl: './edit-test-set-conf.component.html',
  styleUrls: ['./edit-test-set-conf.component.css']
})
export class EditTestSetConfComponent implements OnInit, OnChanges {

  @Input() workspace: TestSetConfStepWorkspace;
  @Input() isSaving: Boolean = false;

  filteredTestGroupConfDrowpdownOptions: DropdownOption[];
  newTestGroup: ITestSetConfTestGroup;

  constructor() {
  }

  ngOnInit() {
    this.resetNewTestGroup();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workspace']) {
      this.ngOnInit()
    }
  }

  groupSelected(opt: DropdownOption, group: ITestSetConfTestGroup) {
    group.testGroupConfId = opt.id
  }

  addTestGroup() {
    this.workspace.stepData.TestSetConfDto.testGroups.push(this.newTestGroup);
    this.resetNewTestGroup();
  }

  deleteTestGroup(group: ITestSetConfTestGroup) {
    let data = this.workspace.stepData.TestSetConfDto;
    if (window.confirm(`Ви дійсно хочете видалити групу "${this.getTestGroupNameById(group.testGroupConfId)}" з набору тестів?`)) {
      let index = data.testGroups.findIndex(tg => tg.testGroupConfId === group.testGroupConfId);
      if (index >= 0) {
        data.testGroups.splice(index, 1)
      }
      this.resetNewTestGroup();
    }
  }

  getTestGroupNameById(testGroupConfId: number): string {
    return this.workspace.testGroupConfDropdownOptions.find(opt => opt.id === testGroupConfId).text
  }

  private resetNewTestGroup() {
    let data = this.workspace.stepData.TestSetConfDto;
    if (this.workspace.testGroupConfDropdownOptions.length > 0) {
      //filter out already added groups
      this.filteredTestGroupConfDrowpdownOptions = this.workspace.testGroupConfDropdownOptions.filter(
        opt => !data.testGroups.find(tg => tg.testGroupConfId === opt.id)
      );

      if (this.filteredTestGroupConfDrowpdownOptions.length > 0) {
        this.newTestGroup = {
          id: -1,
          testSetConfId: data.testSetConf.id,
          testGroupConfId: this.filteredTestGroupConfDrowpdownOptions[0].id,
          proportionPercents: 5
        }
      } else {
        this.newTestGroup = undefined
      }
    }
  }

}
