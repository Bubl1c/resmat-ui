import { Component, OnInit } from '@angular/core';
import { ITest } from "../test/test.component";

export interface IAssignments {
  current: string;
  sequence: number;
  test: TestAssignment;
  bc: BoundaryConditionsAssignment;
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
      current: BoundaryConditionsAssignment.alias,
      sequence: 1,
      test: new TestAssignment(),
      bc: new BoundaryConditionsAssignment()
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
        console.log('Switch to another BoundaryConditionsAssignment');
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
