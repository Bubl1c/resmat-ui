import { Component, OnInit } from '@angular/core';
import { ITest } from "../test/test.component";
import { IChart } from "../e-chart/e-chart.component";

export interface IAssignments {
  current: string;
  sequence: number;
  test: TestAssignment;
  bc: BoundaryConditionsAssignment;
  chart: ChartAssignment;
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
      current: ChartAssignment.alias,
      sequence: 1,
      test: new TestAssignment(),
      bc: new BoundaryConditionsAssignment(),
      chart: new ChartAssignment()
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
        this.assignments.current = ChartAssignment.alias;
        break;
      case ChartAssignment.alias:
        this.assignments.current = TestAssignment.alias;
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

export class ChartAssignment {
  static alias: string = "chart";
  title: string = "Епюри";
  data: IChart[];
  constructor() {
    this.data = [
      this.c('W 10^(-3)', 0, true),
      this.c('{phi}{ 10^(-3)}', 1),
      this.c('Mr', 2, true),
      this.c('{M}{theta}', 3, true),
      this.c('Qr', 4)
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

const tests: ITest[] = [
  {
    id: 2,
    question: 'Формула для визначення циліндричної жорсткості',
    options: [
      { id: 1, type: 'img', value: 'img/tasks/hardness/h1.png', checked: true},
      { id: 2, type: 'img', value: 'img/tasks/hardness/h2.png', checked: false},
      { id: 3, type: 'img', value: 'img/tasks/hardness/h3.png', checked: false},
      { id: 4, type: 'img', value: 'img/tasks/hardness/h4.png', checked: false}
    ],
    correctOption: 1
  },
  {
    id: 1,
    question: 'Коефіцієнт Пуассона – це',
    options: [
      { id: 1, type: 'words', value: 'Міра зміни поперечних розмірів ізотропного тіла при деформації розтягу', checked: true},
      { id: 2, type: 'words', value: 'Міра зміни відносної деформації по відношенню до нормального напруження', checked: false},
      { id: 3, type: 'words', value: 'Міра зміни видовження ізотропного тіла при деформації розтягу', checked: false},
      { id: 4, type: 'words', value: 'Відношення нормальних напружень при розтягу до поперечної деформації', checked: false}
    ],
    correctOption: 1
  }
];

const chartXData = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1];

const chartYData = [
  [11.269, 10.733, 10.081, 9.268, 8.291, 7.160, 5.892, 4.511, 3.046, 1.530, 0.000],
  [-5.280, -5.795, -7.301, -8.959, -10.567, -12.031, -13.286, -14.280, -14.965, -15.298, -15.233],
  [0.000, 1.721, 1.960, 1.942, 1.822, 1.636, 1.398, 1.113, 0.784, 0.413, 0.000],
  [4.685, 2.915, 2.551, 2.376, 2.240, 2.106, 1.964, 1.807, 1.632, 1.440, 1.229],
  [0.000, -0.750, -1.333, -1.875, -2.400, -2.917, -3.429, -3.938, -4.444, -4.950, -5.455]
];
