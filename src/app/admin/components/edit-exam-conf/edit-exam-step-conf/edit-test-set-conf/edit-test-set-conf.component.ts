import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DropdownOption } from "../../../../../components/dropdown/dropdown.component";
import { ITestSetConfDto, ITestSetConfTestGroup } from "../../../../../exam/data/test-set.api-protocol";

@Component({
  selector: 'edit-test-set-conf',
  templateUrl: './edit-test-set-conf.component.html',
  styleUrls: ['./edit-test-set-conf.component.css']
})
export class EditTestSetConfComponent implements OnInit {

  @Input() data: ITestSetConfDto;
  @Input() testGroupConfDrowpdownOptions: DropdownOption[];
  @Input() isSaving: Boolean = false;

  @Output() onSave = new EventEmitter<ITestSetConfDto>();

  newTestGroup: ITestSetConfTestGroup;

  constructor() { }

  ngOnInit() {
    this.resetNewTestGroup();
  }

  groupSelected(opt: DropdownOption, group: ITestSetConfTestGroup) {
    group.testGroupConfId = opt.id
  }

  addTestGroup() {
    this.data.testGroups.push(this.newTestGroup);
    this.resetNewTestGroup();
  }

  deleteTestGroup(testGroupConfId: number) {
    let index = this.data.testGroups.findIndex(tg => tg.testGroupConfId === testGroupConfId)
    if (index >= 0) {
      this.data.testGroups.splice(index, 1)
    }
  }

  save() {
    this.onSave.emit(this.data)
  }

  private resetNewTestGroup() {
    if (this.testGroupConfDrowpdownOptions.length > 0) {
      //filter out already added groups
      this.testGroupConfDrowpdownOptions = this.testGroupConfDrowpdownOptions.filter(
        opt => !this.data.testGroups.find(tg => tg.testGroupConfId === opt.id)
      );

      if (this.testGroupConfDrowpdownOptions.length > 0) {
        this.newTestGroup = {
          id: -1,
          testSetConfId: this.data.id,
          testGroupConfId: this.testGroupConfDrowpdownOptions[0].id,
          proportionPercents: 5
        }
      }
    }
  }

}
