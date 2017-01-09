import { Component, OnInit } from '@angular/core';
import { IChart } from "../exam/components/e-chart/e-chart.component";
import { ResultVariable } from "./x-results/x-results.component";
import { ITest } from "../exam/exam.model";

export interface IAssignments {
  current: string;
  sequence: number;
  test: TestAssignment;
  bc: BoundaryConditionsAssignment;
  xResults: XResultsAssignment;
  chart: ChartAssignment;
  cut: CutAssignment;
  strength: StrengthAssignment;
  final: FinalAssignment;
}

@Component({
  selector: 'app-flow',
  templateUrl: './flow.component.html',
  styleUrls: ['./flow.component.css']
})
export class FlowComponent implements OnInit {
  assignments: IAssignments;

  constructor() {
  }

  ngOnInit() {
    this.assignments = {
      current: TestAssignment.alias,
      sequence: 1,
      test: new TestAssignment(),
      bc: new BoundaryConditionsAssignment(),
      xResults: new XResultsAssignment(),
      chart: new ChartAssignment(),
      cut: new CutAssignment(),
      strength: new StrengthAssignment(),
      final: new FinalAssignment()
    };
  }

  nextAssignment(event: any) {
    console.log('Going to next assignment: ', event);
    this.assignments.sequence++;
    switch (this.assignments.current) {
      case TestAssignment.alias:
        if(this.assignments.test.hasNext()) {
          this.assignments.test.next();
        } else {
          this.assignments.current = BoundaryConditionsAssignment.alias;
        }
        break;
      case BoundaryConditionsAssignment.alias:
        this.assignments.current = XResultsAssignment.alias;
        break;
      case XResultsAssignment.alias:
        this.assignments.current = ChartAssignment.alias;
        break;
      case ChartAssignment.alias:
        this.assignments.current = CutAssignment.alias;
        break;
      case CutAssignment.alias:
        if(event === -1) {
          this.assignments.current = ChartAssignment.alias;
        } else {
          this.assignments.current = StrengthAssignment.alias;
        }
        break;
      case StrengthAssignment.alias:
        this.assignments.current = FinalAssignment.alias;
        break;
      case FinalAssignment.alias:
        console.log('The end!');
        break;
    }
  }

}

export class BoundaryConditionsAssignment {
  static alias: string = "bc";
  inside: string;
  outside: string;
  constructor() {
    this.inside = 'значення граничних умов на внутрішньому контурі';
    this.outside = 'значення граничних умов на зовнішньому контурі';
  }
}

export class TestAssignment {
  static alias: string = "test";
  current: ITest;
  sequence: number;
  constructor() {
    this.sequence = 0;
    this.next()
  }
  hasNext(): boolean {
    return (this.sequence + 1) <= tests.length
  }
  next() {
    this.sequence++;
    if(this.sequence <= tests.length) {
      this.current = tests[this.sequence - 1];
    }
  }
}

export class XResultsAssignment {
  static alias: string = "x-results";
  results: ResultVariable[];
  constructor() {
    this.results = resultVariables.map(v => v)
  }
}

export class CutAssignment {
  static alias: string = "cut";
  cutVariables: ResultVariable[];
  constructor() {
    this.cutVariables = cutVariables.map(v => v)
  }
}

export class ChartAssignment {
  static alias: string = "chart";
  title: string = "Епюри";
  data: IChart[];
  constructor() {
    this.data = [
      this.c('W Прогин (1/1000 м)', 0, true),
      this.c('{phi}{ Кут повороту (1/1000 рад)}', 1),
      this.c('Mr Радіальний момент (кН)', 2, true),
      this.c('{M}{theta}{ Коловий момент (кН)}', 3, true),
      this.c('Qr Поперечна сила (кН/м)', 4)
    ];
  }

  c(_title: string, yIndex: number, _bottom: boolean = false, _positive: boolean = true) {
    return {
      title: _title,
      x: chartXData,
      y: chartYData[yIndex],
      bottom: _bottom,
      positive: _positive
    }
  }
}

