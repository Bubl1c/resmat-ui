import { ITest, ITestCorrectOption } from "./exam.model";

import { InMemoryDbService } from "angular-in-memory-web-api";

export class TestsSeedData implements InMemoryDbService {
  createDb() {
    let tests = hardcoded_tests;
    return { tests };
  }
}

export const hardcoded_testCorrectOptions: ITestCorrectOption[] = [
  {
    id: 1,
    correct: 1
  },
  {
    id: 2,
    correct: 1
  },
  {
    id: 3,
    correct: 4
  },
  {
    id: 4,
    correct: 2
  }
];

export const hardcoded_tests: ITest[] = [
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
