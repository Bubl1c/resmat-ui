import { ProblemConfWithVariants } from "../components/problem-conf/problem-conf.component";
import { RMU } from "../../utils/utils";
import { GoogleAnalyticsUtils } from "../../utils/GoogleAnalyticsUtils";
import { WorkspaceData, WorkspaceDataTypes } from "./workspace-data";

export class ProblemWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.problem;
  constructor(public data: ProblemConfWithVariants) {
    super();
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`/admin/problems/${this.data.problemConf.id}`, `Адмінка :: Задача "${this.data.problemConf.name}"`)
    });
  }
}
