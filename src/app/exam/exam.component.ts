import { Component, OnInit } from '@angular/core';
import { ExamService } from "./exam-service.service";

export interface ISchemaVar {
  name: string;
  value: string;
  units: string;
}

export interface IExam {
  code: string;
  name: string;
  schemaUrl: string;
  schemaVars: ISchemaVar[];
  description: string;
}

@Component({
  selector: 'app-exam',
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.css'],
  providers: [ExamService]
})
export class ExamComponent implements OnInit {
  errorMessage: string;
  exam: IExam;

  constructor(private examService: ExamService) {
    this.errorMessage = '';
  }

  loadExam(code: string) {
    this.examService.getExams().subscribe(
      (exams: IExam[]) => {
        console.log('Exams are loaded: ', exams);
        let loadedExam = exams[0];
        if(loadedExam) {
          loadedExam.schemaVars = loadedExam.schemaVars.map(schemaVar => MathSymbolConverter.convert(schemaVar))
        }
        this.exam = loadedExam;
      },
      error =>  this.errorMessage = <any>error);
  }

  ngOnInit() {
    this.loadExam('eef')
  }

}

export class MathSymbolConverter {
  private static mappings = {
    mu: '&mu;',
    phi: '&phi;',
    theta: '&Theta;'
  };

  private static specialSymbolMark = "{";
  private static matchingRegex = /[^{}]+(?=\})/g;

  static convert(schemaVar: ISchemaVar): ISchemaVar {
    if(schemaVar.name.indexOf(this.specialSymbolMark) === -1) {
      return schemaVar;
    }
    let letters: string[] = schemaVar.name.match(this.matchingRegex);
    let mappedLetters = letters.map(ltr => this.mapLetter(ltr));
    schemaVar.name = mappedLetters.join('');
    return schemaVar;
  }

  static convertString(str: string): string {
    if(str.indexOf(this.specialSymbolMark) === -1) {
      return str;
    }
    let letters: string[] = str.match(this.matchingRegex);
    let mappedLetters = letters.map(ltr => this.mapLetter(ltr));
    str = mappedLetters.join('');
    return str;
  }

  private static mapLetter(letter: string): string {
    let mapped = this.mappings[letter];
    if(mapped) {
      return mapped;
    } else {
      return letter;
    }
  }
}
