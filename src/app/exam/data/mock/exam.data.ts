import {
  ITestAnswerData, TestTypes, IExamData, IExamStepPreview, ExamStepTypes, ITestDto
} from "../exam.api-protocol";
import { IExamTaskFlowStepData, TaskFlowStepTypes, ISchemaVar } from "../task-flow.api-protocol";
import { IExamTaskFlowTaskData } from "../i-exam-task-flow-task-data";
import { TestOption } from "../../components/test/test.component";
import { InputSetData, InputVariable, VarirableAnswer } from "../../components/input-set/input-set.component";
import { ExamResult } from "../../components/exam-results/exam-results.component";
import { ChartSet } from "../../components/chart-set/chart-set.component";
export class ExamData {

  private static exam1 = ExamData.ed(1, 'Семестрова самостійна робота', 'Опис', ExamData.es(1, ExamStepTypes.TestSet, "Тестування"));
  private static task1 = ExamData.et(1, 1, 1, 1, 'Розрахунок кільцевої пластини', 'img/tasks/9.png',
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

  private static chartXData = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1];

  private static chartYData = [
    [11.269, 10.733, 10.081, 9.268, 8.291, 7.160, 5.892, 4.511, 3.046, 1.530, 0.000],
    [-5.280, -5.795, -7.301, -8.959, -10.567, -12.031, -13.286, -14.280, -14.965, -15.298, -15.233],
    [0.000, 1.721, 1.960, 1.942, 1.822, 1.636, 1.398, 1.113, 0.784, 0.413, 0.000],
    [4.685, 2.915, 2.551, 2.376, 2.240, 2.106, 1.964, 1.807, 1.632, 1.440, 1.229],
    [0.000, -0.750, -1.333, -1.875, -2.400, -2.917, -3.429, -3.938, -4.444, -4.950, -5.455]
  ];

  public static task_flow_charts = [
    ExamData.chart('W Прогин (1/1000 м)', 0, true),
    ExamData.chart('{phi}{ Кут повороту (1/1000 рад)}', 1),
    ExamData.chart('Mr Радіальний момент (кН)', 2, true),
    ExamData.chart('{M}{theta}{ Коловий момент (кН)}', 3, true),
    ExamData.chart('Qr Поперечна сила (кН/м)', 4)
  ];

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

