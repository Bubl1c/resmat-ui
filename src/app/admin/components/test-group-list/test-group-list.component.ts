import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface ITestGroupConf {
  id: number
  name: string
  parentGroupId?: number
}

export interface ITestGroupConfWithChildren extends ITestGroupConf {
  childGroups: ITestGroupConfWithChildren[]
}

@Component({
  selector: 'test-group-list',
  templateUrl: './test-group-list.component.html',
  styleUrls: ['./test-group-list.component.css']
})
export class TestGroupListComponent implements OnInit {

  @Input() groups: ITestGroupConfWithChildren[];
  @Output() onGroupClicked = new EventEmitter<ITestGroupConfWithChildren>();

  constructor() {
  }

  ngOnInit() {
  }

  groupClicked(clickedGroup: ITestGroupConfWithChildren) {
    this.onGroupClicked.emit(clickedGroup)
  }

}
