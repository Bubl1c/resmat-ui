import { TestOptionValueType, TestType } from "../exam/data/test-set.api-protocol";
import { TestGroupEditingModeType } from "./workspaces/edit-test-group-conf/edit-test-group-conf.component";

export namespace UserDefaults {

  export namespace EditTestConf {

    export let testType: TestType = TestType.Radio;
    export let testOptionType: TestOptionValueType = TestOptionValueType.Words;

    export let precision: number;

  }

  export namespace EditTestGroupConf {
    const editingModeKey = (groupId: number) => `EditTestGroupConf_editingMode_groupId=${groupId}`;
    export function getEditingMode(groupId: number): TestGroupEditingModeType | undefined {
      return localStorage.getItem(editingModeKey(groupId)) as TestGroupEditingModeType
    }
    export function setEditingMode(groupId: number, editingModeId: TestGroupEditingModeType): void {
      return localStorage.setItem(editingModeKey(groupId), editingModeId);
    }

    const selectedTabKey = (groupId: number) => `EditTestGroupConf_selectedTab_groupId=${groupId}`;
    export function getSelectedTab(groupId: number): string | undefined {
      return localStorage.getItem(selectedTabKey(groupId))
    }
    export function setSelectedTab(groupId: number, selectedTab: string): void {
      return localStorage.setItem(selectedTabKey(groupId), selectedTab);
    }
  }

}
