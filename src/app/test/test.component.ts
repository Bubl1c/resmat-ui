import { Component, OnInit } from '@angular/core';

export interface ITest {
  sequence: number;
  question: string;
  options: IOption[];
  correct: number;
  submitted: boolean;
}

export interface IOption {
  id: number;
  value: string;
  type: string;
  checked: boolean;
}

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  currentTest: ITest;
  correctAnswer: boolean;

  constructor() {
    this.currentTest = {
      sequence: 1,
      question: 'Коефіцієнт Пуассона – це',
      options: [
        { id: 1, type: 'words', value: 'Міра зміни поперечних розмірів ізотропного тіла при деформації розтягу', checked: true},
        { id: 2, type: 'words', value: 'Міра зміни відносної деформації по відношенню до нормального напруження', checked: false},
        { id: 3, type: 'words', value: 'Міра зміни видовження ізотропного тіла при деформації розтягу', checked: false},
        { id: 4, type: 'words', value: 'Відношення нормальних напружень при розтягу до поперечної деформації', checked: false}
      ],
      correct: 1,
      submitted: false
    }
  }

  ngOnInit() {
  }

  onOptionChecked(option: IOption) {
    this.currentTest.submitted = false;
    for (let opt of this.currentTest.options) {
      if(opt.id === option.id) {
        opt.checked = true;
        this.correctAnswer = opt.id === this.currentTest.correct;
      } else  {
        opt.checked = false;
      }
    }
  }

  submit() {
    this.currentTest.submitted = true;
  }

}
