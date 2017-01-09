import { InMemoryDbService } from "angular-in-memory-web-api";

export class ExamSeedData implements InMemoryDbService {
  createDb() {
    function v(name: string, value: string, units: string = '') {
      return { name: name, value: value, units: units };
    }

    let exams = [
      {
        id: '123',
        name: 'Розрахунок тонкої кільцевої пластини',
        schemaUrl: 'img/tasks/9.png',
        schemaVars: [
          v('Fa', '0', 'кН/м'),
          v('Ma', '0', 'кНм/м'),
          v('wa', '0', 'м'),
          v('{phi}{a}', '0', 'рад'),

          v('E', '10^5', 'МПа'),
          v('{mu}', '0.2'),
          v('q', '10', 'кН/м^2'),

          v('Fb', '0', 'кН/м'),
          v('Mb', '0', 'кНм/м'),
          v('wb', '0', 'м'),
          v('{phi}{b}', '0', 'рад'),

          v('a', '0.1', 'м'),
          v('b', '1.1', 'м'),
          v('t', '22', 'мм')
        ],
        description: "Дуже цікавий опис поточного тестового завдання. " +
        "Як його розв'язувати, на що звернути увагу щоб не помилитись!"
      }
    ];

    return { exams };
  }
}