export class StrengthAssignment {
  static alias: string = "strength";
  test: ITest;
  constructor() {
    this.test = strength
  }
}

export class FinalAssignment {
  static alias: string = "final";
}

const tests: ITest[] = [
  {
    id: 1,
    question: 'Коефіцієнт Пуассона – це',
    options: [
      { id: 1, type: 'words', value: 'Міра зміни поперечних розмірів ізотропного тіла при деформації розтягу', checked: true},
      { id: 2, type: 'words', value: 'Міра зміни відносної деформації по відношенню до нормального напруження', checked: false},
      { id: 3, type: 'words', value: 'Міра зміни видовження ізотропного тіла при деформації розтягу', checked: false},
      { id: 4, type: 'words', value: 'Відношення нормальних напружень при розтягу до поперечної деформації', checked: false}
    ],
    helpImg: null
  },
  {
    id: 2,
    question: 'Формула для визначення циліндричної жорсткості',
    options: [
      { id: 1, type: 'img', value: 'img/tasks/hardness/h1.png', checked: true},
      { id: 2, type: 'img', value: 'img/tasks/hardness/h2.png', checked: false},
      { id: 3, type: 'img', value: 'img/tasks/hardness/h3.png', checked: false},
      { id: 4, type: 'img', value: 'img/tasks/hardness/h4.png', checked: false}
    ],
    helpImg: null
  },
  {
    id: 3,
    question: 'У яких одиницях вимірюється Коефіцієнт Пуассона?',
    options: [
      { id: 1, type: 'words', value: 'кН*м', checked: true},
      { id: 2, type: 'words', value: 'м^2', checked: false},
      { id: 3, type: 'words', value: '1/м', checked: false},
      { id: 4, type: 'words', value: 'безрозмірна величина', checked: false}
    ],
    helpImg: null
  },
  {
    id: 4,
    question: 'Визначте до якого класу відноситься дана пластина:',
    options: [
      { id: 1, type: 'words', value: 'Товсті', checked: true},
      { id: 2, type: 'words', value: 'Тонкі', checked: false},
      { id: 3, type: 'words', value: 'Мембрани', checked: false}
    ],
    helpImg: 'img/class.png'
  }
];

const resultVariables: ResultVariable[] = [
  new ResultVariable('X1', -0.000135236664162284),
  new ResultVariable('X2', -0.0108033413408911),
  new ResultVariable('X3', -0.000317463155702189),
  new ResultVariable('X4', 0.0106428967041701)
];

const cutVariables: ResultVariable[] = [
  new ResultVariable('r', 0.1, 'Координати небезпечного перерізу', 'м'),
  new ResultVariable('{sigma}{r}', 0, 'Радіального нормального напруження', 'МПа'),
  new ResultVariable('{sigma}{theta}', 58.1, 'Колового нормального напруження', 'МПа'),
  new ResultVariable('{sigma}{екв}', 58.1, 'Еквівалентного нормального напруження', 'МПа'),
  new ResultVariable('{tau}{max}', -0.4, 'Максимальних дотичних напружень', 'МПа')
];

const chartXData = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1];

const chartYData = [
  [11.269, 10.733, 10.081, 9.268, 8.291, 7.160, 5.892, 4.511, 3.046, 1.530, 0.000],
  [-5.280, -5.795, -7.301, -8.959, -10.567, -12.031, -13.286, -14.280, -14.965, -15.298, -15.233],
  [0.000, 1.721, 1.960, 1.942, 1.822, 1.636, 1.398, 1.113, 0.784, 0.413, 0.000],
  [4.685, 2.915, 2.551, 2.376, 2.240, 2.106, 1.964, 1.807, 1.632, 1.440, 1.229],
  [0.000, -0.750, -1.333, -1.875, -2.400, -2.917, -3.429, -3.938, -4.444, -4.950, -5.455]
];

const strength: ITest = {
  id: 3,
  question: 'Чи забезпечується міцність перерізу?',
  options: [
    { id: 1, type: 'words', value: 'Забезпечується', checked: true},
    { id: 2, type: 'words', value: 'Не забезпечується', checked: false}
  ],
  helpImg: null
};
