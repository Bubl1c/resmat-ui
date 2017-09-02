export type TestType = 'checkbox' | 'radio'
export namespace TestType {
  export const Checkbox: TestType = 'checkbox';
  export const Radio: TestType = 'radio';
  export const all: TestType[] = [TestType.Checkbox, TestType.Radio]
}

export type TestOptionValueType = "words" | "img"
export namespace TestOptionValueType {
  export const Words: TestOptionValueType = "words";
  export const Img: TestOptionValueType = "img";
  export const all: TestOptionValueType[] = [Words, Img]
}

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
  testType: TestType;
}

export interface ITestWithCorrectDto extends ITestDto {
  correctOptionIds: number[]
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
