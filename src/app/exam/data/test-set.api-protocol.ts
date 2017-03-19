export class TestTypes {
  static Checkbox = 'checkbox';
  static Radio = 'radio';
  static all = [TestTypes.Checkbox, TestTypes.Radio]
}

export interface ITestOptionDto {
  id: number;
  value: string;
  valueType: string;
}

export interface ITestDto {
  id: number;
  groupId: number;
  question: string;
  options: ITestOptionDto[];
  help: string;
  testType: string;
}

export interface ITestSetConf {
  id: number;
  examConfId: number;
  examStepConfId: number;
}

export interface ITestSetDto {
  conf: ITestSetConf;
  tests: ITestDto[];
}
