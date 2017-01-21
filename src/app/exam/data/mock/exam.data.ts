import {
  ITestData, ITestAnswerData, TestTypes, IExamData, IExamStepData, ExamStepTypes
} from "../exam.api-protocol";
import { IExamTaskFlowStepData, TaskFlowStepTypes, ISchemaVar } from "../task-flow.api-protocol";
import { IExamTaskFlowTaskData } from "../i-exam-task-flow-task-data";
import { TestOption } from "../../components/test/test.component";
import { InputSetData, InputVariable, VarirableAnswer } from "../../components/input-set/input-set.component";
import { ExamResult } from "../../components/exam-results/exam-results.component";
export class ExamData {

  private static exam1 = ExamData.ed(1, 'Семестрова самостійна робота', 'Опис', ExamData.es(1, ExamStepTypes.Test, "Тестування"));
  private static task1 = ExamData.et(1, 1, 1, 1, 'Розрахунок тонкої кільцевої пластини', 'img/tasks/9.png',
    "Дуже цікавий опис поточного тестового завдання. Як його розв'язувати, на що звернути увагу щоб не помилитись!",
    [
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
    ]
  );

  private static user1 = ExamData.u(
    '1',
    'Андрій Можаровський',
    ExamData.exam1
  );

  public static users = [
    ExamData.user1,
    ExamData.u(
      '2',
      'Дмитро Левківський',
      ExamData.ed(1, 'Семестрова самостійна робота', 'Опис', ExamData.es(2, ExamStepTypes.TaskFlow, "Розв'язання задачі"))
    ),
    ExamData.u(
      '3',
      'Крістіна Гуменна',
      ExamData.ed(1, 'Семестрова самостійна робота', 'Опис', ExamData.es(3, ExamStepTypes.Results, "Результати"))
    )
  ];

  public static tests: ITestData[] = [
    {
      id: 1,
      question: 'Коефіцієнт Пуассона – це',
      type: TestTypes.Checkbox,
      helpImg: null,
      options: [
        new TestOption(1, 'words', 'Міра зміни поперечних розмірів ізотропного тіла при деформації розтягу'),
        new TestOption(2, 'words', 'Міра зміни відносної деформації по відношенню до нормального напруження'),
        new TestOption(3, 'words', 'Міра зміни видовження ізотропного тіла при деформації розтягу'),
        new TestOption(4, 'words', 'Відношення нормальних напружень при розтягу до поперечної деформації')
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

  public static exam_tasks: IExamTaskFlowTaskData[] = [ ExamData.task1 ];

  public static exam_task_flow_steps: IExamTaskFlowStepData[] = [
    ExamData.tfs(1, TaskFlowStepTypes.Test, 1, "", {
      id: 1,
      question: 'Визначте до якого класу відноситься дана пластина:',
      options: [
        { id: 1, type: 'words', value: 'Товсті', checked: true },
        { id: 2, type: 'words', value: 'Тонкі', checked: false },
        { id: 3, type: 'words', value: 'Мембрани', checked: false }
      ],
      helpImg: 'img/class.png',
      type: TestTypes.Radio
    }),
    ExamData.tfs(2, TaskFlowStepTypes.InputSet, 2, "", new InputSetData(1, 1, "Введіть невідомі значення:", [
      new InputVariable(1, "{mu}", "Group 1", "Lorem ipsum dolore lorem ipsum ipsum lorem", "var 1 units"),
      new InputVariable(2, "{phi}", "Group 1", "", "units"),
      new InputVariable(3, "var3", "Group 2", "nice var 3", "units"),
      new InputVariable(4, "var4", "Group 2", "nice var 4", "units")
    ])),
    ExamData.tfs(3, TaskFlowStepTypes.Finished, 3, "", {})
  ];

  public static exam_task_flow_step_answers = [
    {
      id: 1, //step id
      answer: ExamData.a(1, 2),
    },
    {
      id: 2,
      answer: [
        new VarirableAnswer(1, 2),
        new VarirableAnswer(2, 2),
        new VarirableAnswer(3, 2),
        new VarirableAnswer(4, 2)
      ]
    }
  ];

  public static exam_results = [
    new ExamResult(1, ExamData.exam1.name, ExamData.task1.name, ExamData.user1.name, "ІП-41М", 3, 5, 1, 3435634, 88, 100)
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

  private static tfs(id: number, type: string, seq: number, name: string, data: any): IExamTaskFlowStepData {
    return { id: id, type: type, sequence: seq, name: name, data: data };
  }

private static et(id: number,
                  examId: number,
                  version: number,
                  currentStep: number,
                  name: string,
                  schemaUrl: string,
                  description: string,
                  schemaVars: ISchemaVar[]): IExamTaskFlowTaskData {
  return {
    id: id,
    examId: examId,
    version: version,
    currentStep: currentStep,
    name: name,
    schemaUrl: schemaUrl,
    schemaVars: schemaVars,
    description: description
  };
}
}
