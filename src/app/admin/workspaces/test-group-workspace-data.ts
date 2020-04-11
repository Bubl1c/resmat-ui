import { DropdownOption } from "../../components/dropdown/dropdown.component";
import { ITestGroupConf, ITestGroupConfWithChildren } from "../components/test-group-list/test-group-list.component";
import { TestConfService } from "../data/test-conf.service";
import { RMU } from "../../utils/utils";
import { GoogleAnalyticsUtils } from "../../utils/GoogleAnalyticsUtils";
import { ITestEditDto } from "../../exam/data/test-set.api-protocol";
import { AdminComponent } from "../admin.component";
import { WorkspaceData, WorkspaceDataTypes } from "./workspace-data";

export interface ITestGroupConfWithTestConfs extends ITestGroupConfWithChildren {
  testConfs: ITestEditDto[]
}

export abstract class TestGroupWorkspaceData extends WorkspaceData {
  selectedParentGroupId: number;
  parentGroupOptions: DropdownOption[];
  notSelectedParentGroupOption = new DropdownOption(-1, "Не вибрано");

  constructor(public data: ITestGroupConfWithChildren, protected tcService: TestConfService, protected adminComponent: AdminComponent) {
    super();
    this.initialiseParentGroupOptions();
  }

  protected initialiseParentGroupOptions() {
    this.selectedParentGroupId = this.data.parentGroupId || this.notSelectedParentGroupOption.id;
    const forbiddenIds = this.getGroupAndChildrenIdsRecursively(this.data);
    this.parentGroupOptions = this.adminComponent
      .testsGroupConfsFlat
      .filter(g => !forbiddenIds.find(id => id === g.id))
      .map(g => new DropdownOption(g.id, g.name))
      .concat([this.notSelectedParentGroupOption])
  }

  protected getGroupAndChildrenIdsRecursively(group: ITestGroupConfWithChildren, initialValue: number[] = []): number[] {
    return group.childGroups.reduce((ids, g) => {
      return ids.concat(this.getGroupAndChildrenIdsRecursively(g, ids))
    }, initialValue.concat(group.id))
  }
}

export class EditTestGroupWorkspaceData extends TestGroupWorkspaceData {
  type = WorkspaceDataTypes.testGroup;

  constructor(public data: ITestGroupConfWithTestConfs, tcService: TestConfService, adminComponent: AdminComponent) {
    super(data, tcService, adminComponent);
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`/admin/test-groups/${this.data.id}/edit`, `Адмінка :: Редагування групи тестів "${this.data.name}"`)
    });
  }

  save(name: string, parentGroupId: number = this.selectedParentGroupId) {
    let requestBody: ITestGroupConf = {
      id: this.data.id,
      name: name,
      parentGroupId: parentGroupId === this.notSelectedParentGroupOption.id ? undefined : parentGroupId
    };
    this.tcService.updateTestGroupConf(this.data.id, requestBody).subscribe({
      next: (updated: ITestGroupConf) => {
        this.adminComponent.loadTestGroupConfs();
        RMU.safe(() => {
          GoogleAnalyticsUtils.event("Admin", `Edited test group ${this.data.id}`, "EditTestGroup", this.data.id);
        });
        alert("Успішно збережено");
      },
      error: err => {
        this.errorMessage = err.toString();
        alert("Помилка під час збереження: " + JSON.stringify(err))
      }
    })
  }

  deleteTestConf(testConf: ITestEditDto) {
    if(window.confirm("Ви дійсно хочете видалити тест '" + testConf.question + "' ? " +
      "Це призведе до видалення тесту з усіх робіт де він використовувався.")) {
      this.tcService.deleteTestConf(this.data.id, testConf.id).subscribe({
        next: () => {
          const idx = this.data.testConfs.indexOf(testConf);
          this.data.testConfs.splice(idx, 1);
          alert("Успішно видалено");
        },
        error: err => {
          this.errorMessage = err.toString();
          alert("Помилка під час збереження: " + JSON.stringify(err))
        }
      })
    }
  }

  parentGroupChanged(option: DropdownOption) {
    if (option.id !== this.data.id) {
      let question = ""
      if (option.id === this.notSelectedParentGroupOption.id) {
        question = `Ви дійсно хочете зробити групу '${this.data.name}' незалежною групою вернього рівня?`
      } else {
        question = `Ви дійсно хочете перемістити групу '${this.data.name}' в групу '${option.text}' ? `
      }
      if(window.confirm(question)) {
        this.save(this.data.name, option.id);
      }
    }
  }

}

export class AddTestGroupWorkspaceData extends TestGroupWorkspaceData {
  type = WorkspaceDataTypes.addTestGroup;

  constructor(public data: ITestGroupConfWithChildren, tcService: TestConfService, adminComponent: AdminComponent) {
    super(data, tcService, adminComponent);
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`/admin/test-groups/create-new`, `Адмінка :: Створення групи тестів`)
    });
  }

  save() {
    if(!this.data.name) {
      alert("Введіть ім'я групи");
      return;
    }
    let requestBody: ITestGroupConf = {
      id: -1,
      name: this.data.name,
      parentGroupId: this.selectedParentGroupId === this.notSelectedParentGroupOption.id
        ? undefined
        : this.selectedParentGroupId
    };
    this.tcService.createTestGroupConf(requestBody).subscribe({
      next: (result: ITestGroupConf) => {
        this.adminComponent.loadTestGroupConfs(() => {
          this.adminComponent.loadTestGroupConfById(result.id)
        });
        RMU.safe(() => {
          GoogleAnalyticsUtils.event("Admin", `Created test group ${result.id} ${result.name}`, "CreateTestGroup", result.id);
        });
        alert("Успішно збережено");
      },
      error: err => {
        this.errorMessage = err.toString();
        alert(err)
      }
    })
  }

  parentGroupChanged(option: DropdownOption) {
    this.selectedParentGroupId = option.id
  }
}
