export interface ITestCorrectOption {
  id: number;
  correct: number;
}

export interface ITest {
  id: number;
  question: string;
  options: ITestOption[];
  helpImg: string;
}

export interface ITestOption {
  id: number;
  value: string;
  type: string;
  checked: boolean;
}

export interface ISchemaVar {
  name: string;
  value: string;
  units: string;
}

export interface IExam {
  id: string;
  name: string;
  schemaUrl: string;
  schemaVars: ISchemaVar[];
  description: string;
}
