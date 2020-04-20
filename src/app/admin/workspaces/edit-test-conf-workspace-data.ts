import { WorkspaceData, WorkspaceDataTypes } from "./workspace-data";
import { ITestEditDto } from "../../exam/data/test-set.api-protocol";
import { TestConfService } from "../data/test-conf.service";
import { RMU } from "../../utils/utils";
import { GoogleAnalyticsUtils } from "../../utils/GoogleAnalyticsUtils";
import { UserDefaults } from "../userDefaults";
import { AdminComponent } from "../admin.component";

export class EditTestConfWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.editTestConf;
  isSaving = false;

  constructor(public data: ITestEditDto, private tcService: TestConfService, private adminComponent: AdminComponent) {
    super();
    RMU.safe(() => {
      if (this.data.id > 0) {
        GoogleAnalyticsUtils.pageView(`/admin/test-confs/${this.data.id}/edit`, `Адмінка :: Редагування тесту "${this.data.id}"`)
      } else {
        GoogleAnalyticsUtils.pageView(`/admin/test-confs/${this.data.id}/create`, `Адмінка :: Створення тесту`)
      }
    });
  }

  save(updatedOrCreatedTest: ITestEditDto) {
    this.isSaving = true;
    const subscribeCallback = {
      next: (result: ITestEditDto) => {
        this.isSaving = false;
        updatedOrCreatedTest.id = result.id;
        updatedOrCreatedTest.imageUrl = result.imageUrl;
        updatedOrCreatedTest.help = result.help;
        updatedOrCreatedTest.options = result.options;
        RMU.safe(() => {
          if (updatedOrCreatedTest.id > 0) {
            GoogleAnalyticsUtils.event("Admin", `Edited test ${result.id}`, "EditTestConf", result.id);
          } else {
            GoogleAnalyticsUtils.event("Admin", `Created test ${result.id}`, "CreateTestConf", result.id);
          }
        });
        alert("Успішно збережено");
        this.adminComponent.loadTestGroupConfById(result.groupId)
      },
      error: err => {
        this.isSaving = false;
        this.errorMessage = err.toString();
        alert(err)
      }
    };
    if(updatedOrCreatedTest.id > 0) {
      this.tcService.updateTestConf(
        updatedOrCreatedTest.groupId,
        updatedOrCreatedTest.id,
        updatedOrCreatedTest
      ).subscribe(subscribeCallback)
    } else {
      UserDefaults.EditTestConf.precision = updatedOrCreatedTest.precision;
      this.tcService.createTestConf(
        updatedOrCreatedTest.groupId,
        updatedOrCreatedTest
      ).subscribe(subscribeCallback)
    }
  }
}
