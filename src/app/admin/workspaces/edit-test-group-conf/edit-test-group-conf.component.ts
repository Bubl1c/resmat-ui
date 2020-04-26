import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EditTestGroupWorkspaceData } from "../test-group-workspace-data";
import { ITestDto, ITestEditDto, TestOptionValueType, TestType } from "../../../exam/data/test-set.api-protocol";
import { ITestGroupConfWithChildren } from "../../components/test-group-list/test-group-list.component";
import { DocxParser } from "../../../utils/docx-parser";
import { TestEdit } from "../../components/edit-test-conf/edit-test-conf.component";
import { NumberUtils } from "../../../utils/NumberUtils";
import { DropdownOption } from "../../../components/dropdown/dropdown.component";
import { UserDefaults } from "../../userDefaults";

export type TestGroupEditingModeType = "detailed" | "lightweight"

export interface TestGroupEditingMode {
  id: TestGroupEditingModeType
  text: string
}

class TestGroupEditingModes {
  static Detailed: TestGroupEditingMode = { id: "detailed", text: "Стандартний" };
  static Lightweight: TestGroupEditingMode = { id: "lightweight", text: "Спрощений" };

  static all = [TestGroupEditingModes.Detailed, TestGroupEditingModes.Lightweight]
}

@Component({
  selector: 'edit-test-group-conf',
  templateUrl: './edit-test-group-conf.component.html',
  styleUrls: ['./edit-test-group-conf.component.css']
})
export class EditTestGroupConfComponent implements OnInit {

  _workspaceData: EditTestGroupWorkspaceData;

  @Input() set workspaceData(value: EditTestGroupWorkspaceData) {
    this._workspaceData = value;
    this.initialiseEditingMode();
    this.initialiseActiveTab();
  };

  get workspaceData(): EditTestGroupWorkspaceData {
    return this._workspaceData;
  };

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
  activeTab: string;

  selectedEditingMode: DropdownOption;
  editingModes: DropdownOption[];

  constructor() { }

  ngOnInit() {
    this.initialiseEditingMode()
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    UserDefaults.EditTestGroupConf.setSelectedTab(this.workspaceData.data.id, this.activeTab);
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

  private initialiseActiveTab() {
    this.switchTab(UserDefaults.EditTestGroupConf.getSelectedTab(this.workspaceData.data.id) || this.tabs.tests);
  }

  private initialiseEditingMode() {
    const lightweightEditingDO = new DropdownOption(TestGroupEditingModes.Lightweight.id, TestGroupEditingModes.Lightweight.text);
    const detailedEditingDO = new DropdownOption(TestGroupEditingModes.Detailed.id, TestGroupEditingModes.Detailed.text);
    this.editingModes = [detailedEditingDO, lightweightEditingDO];
    const isLightweightEditingPossible = this.isLightweightEditingModePossible();
    const userPreferredEMId = UserDefaults.EditTestGroupConf.getEditingMode(this.workspaceData.data.id);
    if (userPreferredEMId) {
      this.changeEditingMode(userPreferredEMId === "lightweight" && isLightweightEditingPossible ? lightweightEditingDO : detailedEditingDO)
    } else {
      this.changeEditingMode(isLightweightEditingPossible ? lightweightEditingDO : detailedEditingDO);
    }
  }

  changeEditingMode(em: DropdownOption) {
    if (this.selectedEditingMode && em.id === this.selectedEditingMode.id) {
      return;
    }
    if (em.id === TestGroupEditingModes.Lightweight.id) {
      const isPossible = this.isLightweightEditingModePossible();
      if (!isPossible) {
        alert("Спрощений режим редагування доступний лише для тестів з 1 варіантом відповіді. Зображення не підтримуються.")
        return;
      }
    } else if(em.id === TestGroupEditingModes.Detailed.id && this.activeTab === this.tabs.upload) {
      this.switchTab(this.tabs.tests);
    }
    this.selectedEditingMode = em;
    UserDefaults.EditTestGroupConf.setEditingMode(this.workspaceData.data.id, em.id);
  }

  private isLightweightEditingModePossible() {
    let isLightweightEditingModePossible = true;
    for(let i = 0; i < this.workspaceData.data.testConfs.length; i++) {
      const tc = this.workspaceData.data.testConfs[i];
      if ([TestType.Checkbox, TestType.SingleInput].indexOf(tc.testType) > -1) {
        isLightweightEditingModePossible = false;
        break;
      }
      const optSupport = tc.options.map(o => {
        if ([TestOptionValueType.Img, TestOptionValueType.Number].indexOf(o.valueType) > -1) {
          return false
        }
        return true;
      });
      if (optSupport.indexOf(false) > -1) {
        isLightweightEditingModePossible = false;
        break;
      }
    }
    return isLightweightEditingModePossible;
  }

  private findTest(id: number): ITestEditDto {
    return this.workspaceData.data.testConfs.find(tc => tc.id === id)
  }
}
