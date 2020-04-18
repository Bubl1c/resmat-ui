export type TestType = 'checkbox' | 'radio' | "single-input"
export namespace TestType {
  export const Checkbox: TestType = 'checkbox';
  export const Radio: TestType = 'radio';
  export const SingleInput: TestType = "single-input";

  export const all: TestType[] = [Checkbox, Radio, SingleInput]
}

export type TestOptionValueType = "words" | "img" | "number"
export namespace TestOptionValueType {
  export const Words: TestOptionValueType = "words";
  export const Img: TestOptionValueType = "img";
  export const Number: TestOptionValueType = "number";
  export const all: TestOptionValueType[] = [Words, Img, Number]
}

export interface ITestOptionDto {
  id: number;
  value: string;
  valueType: TestOptionValueType;
}

export interface ITestOptionWithCorrectDto {
  id: number;
  value: string;
  correct: boolean;
  valueType: TestOptionValueType;
}

interface ITestWithoutOptions {
  id: number;
  groupId: number;
  question: string;
  imageUrl: string;
  help: string;
  testType: TestType;
  precision?: number;
  sequence: number;
}

export interface ITestDto extends ITestWithoutOptions {
  options: ITestOptionDto[];
}

export interface ITestEditDto extends ITestWithoutOptions {
  options: ITestOptionWithCorrectDto[];
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

export interface ITestSetConfTestGroup {
  id: number
  testSetConfId: number
  testGroupConfId: number
  proportionPercents: number
  mistakeValue?: number
}

export interface ITestSetConfDto {
  testSetConf: ITestSetConf
  testGroups: ITestSetConfTestGroup[]
}
