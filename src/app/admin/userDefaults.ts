import { TestOptionValueType, TestType } from "../exam/data/test-set.api-protocol";
import { TestGroupEditingMode } from "./workspaces/test-group-workspace-data";

export namespace UserDefaults {

  export namespace EditTestConf {

    export let testType: TestType = TestType.Radio;
    export let testOptionType: TestOptionValueType = TestOptionValueType.Words;

    export let precision: number;

  }

  export namespace EditTestGroupConf {
    let savedEditingModes: {[key:number]: TestGroupEditingMode} = {};

    export function getEditingMode(groupId: number): TestGroupEditingMode | undefined {
      return savedEditingModes[groupId]
    }

    export function setEditingMode(groupId: number, em: TestGroupEditingMode): void {
      return savedEditingModes[groupId] = JSON.parse(JSON.stringify(em));
    }
  }

}
