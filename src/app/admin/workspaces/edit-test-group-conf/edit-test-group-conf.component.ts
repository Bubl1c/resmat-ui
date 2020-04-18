import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EditTestGroupWorkspaceData } from "../test-group-workspace-data";
import { ITestDto, ITestEditDto } from "../../../exam/data/test-set.api-protocol";
import { ITestGroupConfWithChildren } from "../../components/test-group-list/test-group-list.component";

@Component({
  selector: 'edit-test-group-conf',
  templateUrl: './edit-test-group-conf.component.html',
  styleUrls: ['./edit-test-group-conf.component.css']
})
export class EditTestGroupConfComponent implements OnInit {

  @Input() workspaceData: EditTestGroupWorkspaceData;

  @Output() onEditTestConf = new EventEmitter<{
    groupId: number,
    testConf: ITestEditDto
  }>();
  @Output() onLoadTestGroupConf = new EventEmitter<ITestGroupConfWithChildren>();

  constructor() { }

  ngOnInit() {
  }

  editTestConf(testId?: number) {
    let t: ITestEditDto;
    if (testId) {
      t = this.findTest(testId);
    }
    this.onEditTestConf.emit({
      groupId: this.workspaceData.data.id,
      testConf: t
    })
  }

  deleteTestConf(testId: number) {
    this.workspaceData.deleteTestConf(this.findTest(testId))
  }

  private findTest(id: number): ITestEditDto {
    return this.workspaceData.data.testConfs.find(tc => tc.id === id)
  }
}
