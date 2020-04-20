import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EditTestGroupWorkspaceData } from "../test-group-workspace-data";
import { ITestDto, ITestEditDto } from "../../../exam/data/test-set.api-protocol";
import { ITestGroupConfWithChildren } from "../../components/test-group-list/test-group-list.component";
import { DocxParser } from "../../../utils/docx-parser";
import { TestEdit } from "../../components/edit-test-conf/edit-test-conf.component";
import { NumberUtils } from "../../../utils/NumberUtils";

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

  tabs = {
    tests: "tests",
    upload: "upload",
    hierarchy: "hierarchy",
    operations: "operations"
  };
  activeTab: string = this.tabs.tests;

  constructor() { }

  ngOnInit() {
  }

  switchTab(tab: string) {
    this.activeTab = tab;
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

  fileAdded(file: File) {
    const groupId = this.workspaceData.data.id;
    this.workspaceData.isBulkSaving = true;
    DocxParser.loadFileAndParseOutTests(file).then(tests => {
      if (tests.length < 1) {
        alert("В вибраному файлі не знайдено жодного тесту");
        return;
      }
      const tes = tests.map((t, i) => {
        return TestEdit.fromSimple(groupId, NumberUtils.getRandomInt(-9900000, -100), -1, t)
      });
      this.workspaceData.data.testConfs.unshift(...tes);
      this.switchTab(this.tabs.tests);
      alert(`Завантажені тести успішно додані під номерами 1 - ${tes.length}. Але НЕ ЗБЕРЕЖЕНІ, натисніть ЗБЕРЕГТИ щоб підтвердити додані тести.`);
    }, error => {
      alert("Не вдалося завантажити тести з файлу. Причина: " + JSON.stringify(error))
    }).then(() => {
      this.workspaceData.isBulkSaving = false;
    })
  };

  private findTest(id: number): ITestEditDto {
    return this.workspaceData.data.testConfs.find(tc => tc.id === id)
  }
}
