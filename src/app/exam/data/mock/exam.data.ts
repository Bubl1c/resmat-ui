import {
  ITestData, ITestAnswerData, TestTypes, IExamData, IExamStepData, ExamStepTypes
} from "../exam.api-protocol";
import { IExamTaskFlowStepData, TaskFlowStepTypes } from "../task-flow.api-protocol";
import { IExamTaskFlowTaskData } from "../i-exam-task-flow-task-data";
export class ExamData {

  public static users = [
    ExamData.u(
      '1',
      'Андрій Можаровський',
      ExamData.ed(1, 'Кільцева пластина', 'Опис', ExamData.es(1, ExamStepTypes.Test, "Тестування"))
    ),
    ExamData.u(
      '2',
      'Дмитро Левківський',
      ExamData.ed(1, 'Семестрова самостійна робота', 'Опис', ExamData.es(2, ExamStepTypes.TaskFlow, "Розв'язання задачі"))
    )
  ];

  public static tests: ITestData[] = [
    {
      id: 1,
      question: 'Коефіцієнт Пуассона – це',
      type: TestTypes.Checkbox,
      helpImg: null,
      options: [
        {
          id: 1,
          type: 'words',
          value: 'Міра зміни поперечних розмірів ізотропного тіла при деформації розтягу',
          checked: false
        },
        {
          id: 2,
          type: 'words',
          value: 'Міра зміни відносної деформації по відношенню до нормального напруження',
          checked: false
        },
        {
          id: 3,
          type: 'words',
          value: 'Міра зміни видовження ізотропного тіла при деформації розтягу',
          checked: false
        },
        {
          id: 4,
          type: 'words',
          value: 'Відношення нормальних напружень при розтягу до поперечної деформації',
          checked: false
        }
      ]
    },
    {
      id: 2,
      question: 'Формула для визначення циліндричної жорсткості',
      type: TestTypes.Radio,
      helpImg: null,
      options: [
        { id: 1, type: 'img', value: 'img/tasks/hardness/h1.png', checked: false },
        { id: 2, type: 'img', value: 'img/tasks/hardness/h2.png', checked: false },
        { id: 3, type: 'img', value: 'img/tasks/hardness/h3.png', checked: false },
        { id: 4, type: 'img', value: 'img/tasks/hardness/h4.png', checked: false }
      ]
    },
    {
      id: 3,
      question: 'У яких одиницях вимірюється Коефіцієнт Пуассона?',
      type: TestTypes.Radio,
      helpImg: null,
      options: [
        { id: 1, type: 'words', value: 'кН*м', checked: true },
        { id: 2, type: 'words', value: 'м^2', checked: false },
        { id: 3, type: 'words', value: '1/м', checked: false },
        { id: 4, type: 'words', value: 'безрозмірна величина', checked: false }
      ]
    }/*,
     {
     id: 4,
     question: 'Визначте до якого класу відноситься дана пластина:',
     options: [
     { id: 1, type: 'words', value: 'Товсті', checked: true },
     { id: 2, type: 'words', value: 'Тонкі', checked: false },
     { id: 3, type: 'words', value: 'Мембрани', checked: false }
     ],
     helpImg: 'img/class.png'
     }*/
  ];

  public static test_answers: ITestAnswerData[] = [
    ExamData.a(1, 1, 3),
    ExamData.a(2, 1),
    ExamData.a(3, 4)
  ];

  public static exam_tasks: IExamTaskFlowTaskData[] = [
    {
      id: 1,
      version: 1,
      currentStep: 1,
      examId: 1,
      name: 'Розрахунок тонкої кільцевої пластини',
      schemaUrl: 'img/tasks/9.png',
      schemaVars: [
        ExamData.v('Fa', '0', 'кН/м'),
        ExamData.v('Ma', '0', 'кНм/м'),
        ExamData.v('wa', '0', 'м'),
        ExamData.v('{phi}{a}', '0', 'рад'),

        ExamData.v('E', '10^5', 'МПа'),
        ExamData.v('{mu}', '0.2'),
        ExamData.v('q', '10', 'кН/м^2'),

        ExamData.v('Fb', '0', 'кН/м'),
        ExamData.v('Mb', '0', 'кНм/м'),
        ExamData.v('wb', '0', 'м'),
        ExamData.v('{phi}{b}', '0', 'рад'),

        ExamData.v('a', '0.1', 'м'),
        ExamData.v('b', '1.1', 'м'),
        ExamData.v('t', '22', 'мм')
      ],
      description: "Дуже цікавий опис поточного тестового завдання. " +
      "Як його розв'язувати, на що звернути увагу щоб не помилитись!"
    }
  ];

  public static exam_task_flow_steps: IExamTaskFlowStepData[] = [
    ExamData.tfs(1, TaskFlowStepTypes.Test, {
      id: 1,
      question: 'Визначте до якого класу відноситься дана пластина:',
      options: [
        { id: 1, type: 'words', value: 'Товсті', checked: true },
        { id: 2, type: 'words', value: 'Тонкі', checked: false },
        { id: 3, type: 'words', value: 'Мембрани', checked: false }
      ],
      helpImg: 'img/class.png'
    })
  ];

  private static a(testId: number, ...answer_args: number[]): ITestAnswerData {
    return { id: testId, answer: answer_args };
  }

  private static u(id: string, name: string, exam: IExamData) {
    return { id: id, name: name, exam: exam };
  }

  private static ed(id: number, name: string, description: string, currentStep: IExamStepData): IExamData {
    return { id: id, name: name, description: description, currentStep: currentStep };
  }

  private static es(sequence: number, type: string, description: string): IExamStepData {
    return { sequence: sequence, type: type, description: description }
  }

  private static v(name: string, value: string, units: string = '') {
    return { name: name, value: value, units: units };
  };

  private static tfs(id: number, type: string, data: any): IExamTaskFlowStepData {
    return { id: id, type: type, data: data };
  }

// private static et(id: number,
//                   version: number,
//                   currentStep: number,
//                   name: string,
//                   schemaUrl: string,
//                   schemaVars: ISchemaVar[],
//                   description: string): IExamTaskFlowTaskData {
//   return {
//     id: 1,
//     version: 1,
//     currentStep: 1,
//     name: 'Розрахунок тонкої кільцевої пластини',
//     schemaUrl: 'img/tasks/9.png',
//     schemaVars: [
//       ExamData.v('Fa', '0', 'кН/м'),
//       ExamData.v('Ma', '0', 'кНм/м'),
//       ExamData.v('wa', '0', 'м'),
//       ExamData.v('{phi}{a}', '0', 'рад'),
//
//       ExamData.v('E', '10^5', 'МПа'),
//       ExamData.v('{mu}', '0.2'),
//       ExamData.v('q', '10', 'кН/м^2'),
//
//       ExamData.v('Fb', '0', 'кН/м'),
//       ExamData.v('Mb', '0', 'кНм/м'),
//       ExamData.v('wb', '0', 'м'),
//       ExamData.v('{phi}{b}', '0', 'рад'),
//
//       ExamData.v('a', '0.1', 'м'),
//       ExamData.v('b', '1.1', 'м'),
//       ExamData.v('t', '22', 'мм')
//     ],
//     description: "Дуже цікавий опис поточного тестового завдання. " +
//     "Як його розв'язувати, на що звернути увагу щоб не помилитись!" };
// }
}