  public static tests: ITestDto[] = [
    {
      id: 1,
      groupId: 1,
      question: 'Коефіцієнт Пуассона – це',
      testType: TestTypes.Checkbox,
      help: null,
      options: [
        new TestOption(1, 'words', 'Міра зміни поперечних розмірів ізотропного тіла при деформації розтягу'),
        new TestOption(2, 'words', 'Міра зміни відносної деформації по відношенню до нормального напруження'),
        new TestOption(3, 'words', 'Міра зміни видовження ізотропного тіла при деформації розтягу'),
        new TestOption(4, 'words', 'Відношення нормальних напружень при розтягу до поперечної деформації')
      ]
    },
    {
      id: 2,
      groupId: 1,
      question: 'Формула для визначення циліндричної жорсткості',
      testType: TestTypes.Radio,
      help: null,
      options: [
        new TestOption(1, 'img', 'img/tasks/hardness/h1.png'),
        new TestOption(2, 'img', 'img/tasks/hardness/h2.png'),
        new TestOption(3, 'img', 'img/tasks/hardness/h3.png'),
        new TestOption(4, 'img', 'img/tasks/hardness/h4.png')
      ]
    },
    {
      id: 3,
      groupId: 1,
      question: 'У яких одиницях вимірюється Коефіцієнт Пуассона?',
      testType: TestTypes.Radio,
      help: null,
      options: [
        new TestOption(1, 'words', 'кН*м'),
        new TestOption(2, 'words', 'м^2'),
        new TestOption(3, 'words', '1/м'),
        new TestOption(4, 'words', 'безрозмірна величина')
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
        new TestOption(1, 'words', 'Товсті'),
        new TestOption(2, 'words', 'Тонкі'),
        new TestOption(3, 'words', 'Мембрани')
      ],
      help: 'img/class.png',
      testType: TestTypes.Radio
    }),
    ExamData.tfs(2, TaskFlowStepTypes.InputSet, 2,
      "Введіть значення граничних умов, якщо умова невідома - залиште поле пустим",
      new InputSetData(1, -1, "", [
        new InputVariable(1, 'w(a)', "На внутрішньому контурі", 'м'),
        new InputVariable(2, '{phi}{(a)}', "На внутрішньому контурі", 'рад'),
        new InputVariable(3, 'Mr(a)', "На внутрішньому контурі", 'кНм/м'),
        new InputVariable(4, 'Qr(a)', "На внутрішньому контурі", 'кН/м'),

        new InputVariable(5, 'w(b)', "На зовнішньому контурі", 'м'),
        new InputVariable(6, '{phi}{(b)}', "На зовнішньому контурі", 'рад'),
        new InputVariable(7, 'Mr(b)', "На зовнішньому контурі", 'кНм/м'),
        new InputVariable(8, 'Qr(b)', "На зовнішньому контурі", 'кН/м')
      ])
    ),
    ExamData.tfs(3, TaskFlowStepTypes.InputSet, 3,
      "Введіть пораховані значення невідомих Х",
      new InputSetData(2, -1, "", [
        new InputVariable(1, 'X1', '', '', '', true, 2),
        new InputVariable(2, 'X2', '', '', '', true, 2),
        new InputVariable(3, 'X3', '', '', '', true, 2),
        new InputVariable(4, 'X4', '', '', '', true, 2)
      ])
    ),
    ExamData.tfs(4, TaskFlowStepTypes.Charts, 4, "Епюри", new ChartSet("Епюри", ExamData.task_flow_charts), true),
    ExamData.tfs(5, TaskFlowStepTypes.InputSet, 5,
      "Введіть пораховані значення",
      new InputSetData(3, -1, "", [
        new InputVariable(1, 'r', '', 'м', 'Координати небезпечного перерізу', true),
        new InputVariable(2, '{sigma}{r}', '', 'МПа', 'Радіального нормального напруження', true),
        new InputVariable(3, '{sigma}{theta}', '', 'МПа', 'Колового нормального напруження', true),
        new InputVariable(4, '{sigma}{екв}', '', 'МПа', 'Еквівалентного нормального напруження', true),
        new InputVariable(5, '{tau}{max}', '', 'МПа', 'Максимальних дотичних напружень', true)
      ])
    ),
    ExamData.tfs(6, TaskFlowStepTypes.Test, 6, "", {
      id: 1,
      groupId: 1,
      question: 'Чи забезпечуться міцність перерізу?',
      options: [
        new TestOption(1, 'words', 'Забезпечується'),
        new TestOption(2, 'words', 'Не забезпечується')
      ],
      testType: TestTypes.Radio
    }),
    ExamData.tfs(7, TaskFlowStepTypes.Finished, 7, "", {})
  ];

  public static exam_task_flow_step_answers = [
    {
      id: 1, //step id
      stepType: TaskFlowStepTypes.Test,
      answer: ExamData.a(1, 2),
    },
    {
      id: 2,
      stepType: TaskFlowStepTypes.InputSet,
      answer: [
        new VarirableAnswer(1, null),
        new VarirableAnswer(2, null),
        new VarirableAnswer(3, 0),
        new VarirableAnswer(4, 0),
        new VarirableAnswer(5, null),
        new VarirableAnswer(6, null),
        new VarirableAnswer(7, null),
        new VarirableAnswer(8, null)
      ]
    },
    {
      id: 3,
      stepType: TaskFlowStepTypes.InputSet,
      answer: [
        // new VarirableAnswer(1, -0.000135236664162284),
        // new VarirableAnswer(2, -0.0108533413408911),
        // new VarirableAnswer(3, -0.000317463155702189),
        // new VarirableAnswer(4, 0.0106428967041701)
        new VarirableAnswer(1, 1),
        new VarirableAnswer(2, 1),
        new VarirableAnswer(3, 1),
        new VarirableAnswer(4, 1)
      ]
    },
    {
      id: 5,
      stepType: TaskFlowStepTypes.InputSet,
      answer: [
        // new VarirableAnswer(1, 0.1),
        // new VarirableAnswer(2, 0),
        // new VarirableAnswer(3, 58.1),
        // new VarirableAnswer(4, 58.1),
        // new VarirableAnswer(5, -0.4)
        new VarirableAnswer(1, 1),
        new VarirableAnswer(2, 1),
        new VarirableAnswer(3, 1),
        new VarirableAnswer(4, 1),
        new VarirableAnswer(5, 1)
      ]
    },
    {
      id: 6,
      stepType: TaskFlowStepTypes.Test,
      answer: ExamData.a(1, 2),
    },
  ];

  public static exam_results = [
    new ExamResult(1, ExamData.exam1.name, ExamData.task1.name, ExamData.user1.name, "ІП-41М", 3, 5, 1, 3435634, 88, 100)
  ];

  private static chart(_title: string, yIndex: number, _bottom: boolean = false, _positive: boolean = true) {
    return {
      title: _title,
      x: ExamData.chartXData,
      y: ExamData.chartYData[yIndex],
      bottom: _bottom,
      positive: _positive
    }
  }

  private static a(testId: number, ...answer_args: number[]): ITestAnswerData {
    return { id: testId, answer: answer_args };
  }

  private static u(id: string, name: string, exam: IExamData) {
    return { id: id, name: name, exam: exam };
  }

  private static ed(id: number, name: string, description: string, currentStep: IExamStepPreview): IExamData {
    return { id: id, name: name, description: description, currentStep: currentStep };
  }

  private static es(sequence: number, type: string, description: string): IExamStepPreview {
    return { sequence: sequence, type: type, description: description }
  }

  private static v(name: string, value: string, units: string = '') {
    return { name: name, value: value, units: units };
  };

  private static tfs(id: number, type: string, seq: number, name: string, data: any, helpData: boolean = false): IExamTaskFlowStepData {
    return { id: id, type: type, sequence: seq, name: name, helpData: helpData, data: data };
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
