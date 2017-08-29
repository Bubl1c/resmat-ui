export class TestTypes {
  static Checkbox = 'checkbox';
  static Radio = 'radio';
  static all = [TestTypes.Checkbox, TestTypes.Radio]
}

export type TestOptionValueType = "words" | "img"

export interface ITestOptionDto {
  id: number;
  value: string;
  valueType: TestOptionValueType;
}

export interface ITestDto {
  id: number;
  groupId: number;
  question: string;
  imageUrl: string;
  options: ITestOptionDto[];
  help: string;
  testType: string;
}

export interface ITestWithCorrectDto extends ITestDto {
  correctOptionId: number
}

export interface ITestSetConf {
  id: number;
  name: string;
  maxTestsAmount: number;
}

export interface ITestSetDto {
  conf: ITestSetConf;
  tests: ITestDto[];
}
