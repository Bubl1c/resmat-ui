import { DropdownOption } from "../../components/dropdown/dropdown.component";
import { IExamConfDto } from "../../exam/data/exam.api-protocol";
import { ITestGroupConf } from "../components/test-group-list/test-group-list.component";
import { RMU } from "../../utils/utils";
import { GoogleAnalyticsUtils } from "../../utils/GoogleAnalyticsUtils";
import { AdminComponent } from "../admin.component";
import { WorkspaceData, WorkspaceDataTypes } from "./workspace-data";

export class ExamWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.editExam;
  isSaving = false;

  testGroupConfsDropdownOptions: DropdownOption[];

  constructor(public data: IExamConfDto, testGroupConfsFlat: ITestGroupConf[], protected adminComponent: AdminComponent) {
    super();
    this.testGroupConfsDropdownOptions = testGroupConfsFlat.map(tgc => new DropdownOption(tgc.id, tgc.name));
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`/admin/exams`, `Адмінка :: Іспити`)
    });
  }

  onSaved(saved: IExamConfDto) {
    this.adminComponent.loadExamConfs();
    this.data = saved;
    RMU.safe(() => {
      if (this.data.examConf.id > 0) {
        GoogleAnalyticsUtils.event("Admin", `Edited exam ${this.data.examConf.id}`, "EditExam", this.data.examConf.id);
      } else {
        GoogleAnalyticsUtils.event("Admin", `Created exam ${this.data.examConf.id} "${this.data.examConf.name}"`, "CreateExam", saved.examConf.id);
      }
    });
  }
}
