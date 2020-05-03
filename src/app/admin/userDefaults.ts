import { TestOptionValueType, TestType } from "../exam/data/test-set.api-protocol";
import { TestGroupEditingModeType } from "./workspaces/edit-test-group-conf/edit-test-group-conf.component";

export namespace UserDefaults {

  export namespace Login {
    const activeViewKey = `Login_activeView`;

    export type LoginActiveView = 'student' | 'user'

    export function getActiveView(): LoginActiveView | undefined {
      return localStorage.getItem(activeViewKey) as LoginActiveView
    }
    export function setActiveView(view: LoginActiveView): void {
      return localStorage.setItem(activeViewKey, view);
    }
  }

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

  export namespace AdminAdminWorkspace {
    const activeTabKey = `AdminWorkspace_activeTab`;
    export function getActiveTab(): string | undefined {
      return localStorage.getItem(activeTabKey)
    }
    export function setActiveTab(tabId: string): void {
      return localStorage.setItem(activeTabKey, tabId);
    }
  }

  export namespace Admin {
    const lastActiveViewKey = `Admin_lastActiveView`;

    type ActiveViewId = 'admin' | 'studentGroup' | 'testGroup' | 'examConf'

    export class AdminActiveView {
      constructor(public viewId: ActiveViewId, public itemId?: number) {
      }
    }

    export function getLastActiveView(): AdminActiveView | undefined {
      const view = localStorage.getItem(lastActiveViewKey);
      return view && JSON.parse(view)
    }
    export function setLastActiveView(viewId: ActiveViewId, itemId?: number): void {
      return localStorage.setItem(lastActiveViewKey, JSON.stringify(new AdminActiveView(viewId, itemId)));
    }
  }

}
